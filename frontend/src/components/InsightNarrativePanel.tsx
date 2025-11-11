"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InsightResponse, ModelProvider } from "../app/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function InsightNarrativePanel() {
  const [provider, setProvider] = useState<ModelProvider>("local");
  
  const { data, isLoading, error, refetch } = useQuery<InsightResponse>({
    queryKey: ["insight", provider],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/llm/generate_insight?provider=${provider}`);
      if (!response.ok) throw new Error("Failed to generate insight");
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) return (
    <div className="p-6 bg-white rounded-lg shadow-lg border-l-4 border-bancolombia-yellow">
      <h2 className="text-xl font-semibold text-bancolombia-black mb-4">Insights Ejecutivos</h2>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-red-800 mb-4">Insights Ejecutivos</h2>
      <p className="text-red-700">
        Error al generar insights. <button onClick={() => refetch()} className="underline font-medium">Reintentar</button>
      </p>
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border-l-4 border-bancolombia-yellow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-bancolombia-black">Insights Ejecutivos</h2>
        <div className="text-xs px-2 py-1 bg-bancolombia-gray-light text-bancolombia-gray-dark rounded border border-gray-300">
          {data?.provider === "local" ? "Ollama" :
           data?.provider === "openai" ? "OpenAI" :
           "Claude"}
        </div>
      </div>
      
      <div className="text-bancolombia-gray-dark leading-relaxed whitespace-pre-line mb-4">
        {data?.insight}
      </div>
      
      <button
        onClick={() => refetch()}
        className="w-full px-4 py-2 bg-bancolombia-yellow text-bancolombia-black rounded hover:bg-yellow-500 transition-colors font-medium"
      >
        Generar Nuevo Insight
      </button>
    </div>
  );
}
