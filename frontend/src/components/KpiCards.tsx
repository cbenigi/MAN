"use client";

import { useQuery } from "@tanstack/react-query";
import { KPIMetrics } from "../app/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function KpiCards() {
  const { data, isLoading, error } = useQuery<KPIMetrics>({
    queryKey: ["kpis"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/analytics/kpis`);
      if (!response.ok) throw new Error("Failed to fetch KPIs");
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 bg-white rounded-lg shadow animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-100 text-red-800 rounded-lg">
      Error al cargar KPIs
    </div>
  );

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const netFlow = (data?.total_moved_month || 0) - (data?.total_outflow_month || 0);
  const savingsRate = data?.total_moved_month ? 
    ((data.total_savings_inflow / data.total_moved_month) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1: Total Movido */}
      <div className="p-6 bg-white rounded-lg shadow-lg border-l-4 border-bancolombia-yellow hover:shadow-xl transition-shadow">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-bancolombia-gray-dark uppercase">Total Movido (Mes)</h3>
        </div>
        <p className="text-3xl font-bold text-bancolombia-black">{formatCurrency(data?.total_moved_month || 0)}</p>
        <p className="text-xs text-bancolombia-gray-dark mt-1">Total de transacciones</p>
      </div>

      {/* Card 2: Egresos */}
      <div className="p-6 bg-white rounded-lg shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-bancolombia-gray-dark uppercase">Egresos (Mes)</h3>
        </div>
        <p className="text-3xl font-bold text-red-600">{formatCurrency(data?.total_outflow_month || 0)}</p>
        <p className="text-xs text-bancolombia-gray-dark mt-1">Total gastado</p>
      </div>

      {/* Card 3: Ahorros */}
      <div className="p-6 bg-white rounded-lg shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-bancolombia-gray-dark uppercase">Ahorros</h3>
        </div>
        <p className="text-3xl font-bold text-green-600">{formatCurrency(data?.total_savings_inflow || 0)}</p>
        <p className="text-xs text-bancolombia-gray-dark mt-1">Tasa: {savingsRate}%</p>
      </div>

      {/* Card 4: Flujo Neto */}
      <div className={`p-6 bg-white rounded-lg shadow-lg border-l-4 hover:shadow-xl transition-shadow ${
        netFlow >= 0 
          ? 'border-bancolombia-yellow' 
          : 'border-orange-500'
      }`}>
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-bancolombia-gray-dark uppercase">
            Flujo Neto
          </h3>
        </div>
        <p className={`text-3xl font-bold ${netFlow >= 0 ? 'text-bancolombia-black' : 'text-orange-600'}`}>
          {formatCurrency(Math.abs(netFlow))}
        </p>
        <p className={`text-xs mt-1 ${netFlow >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
          {netFlow >= 0 ? 'Superávit' : 'Déficit'}
        </p>
      </div>
    </div>
  );
}
