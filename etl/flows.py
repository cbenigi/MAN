import polars as pl
from prefect import flow, task
import hashlib
from sentence_transformers import SentenceTransformer
import psycopg2
import chromadb
from datetime import datetime
import os

# Configuration
DB_URL = os.getenv("DATABASE_URL", "postgresql://user:password@postgres:5432/manbank")
CHROMA_HOST = os.getenv("CHROMA_HOST", "chromadb")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", "8000"))

# Initialize embedding model (mismo que en backend)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize ChromaDB client
chroma_client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)

@task
def ingest_data(file_path: str) -> pl.DataFrame:
    """Detect format and load data using Polars."""
    if file_path.endswith('.csv'):
        df = pl.read_csv(file_path)
    elif file_path.endswith('.xlsx'):
        df = pl.read_excel(file_path)
    else:
        raise ValueError(f"Unsupported file format for {file_path}")
    return df

@task
def normalize_data(df: pl.DataFrame) -> pl.DataFrame:
    """Standardize columns to schema: date, amount, description, account_id_raw, type."""
    required_cols = ['date', 'amount', 'description', 'account_id_raw', 'type']
    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")
    
    # Ensure date is proper format
    if df['date'].dtype != pl.Date:
        df = df.with_columns(pl.col('date').str.to_date())
    
    return df.select(required_cols)

@task
def pseudonymize_data(df: pl.DataFrame) -> pl.DataFrame:
    """Hash account_id_raw to account_id using SHA-256 for privacy."""
    df = df.with_columns(
        pl.col('account_id_raw').map_elements(
            lambda x: hashlib.sha256(str(x).encode()).hexdigest(),
            return_dtype=pl.Utf8
        ).alias('account_id')
    )
    return df

@task
def classify_descriptions(df: pl.DataFrame) -> pl.DataFrame:
    """Classify description into categories using simple rules."""
    def classify(desc):
        desc_lower = str(desc).lower()
        if 'nomina' in desc_lower or 'salary' in desc_lower or 'salario' in desc_lower:
            return 'Nómina'
        elif 'transfer' in desc_lower or 'transferencia' in desc_lower:
            return 'Transferencia'
        elif 'super' in desc_lower or 'market' in desc_lower or 'grocery' in desc_lower or 'mercado' in desc_lower:
            return 'Supermercado'
        elif 'restaurant' in desc_lower or 'comida' in desc_lower or 'food' in desc_lower:
            return 'Restaurantes'
        elif 'transport' in desc_lower or 'uber' in desc_lower or 'taxi' in desc_lower or 'gasolina' in desc_lower:
            return 'Transporte'
        elif 'saving' in desc_lower or 'ahorro' in desc_lower:
            return 'savings'
        elif 'utility' in desc_lower or 'servicio' in desc_lower or 'bill' in desc_lower:
            return 'Servicios'
        else:
            return 'Otros'
    
    df = df.with_columns(
        pl.col('description').map_elements(classify, return_dtype=pl.Utf8).alias('category')
    )
    return df

@task
def generate_embeddings(df: pl.DataFrame) -> pl.DataFrame:
    """Generate vector embeddings using sentence-transformers (all-MiniLM-L6-v2)."""
    # Combinar descripción, categoría y tipo para contexto semántico más rico
    texts = (
        df['description'].cast(pl.Utf8) + ' ' + 
        df['category'].cast(pl.Utf8) + ' ' +
        df['type'].cast(pl.Utf8)
    ).to_list()
    
    # Generate embeddings
    embeddings = embedding_model.encode(texts, show_progress_bar=True)
    
    # Add embeddings as list column
    df = df.with_columns(
        pl.Series('embedding', embeddings.tolist(), dtype=pl.List(pl.Float32))
    )
    return df

@task
def insert_data_postgres(df: pl.DataFrame, db_url: str):
    """Insert structured data into PostgreSQL (sin embeddings)."""
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Preparar datos sin la columna embedding
    for row in df.iter_rows(named=True):
        cur.execute(
            """INSERT INTO transactions 
            (date, amount, description, account_id, type, category) 
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id""",
            (
                row['date'], 
                row['amount'], 
                row['description'], 
                row['account_id'], 
                row['type'], 
                row['category']
            )
        )
    
    conn.commit()
    cur.close()
    conn.close()

@task
def insert_embeddings_chromadb(df: pl.DataFrame):
    """Insert embeddings into ChromaDB."""
    # Get or create collection
    collection = chroma_client.get_or_create_collection(
        name="transactions",
        metadata={"description": "Financial transactions embeddings"}
    )
    
    # Prepare data for ChromaDB
    documents = []
    embeddings = []
    metadatas = []
    ids = []
    
    for idx, row in enumerate(df.iter_rows(named=True)):
        # Create rich document text
        doc_text = f"{row['date']} - {row['type'].upper()}: {row['description']} (Categoría: {row['category']}, Monto: ${row['amount']})"
        documents.append(doc_text)
        embeddings.append(row['embedding'])
        
        # Metadata para filtros y contexto
        metadatas.append({
            'date': str(row['date']),
            'amount': str(row['amount']),
            'category': row['category'],
            'type': row['type'],
            'account_id': row['account_id'][:16]  # Shortened for storage
        })
        
        # Generate unique ID
        ids.append(f"tx_{datetime.now().timestamp()}_{idx}")
    
    # Add to ChromaDB in batches
    batch_size = 1000
    for i in range(0, len(documents), batch_size):
        collection.add(
            documents=documents[i:i+batch_size],
            embeddings=embeddings[i:i+batch_size],
            metadatas=metadatas[i:i+batch_size],
            ids=ids[i:i+batch_size]
        )
    
    print(f"✅ Inserted {len(documents)} embeddings into ChromaDB")

@task
def monitor_run(status: str, record_count: int, db_url: str, error_msg: str = None):
    """Log run status and record count to pipeline_runs table."""
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO pipeline_runs (status, records_processed, error_message) VALUES (%s, %s, %s)",
        (status, record_count, error_msg)
    )
    conn.commit()
    cur.close()
    conn.close()

@flow(name="manbank-etl-pipeline")
def etl_pipeline(file_path: str, db_url: str = DB_URL, last_date: str = None):
    """
    Main ETL flow orchestrating all tasks with incremental processing.
    
    Args:
        file_path: Path to CSV or Excel file with transactions
        db_url: PostgreSQL connection URL
        last_date: Optional date filter for incremental processing (YYYY-MM-DD)
    """
    try:
        print(f"🚀 Starting ETL pipeline for {file_path}")
        
        # 1. Ingest
        df = ingest_data(file_path)
        print(f"📊 Loaded {len(df)} records")
        
        # 2. Incremental filter
        if last_date:
            df = df.filter(pl.col('date') > pl.lit(last_date))
            print(f"📅 Filtered to {len(df)} records after {last_date}")
        
        # 3. Normalize
        df = normalize_data(df)
        print("✅ Data normalized")
        
        # 4. Pseudonymize
        df = pseudonymize_data(df)
        print("🔒 Account IDs pseudonymized")
        
        # 5. Classify
        df = classify_descriptions(df)
        print("🏷️  Descriptions classified")
        
        # 6. Generate embeddings
        df = generate_embeddings(df)
        print("🧠 Embeddings generated with all-MiniLM-L6-v2")
        
        # 7. Insert into PostgreSQL (datos estructurados)
        insert_data_postgres(df, db_url)
        print("💾 Data inserted into PostgreSQL")
        
        # 8. Insert into ChromaDB (embeddings)
        insert_embeddings_chromadb(df)
        print("🔍 Embeddings inserted into ChromaDB")
        
        # 9. Monitor
        record_count = len(df)
        monitor_run('success', record_count, db_url)
        print(f"✅ Pipeline completed successfully! Processed {record_count} records")
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Pipeline failed: {error_msg}")
        monitor_run('failed', 0, db_url, error_msg)
        raise e

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python flows.py <path_to_csv_or_excel>")
        print("Example: python flows.py /data/transactions.csv")
        sys.exit(1)
    
    file_path = sys.argv[1]
    etl_pipeline(file_path)
