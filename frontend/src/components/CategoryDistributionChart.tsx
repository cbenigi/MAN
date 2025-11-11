"use client";

import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { KPIMetrics } from "../app/types";

const API_BASE = "http://localhost:8000";

const COLORS = [
  "#FDDA24", 
  "#4A4A4A", 
  "#10b981", 
  "#ef4444", 
  "#3b82f6", 
  "#f59e0b", 
];

export default function CategoryDistributionChart() {
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
      <h2 className="text-xl font-semibold text-bancolombia-black mb-4">Distribución por Categoría</h2>
      <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-red-800 mb-4">Distribución por Categoría</h2>
      <p className="text-red-700">Error al cargar datos de categorías</p>
    </div>
  );

  const chartData = Object.entries(data?.category_distribution || {}).map(([category, count], index) => ({
    name: category,
    value: count,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border-l-4 border-bancolombia-yellow">
      <h2 className="text-xl font-semibold text-bancolombia-black mb-4">Distribución por Categoría</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}