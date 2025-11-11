"use client";

import { useQuery } from "@tanstack/react-query";
import { ModelConfig, ModelProvider } from "../app/types";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ModelSelectorProps {
  selectedProvider: ModelProvider;
  onProviderChange: (provider: ModelProvider) => void;
}

export default function ModelSelector({ selectedProvider, onProviderChange }: ModelSelectorProps) {
  const { data, isLoading } = useQuery<ModelConfig>({
    queryKey: ["model-config"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/config/model`);
      if (!response.ok) throw new Error("Failed to fetch model config");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-bancolombia-gray-dark">
        <span>Cargando modelos...</span>
      </div>
    );
  }

  const providerLabels: Record<string, string> = {
    local: "Ollama (Local)",
    openai: "OpenAI",
    anthropic: "Anthropic Claude"
  };

  const providerDescriptions: Record<string, string> = {
    local: "Modelo local - Gratis, privado, requiere Ollama",
    openai: "GPT-4 Mini - Rápido y preciso",
    anthropic: "Claude Sonnet - Mejor razonamiento"
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-bancolombia-yellow">
      <h3 className="text-sm font-semibold text-bancolombia-black mb-3 uppercase">
        Proveedor de IA
      </h3>
      
      <div className="space-y-2">
        {data?.available_providers.map((provider) => (
          <label
            key={provider}
            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              selectedProvider === provider
                ? "border-bancolombia-yellow bg-yellow-50"
                : "border-gray-200 hover:border-bancolombia-yellow hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="model-provider"
              value={provider}
              checked={selectedProvider === provider}
              onChange={(e) => onProviderChange(e.target.value as ModelProvider)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-bancolombia-black">
                {providerLabels[provider] || provider}
              </div>
              <div className="text-xs text-bancolombia-gray-dark mt-1">
                {providerDescriptions[provider]}
              </div>
            </div>
          </label>
        ))}
      </div>

      {data?.available_providers.length === 1 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          Para usar OpenAI o Anthropic, configura las API keys en el backend (.env)
        </div>
      )}
    </div>
  );
}

