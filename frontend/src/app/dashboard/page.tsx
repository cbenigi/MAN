import KpiCards from "../../components/KpiCards";
import InsightNarrativePanel from "../../components/InsightNarrativePanel";
import CategoryDistributionChart from "../../components/CategoryDistributionChart";
import MonthlyTrendChart from "../../components/MonthlyTrendChart";
import SpendingByCategoryChart from "../../components/SpendingByCategoryChart";
import RagChatWidget from "../../components/RagChatWidget";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-bancolombia-gray-light p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8 border-b-4 border-bancolombia-yellow pb-4">
          <h1 className="text-4xl font-bold text-bancolombia-black mb-2">
            ManBank Dashboard
          </h1>
          <p className="text-bancolombia-gray-dark">
            Panel de análisis financiero con IA
          </p>
        </div>

        {/* KPI Cards - Full Width */}
        <div className="mb-8">
          <KpiCards />
        </div>

        {/* Main Grid - 2 columns */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trend - Full Width on smaller screens */}
          <div className="xl:col-span-2">
            <MonthlyTrendChart />
          </div>

          {/* Category Distribution */}
          <CategoryDistributionChart />

          {/* Spending by Category */}
          <SpendingByCategoryChart />
        </div>

        {/* Insights and Chat - 2 columns */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <InsightNarrativePanel />
          <RagChatWidget />
        </div>

        {/* Footer */}
        <div className="text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-bancolombia-black text-bancolombia-yellow rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-md"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  );
}
