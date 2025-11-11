"use client";

import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import { KPIMetrics } from "../app/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function MonthlyTrendChart() {
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
      <h2 className="text-xl font-semibold text-bancolombia-black mb-4">Tendencia Mensual</h2>
      <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-red-800 mb-4">Tendencia Mensual</h2>
      <p className="text-red-700">Error al cargar datos de tendencia</p>
    </div>
  );

  // Format data for chart
  const chartData = data?.monthly_trend.map(item => ({
    month: new Date(item.month).toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }),
    Ingresos: item.inflow,
    Egresos: item.outflow,
    Neto: item.inflow - item.outflow
  })) || [];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border-l-4 border-bancolombia-yellow">
      <h2 className="text-xl font-semibold text-bancolombia-black mb-4">Tendencia Mensual (6 meses)</h2>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number) => `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '10px'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
            />
            <Bar dataKey="Ingresos" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Egresos" fill="#ef4444" radius={[8, 8, 0, 0]} />
            <Line 
              type="monotone" 
              dataKey="Neto" 
              stroke="#FDDA24" 
              strokeWidth={3}
              dot={{ fill: '#FDDA24', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-2 bg-green-50 rounded border border-green-200">
          <div className="text-xs text-green-700">Ingresos Promedio</div>
          <div className="text-lg font-bold text-green-900">
            ${chartData.length > 0 ? 
              (chartData.reduce((sum, d) => sum + d.Ingresos, 0) / chartData.length).toLocaleString('es-CO', { maximumFractionDigits: 0 }) 
              : 0}
          </div>
        </div>
        <div className="p-2 bg-red-50 rounded border border-red-200">
          <div className="text-xs text-red-700">Egresos Promedio</div>
          <div className="text-lg font-bold text-red-900">
            ${chartData.length > 0 ? 
              (chartData.reduce((sum, d) => sum + d.Egresos, 0) / chartData.length).toLocaleString('es-CO', { maximumFractionDigits: 0 }) 
              : 0}
          </div>
        </div>
        <div className="p-2 bg-yellow-50 rounded border border-yellow-300">
          <div className="text-xs text-yellow-700">Balance Promedio</div>
          <div className="text-lg font-bold text-bancolombia-black">
            ${chartData.length > 0 ? 
              (chartData.reduce((sum, d) => sum + d.Neto, 0) / chartData.length).toLocaleString('es-CO', { maximumFractionDigits: 0 }) 
              : 0}
          </div>
        </div>
      </div>
    </div>
  );
}

