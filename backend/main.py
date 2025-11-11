from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Date, DECIMAL, TIMESTAMP, Text, func, desc
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from pydantic_settings import BaseSettings
from typing import List, Optional, Literal
import os
from datetime import date, datetime, timedelta
import chromadb
from sentence_transformers import SentenceTransformer
import openai
import anthropic
import requests
import google.generativeai as genai

# Settings
class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@postgres:5432/manbank"
    CHROMA_HOST: str = "chromadb"
    CHROMA_PORT: int = 8000
    MODEL_PROVIDER: Literal["gemini", "openai", "anthropic"] = "gemini"
    GOOGLE_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()

# Configure Gemini if API key is provided
if settings.GOOGLE_API_KEY:
    genai.configure(api_key=settings.GOOGLE_API_KEY)

# Database setup (PostgreSQL solo para datos estructurados)
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ChromaDB setup
chroma_client = chromadb.HttpClient(host=settings.CHROMA_HOST, port=settings.CHROMA_PORT)
try:
    collection = chroma_client.get_or_create_collection(
        name="transactions",
        metadata={"description": "Financial transactions embeddings"}
    )
except Exception as e:
    print(f"Warning: Could not connect to ChromaDB: {e}")
    collection = None

# Embedding model (universal para todo el sistema)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# SQLAlchemy Models (sin embeddings, solo datos estructurados)
class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    amount = Column(DECIMAL(15,2), nullable=False)
    description = Column(Text)
    account_id = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    category = Column(String(100))

class PipelineRun(Base):
    __tablename__ = "pipeline_runs"
    id = Column(Integer, primary_key=True, index=True)
    run_date = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    status = Column(String(50), nullable=False)
    records_processed = Column(Integer, nullable=False, default=0)

# Pydantic Models
class TransactionResponse(BaseModel):
    id: int
    date: date
    amount: float
    description: Optional[str]
    account_id: str
    type: str
    category: Optional[str]

class PipelineStatus(BaseModel):
    last_run_date: Optional[datetime]
    status: Optional[str]
    records_processed: Optional[int]

class KPIMetrics(BaseModel):
    total_moved_month: float
    total_savings_inflow: float
    total_outflow_month: float
    category_distribution: dict
    top_inflow_accounts: List[dict]
    monthly_trend: List[dict]
    spending_by_category: dict

class AskRAGRequest(BaseModel):
    question: str
    provider: Optional[Literal["gemini", "openai", "anthropic"]] = None

class AskRAGResponse(BaseModel):
    answer: str
    provider: str
    sources: List[dict]

class InsightResponse(BaseModel):
    insight: str
    provider: str

class ModelConfigResponse(BaseModel):
    current_provider: str
    available_providers: List[str]

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper: Generate embeddings
def generate_embedding(text: str) -> List[float]:
    """Generate embedding using sentence-transformers (consistente en todo el sistema)"""
    return embedding_model.encode(text).tolist()

# Helper: Generate LLM response based on provider
def generate_llm_response(prompt: str, provider: Optional[str] = None) -> str:
    """Generate response using configured LLM provider"""
    provider = provider or settings.MODEL_PROVIDER
    
    try:
        if provider == "gemini":
            if not settings.GOOGLE_API_KEY:
                raise HTTPException(status_code=400, detail="Google API key not configured")
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            return response.text
            
        elif provider == "openai":
            if not settings.OPENAI_API_KEY:
                raise HTTPException(status_code=400, detail="OpenAI API key not configured")
            openai.api_key = settings.OPENAI_API_KEY
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500
            )
            return response.choices[0].message.content
            
        elif provider == "anthropic":
            if not settings.ANTHROPIC_API_KEY:
                raise HTTPException(status_code=400, detail="Anthropic API key not configured")
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            response = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
            
        else:
            raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

# Helper: Get KPIs data (mejorado con más métricas)
def get_kpis_data(db: Session):
    current_month = date.today().replace(day=1)
    last_month = (current_month - timedelta(days=1)).replace(day=1)
    
    # Total moved this month
    total_moved = db.query(func.sum(func.abs(Transaction.amount))).filter(
        Transaction.date >= current_month
    ).scalar() or 0
    
    # Total outflow this month
    total_outflow = db.query(func.sum(Transaction.amount)).filter(
        Transaction.date >= current_month,
        Transaction.type == "outflow"
    ).scalar() or 0

    # Total savings inflow (all time)
    savings_inflow = db.query(func.sum(Transaction.amount)).filter(
        Transaction.type == "inflow",
        Transaction.category == "savings"
    ).scalar() or 0

    # Category distribution
    category_dist = db.query(
        Transaction.category, 
        func.count(Transaction.id)
    ).group_by(Transaction.category).all()
    category_distribution = {cat: count for cat, count in category_dist if cat}

    # Spending by category (only outflows)
    spending_by_cat = db.query(
        Transaction.category,
        func.sum(func.abs(Transaction.amount))
    ).filter(
        Transaction.type == "outflow"
    ).group_by(Transaction.category).all()
    spending_by_category = {cat: float(amount) for cat, amount in spending_by_cat if cat}

    # Top inflow accounts
    top_accounts = db.query(
        Transaction.account_id, 
        func.sum(Transaction.amount)
    ).filter(
        Transaction.type == "inflow"
    ).group_by(Transaction.account_id).order_by(
        desc(func.sum(Transaction.amount))
    ).limit(5).all()
    top_inflow_accounts = [{"account_id": acc[:12] + "...", "total": float(total)} for acc, total in top_accounts]

    # Monthly trend (last 6 months)
    six_months_ago = (current_month - timedelta(days=180)).replace(day=1)
    monthly_data = db.query(
        func.date_trunc('month', Transaction.date).label('month'),
        func.sum(Transaction.amount).filter(Transaction.type == "inflow").label('inflow'),
        func.sum(func.abs(Transaction.amount)).filter(Transaction.type == "outflow").label('outflow')
    ).filter(
        Transaction.date >= six_months_ago
    ).group_by('month').order_by('month').all()
    
    monthly_trend = [{
        "month": str(row.month.date()) if row.month else "",
        "inflow": float(row.inflow or 0),
        "outflow": float(row.outflow or 0)
    } for row in monthly_data]

    return {
        "total_moved_month": float(total_moved),
        "total_savings_inflow": float(savings_inflow),
        "total_outflow_month": float(abs(total_outflow)),
        "category_distribution": category_distribution,
        "top_inflow_accounts": top_inflow_accounts,
        "monthly_trend": monthly_trend,
        "spending_by_category": spending_by_category
    }

# FastAPI App
app = FastAPI(
    title="ManBank API",
    description="Financial Transaction Analysis API with RAG and Multi-Provider LLM Support",
    version="2.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoints
@app.get("/")
def read_root():
    return {
        "message": "Welcome to ManBank API v2.0",
        "features": ["RAG", "Multi-provider LLM", "ChromaDB", "Advanced Analytics"]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "chromadb": "connected" if collection else "disconnected",
        "provider": settings.MODEL_PROVIDER
    }

@app.get("/config/model", response_model=ModelConfigResponse)
def get_model_config():
    """Get current model configuration"""
    available = []
    if settings.GOOGLE_API_KEY:
        available.append("gemini")
    if settings.OPENAI_API_KEY:
        available.append("openai")
    if settings.ANTHROPIC_API_KEY:
        available.append("anthropic")
    
    return ModelConfigResponse(
        current_provider=settings.MODEL_PROVIDER,
        available_providers=available
    )

@app.get("/status/pipeline", response_model=PipelineStatus)
def get_pipeline_status(db: Session = Depends(get_db)):
    try:
        last_run = db.query(PipelineRun).order_by(desc(PipelineRun.run_date)).first()
        if last_run:
            return PipelineStatus(
                last_run_date=last_run.run_date,
                status=last_run.status,
                records_processed=last_run.records_processed
            )
        return PipelineStatus(last_run_date=None, status=None, records_processed=None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/kpis", response_model=KPIMetrics)
def get_kpis(db: Session = Depends(get_db)):
    try:
        data = get_kpis_data(db)
        return KPIMetrics(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/llm/ask_rag", response_model=AskRAGResponse)
def ask_rag(request: AskRAGRequest, db: Session = Depends(get_db)):
    try:
        if not collection:
            raise HTTPException(status_code=503, detail="ChromaDB not available")
        
        # Generate embedding for the question using all-MiniLM-L6-v2
        question_embedding = generate_embedding(request.question)
        
        # Search in ChromaDB
        results = collection.query(
            query_embeddings=[question_embedding],
            n_results=5
        )
        
        # Build context from results
        sources = []
        context_parts = []
        
        if results['documents'] and results['documents'][0]:
            for i, doc in enumerate(results['documents'][0]):
                metadata = results['metadatas'][0][i] if results['metadatas'] else {}
                context_parts.append(doc)
                sources.append({
                    "text": doc[:100] + "...",
                    "metadata": metadata
                })
        
        context = "\n".join(context_parts) if context_parts else "No hay transacciones relevantes."
        
        # Generate answer using selected provider
        prompt = f"""Eres un asistente financiero experto. Basándote en el siguiente contexto de transacciones bancarias, responde la pregunta del usuario de manera clara y concisa.

Contexto de transacciones:
{context}

Pregunta del usuario: {request.question}

Responde en español, siendo preciso y profesional. Si el contexto no tiene suficiente información, indícalo."""

        answer = generate_llm_response(prompt, request.provider)
        provider_used = request.provider or settings.MODEL_PROVIDER
        
        return AskRAGResponse(
            answer=answer,
            provider=provider_used,
            sources=sources
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/llm/generate_insight", response_model=InsightResponse)
def generate_insight(
    db: Session = Depends(get_db),
    provider: Optional[Literal["gemini", "openai", "anthropic"]] = None
):
    try:
        # Get KPIs
        kpis = get_kpis_data(db)
        
        prompt = f"""Eres un analista financiero senior. Genera un insight ejecutivo (máximo 4 líneas) basado en los siguientes KPIs:

- Total movido este mes: ${kpis['total_moved_month']:,.2f}
- Egresos este mes: ${kpis['total_outflow_month']:,.2f}
- Ahorros acumulados: ${kpis['total_savings_inflow']:,.2f}
- Distribución por categoría: {kpis['category_distribution']}
- Top cuentas de ingreso: {kpis['top_inflow_accounts']}

Genera un resumen ejecutivo profesional en español, destacando lo más relevante."""

        insight = generate_llm_response(prompt, provider)
        provider_used = provider or settings.MODEL_PROVIDER
        
        return InsightResponse(insight=insight, provider=provider_used)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Transaction)
        if start_date:
            query = query.filter(Transaction.date >= start_date)
        if end_date:
            query = query.filter(Transaction.date <= end_date)
        if category:
            query = query.filter(Transaction.category == category)
        if type:
            query = query.filter(Transaction.type == type)

        transactions = query.order_by(desc(Transaction.date)).offset(skip).limit(limit).all()
        return [TransactionResponse(
            id=t.id,
            date=t.date,
            amount=float(t.amount),
            description=t.description,
            account_id=t.account_id,
            type=t.type,
            category=t.category
        ) for t in transactions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/categories")
def get_categories(db: Session = Depends(get_db)):
    """Get list of all categories"""
    try:
        categories = db.query(Transaction.category).distinct().all()
        return {"categories": [c[0] for c in categories if c[0]]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
