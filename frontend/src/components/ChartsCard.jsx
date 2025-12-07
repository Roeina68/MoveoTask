import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import client from "../api/client";
import { ThumbsUp, ThumbsDown } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const PERIODS = ["7d", "1y"]; // we removed unsupported intervals

export default function ChartsCard() {
  const [historyData, setHistoryData] = useState(null);
  const [visibleCoins, setVisibleCoins] = useState(["BTC", "ETH"]);
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState("");

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  async function fetchHistory() {
    try {
      setLoading(true);
      setErrorState("");

      const resp = await client.get("/dashboard/price-history-all/");
      const data = resp.data;

      // If backend indicates rate limit or failure
      if (!data || data.error) {
        setErrorState("Chart data is temporarily unavailable due to API rate limits.");
        setHistoryData(null);
        return;
      }

      // If backend returns empty object
      if (Object.keys(data).length === 0) {
        setErrorState("No chart data available right now.");
        setHistoryData(null);
        return;
      }

      setHistoryData(data);
    } catch (err) {
      setErrorState("Failed to load chart data.");
      setHistoryData(null);
    } finally {
      setLoading(false);
    }
  }

  function toggleCoin(coin) {
    setVisibleCoins((prev) =>
      prev.includes(coin)
        ? prev.filter((c) => c !== coin)
        : [...prev, coin]
    );
  }

  function formatChart(period) {
    if (!historyData || !historyData[period]) return null;

    const series = historyData[period];

    const labels = extractLabels(series);
    const datasets = buildDatasets(series);

    return { labels, datasets };
  }

  function extractLabels(series) {
    const coin = Object.keys(series)[0];
    const timestamps = series[coin]?.map((p) => p[0]) || [];

    return timestamps.map((ts) =>
      new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    );
  }

  function buildDatasets(series) {
    return Object.entries(series)
      .filter(([coin]) => visibleCoins.includes(coin))
      .map(([coin, points]) => ({
        label: coin,
        data: points.map((p) => p[1]),
        borderColor: coin === "BTC" ? "#4A90E2" : "#8E44AD",
        backgroundColor: "transparent",
        borderWidth: 2,
        tension: 0.4,
      }));
  }

  const chartData = formatChart(selectedPeriod);

  return (
    <div className="rounded-xl bg-[#0f1a2b] p-6 border border-blue-900/40 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Price Trends</h2>

        <div className="flex gap-3">
          <button className="p-2 rounded-lg bg-blue-900/30 hover:bg-blue-800/40 transition">
            <ThumbsUp size={20} className="text-yellow-300" />
          </button>

          <button className="p-2 rounded-lg bg-blue-900/30 hover:bg-blue-800/40 transition">
            <ThumbsDown size={20} className="text-yellow-300" />
          </button>
        </div>
      </div>

      {/* Coin toggles */}
      <div className="flex gap-4 items-center mb-4 text-white">
        <span className="opacity-70">Show:</span>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={visibleCoins.includes("BTC")}
            onChange={() => toggleCoin("BTC")}
          />
          BTC
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={visibleCoins.includes("ETH")}
            onChange={() => toggleCoin("ETH")}
          />
          ETH
        </label>
      </div>

      {/* Period buttons */}
      <div className="flex gap-4 mb-6">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPeriod(p)}
            className={`px-6 py-2 rounded-lg transition ${
              selectedPeriod === p
                ? "bg-blue-600 text-white"
                : "bg-blue-900/40 text-gray-400"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-gray-400 text-center py-10">Loading chart...</div>
      )}

      {/* Error / fallback state */}
      {!loading && errorState && (
        <div className="text-gray-400 text-center py-10">
          <div className="text-lg mb-1">📉 {errorState}</div>
          <div className="text-sm opacity-60">Try again in a few minutes.</div>
        </div>
      )}

      {/* No dataset available */}
      {!loading && !errorState && !chartData && (
        <div className="text-gray-400 text-center py-10">
          No price history available.
        </div>
      )}

      {/* Chart */}
      {!loading && !errorState && chartData && (
        <div className="h-64">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { labels: { color: "white" } },
              },
              scales: {
                x: { ticks: { color: "white" } },
                y: { ticks: { color: "white" } },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
