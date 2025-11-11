-- Schema for ManBank (PostgreSQL)
-- Note: Embeddings are now stored in ChromaDB, not in PostgreSQL

-- Create transactions table (sin columna de embeddings)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    account_id VARCHAR(255) NOT NULL, -- pseudonymized account ID (hashed)
    type VARCHAR(50) NOT NULL, -- inflow or outflow
    category VARCHAR(100), -- transaction category
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pipeline_runs table for monitoring
CREATE TABLE pipeline_runs (
    id SERIAL PRIMARY KEY,
    run_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL, -- success, failed, running
    records_processed INTEGER NOT NULL DEFAULT 0,
    error_message TEXT
);

-- Create indexes for performance
-- Index on transaction date for time-based queries
CREATE INDEX idx_transactions_date ON transactions (date DESC);

-- Index on account_id for account-based filtering
CREATE INDEX idx_transactions_account_id ON transactions (account_id);

-- Index on type for transaction type queries
CREATE INDEX idx_transactions_type ON transactions (type);

-- Index on category for category-based filtering
CREATE INDEX idx_transactions_category ON transactions (category);

-- Composite index for common queries
CREATE INDEX idx_transactions_date_type ON transactions (date DESC, type);
CREATE INDEX idx_transactions_date_category ON transactions (date DESC, category);

-- Index on pipeline_runs run_date for chronological ordering
CREATE INDEX idx_pipeline_runs_run_date ON pipeline_runs (run_date DESC);

-- Index on pipeline_runs status for status-based queries
CREATE INDEX idx_pipeline_runs_status ON pipeline_runs (status);

-- Insert sample configuration (opcional, para testing)
-- Este insert se puede usar para verificar que el schema funciona
INSERT INTO pipeline_runs (status, records_processed) VALUES ('initialized', 0);
