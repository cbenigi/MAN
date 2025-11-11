export interface PipelineStatus {
  last_run_date: string | null;
  status: string | null;
  records_processed: number | null;
}

export interface KPIMetrics {
  total_moved_month: number;
  total_savings_inflow: number;
  total_outflow_month: number;
  category_distribution: Record<string, number>;
  top_inflow_accounts: Array<{
    account_id: string;
    total: number;
  }>;
  monthly_trend: Array<{
    month: string;
    inflow: number;
    outflow: number;
  }>;
  spending_by_category: Record<string, number>;
}

export interface InsightResponse {
  insight: string;
  provider: string;
}

export interface AskRAGRequest {
  question: string;
  provider?: "local" | "openai" | "anthropic";
}

export interface AskRAGResponse {
  answer: string;
  provider: string;
  sources: Array<{
    text: string;
    metadata: Record<string, any>;
  }>;
}

export interface ModelConfig {
  current_provider: string;
  available_providers: string[];
}

export type ModelProvider = "local" | "openai" | "anthropic";
