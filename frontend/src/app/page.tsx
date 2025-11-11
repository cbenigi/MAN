import DataStatusPanel from "../components/DataStatusPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-bancolombia-gray-light p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-bancolombia-black mb-8">ManBank Dashboard</h1>
        <DataStatusPanel />
        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-bancolombia-yellow text-bancolombia-black rounded-lg hover:bg-yellow-400 transition-colors font-medium shadow-md"
          >
            Ver Dashboard Completo
          </a>
        </div>
      </div>
    </div>
  );
}
