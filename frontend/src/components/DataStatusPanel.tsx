"use client";

import { useQuery } from "@tanstack/react-query";
import { PipelineStatus } from "../app/types";

const API_BASE = "http://localhost:8000";

export default function DataStatusPanel() {
  const { data, isLoading, error } = useQuery<PipelineStatus>({
    queryKey: ["pipeline-status"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/status/pipeline`);
      if (!response.ok) throw new Error("Failed to fetch pipeline status");
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) return <div className="p-4 bg-white rounded-lg shadow border-l-4 border-bancolombia-yellow">Cargando estado del pipeline...</div>;
  if (error) return <div className="p-4 bg-red-100 text-red-800 rounded-lg border-l-4 border-red-500">Error al cargar estado del pipeline</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border-l-4 border-bancolombia-yellow">
      <h2 className="text-xl font-semibold text-bancolombia-black mb-4">Estado del Pipeline de Datos</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-bancolombia-gray-dark">Última Ejecución:</span>
          <span className="font-medium text-bancolombia-black">
            {data?.last_run_date ? new Date(data.last_run_date).toLocaleString('es-CO') : "Nunca"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-bancolombia-gray-dark">Estado:</span>
          <span className={`font-medium px-2 py-1 rounded text-sm ${
            data?.status === "success" ? "bg-green-100 text-green-800" :
            data?.status === "running" ? "bg-bancolombia-yellow text-bancolombia-black" :
            "bg-gray-100 text-gray-800"
          }`}>
            {data?.status || "Desconocido"}
          </span>
        </div>
      </div>
    </div>
  );
}