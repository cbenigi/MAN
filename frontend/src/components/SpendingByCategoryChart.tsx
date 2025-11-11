"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { KPIMetrics } from "../app/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const COLORS = [
  "#FDDA24", // bancolombia-yellow
  "#4A4A4A", // bancolombia-gray-dark
  "#f59e0b", // amber
  "#10b981", // green
  "#3b82f6", // blue
  "#ef4444", // red
  "#6366f1", // indigo
  "#14b8a6", // teal
];

export default function SpendingByCategoryChart() {
  const { data, isLoading, error } = useQuery<KPIMetrics>({
    queryKey: ["kpis"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/analytics/kpis`);
      if (!response.ok) throw new Error("Failed to fetch KPIs");
      return response.json();
    },
    refetchInterval: 60000,
  });

  if (isLoading) return (
    <div className="p-6 bg-white rounded-lg shadow-lg border-l-4 border-bancolombia-yellow">
      <h2 className="text-xl font-semibold text-bancolombia-black mb-4">Gastos por Categoría</h2>
      <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-red-800 mb-4">Gastos por Categoría</h2>
      <p className="text-red-700">Error al cargar datos</p>
    </div>
  );

  const chartData = Object.entries(data?.spending_by_category || {})
    .map(([category, amount]) => ({
      category,
      amount: amount,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8); // Top 8 categories

  const total = chartData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border-l-4 border-bancolombia-yellow">
      <h2 className="text-xl font-semibold text-bancolombia-black mb-4">Gastos por Categoría</h2>
      
      {chartData.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No hay datos de gastos disponibles
        </div>
      ) : (
        <>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="horizontal"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  type="number"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  type="category"
                  dataKey="category"
                  stroke="#6b7280"
                  style={{ fontSize: '11px' }}
                  width={100}
                />
                <Tooltip 
                  formatter={(value: number) => [
                    `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`,
                    'Monto'
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                />
                <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown */}
          <div className="space-y-2">
            {chartData.slice(0, 5).map((item, index) => {
              const percentage = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0;
              return (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-bancolombia-gray-dark">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-bancolombia-gray-dark">{percentage}%</span>
                    <span className="font-semibold text-bancolombia-black">
                      ${item.amount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

