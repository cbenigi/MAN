"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AskRAGRequest, AskRAGResponse, ModelProvider } from "../app/types";
import ModelSelector from "./ModelSelector";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RagChatWidget() {
  const [question, setQuestion] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ModelProvider>("local");
  const [conversation, setConversation] = useState<Array<{
    question: string;
    answer: string;
    provider: string;
    sources?: Array<{text: string; metadata: Record<string, any>}>;
  }>>([]);

  const mutation = useMutation<AskRAGResponse, Error, AskRAGRequest>({
    mutationFn: async (request) => {
      const response = await fetch(`${API_BASE}/llm/ask_rag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to get answer");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setConversation(prev => [...prev, { 
        question, 
        answer: data.answer,
        provider: data.provider,
        sources: data.sources 
      }]);
      setQuestion("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      mutation.mutate({ 
        question: question.trim(),
        provider: selectedProvider 
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Model Selector */}
      <ModelSelector 
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
      />

      {/* Chat Widget */}
      <div className="p-6 bg-white rounded-lg shadow-lg border-l-4 border-bancolombia-yellow">
        <h2 className="text-xl font-semibold text-bancolombia-black mb-4">
          Asistente Financiero IA
        </h2>

        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {conversation.length === 0 && (
            <div className="text-center text-bancolombia-gray-dark py-8">
              <p className="text-sm">Pregúntame sobre tus transacciones...</p>
              <p className="text-xs mt-2 font-semibold">Ejemplos:</p>
              <ul className="text-xs mt-1 space-y-1">
                <li>¿Cuánto gasté en supermercado?</li>
                <li>¿Cuáles son mis mayores ingresos?</li>
                <li>Analiza mis gastos de transporte</li>
              </ul>
            </div>
          )}

          {conversation.map((item, index) => (
            <div key={index} className="space-y-3">
              {/* User Question */}
              <div className="flex justify-end">
                <div className="bg-bancolombia-yellow text-bancolombia-black p-3 rounded-lg max-w-md font-medium">
                  {item.question}
                </div>
              </div>

              {/* AI Answer */}
              <div className="flex justify-start">
                <div className="bg-bancolombia-gray-light text-bancolombia-black p-3 rounded-lg max-w-2xl border border-gray-200">
                  <div className="mb-2">{item.answer}</div>
                  
                  {/* Provider badge */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-300">
                    <span className="text-xs text-bancolombia-gray-dark">
                      {item.provider === "local" ? "Ollama" : 
                       item.provider === "openai" ? "OpenAI" : 
                       "Claude"}
                    </span>
                    
                    {/* Sources */}
                    {item.sources && item.sources.length > 0 && (
                      <span className="text-xs text-bancolombia-gray-dark">
                        | {item.sources.length} fuente(s)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {mutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-bancolombia-gray-light text-bancolombia-black p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-bancolombia-yellow border-t-transparent rounded-full"></div>
                  <span className="animate-pulse">Analizando transacciones...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Pregunta sobre tus finanzas..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bancolombia-yellow"
            disabled={mutation.isPending}
          />
          <button
            type="submit"
            disabled={mutation.isPending || !question.trim()}
            className="px-6 py-2 bg-bancolombia-yellow text-bancolombia-black rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {mutation.isPending ? "..." : "Enviar"}
          </button>
        </form>

        {mutation.isError && (
          <p className="text-red-600 text-sm mt-2">
            Error: {mutation.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
