import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { CATEGORIES, aggregateByCategory, aggregateByMonth } from '../utils/categories.js';

// Chart.jsのコンポーネントを登録
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// カテゴリ別円グラフと月別棒グラフを表示するコンポーネント
export default function Charts({ expenses }) {
  if (expenses.length === 0) {
    return (
      <div className="charts-empty">
        <p>グラフを表示するにはレシートを登録してください</p>
      </div>
    );
  }

  const categoryData = aggregateByCategory(expenses);
  const monthlyData = aggregateByMonth(expenses);

  // 円グラフのデータ設定
  const pieData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: Object.keys(categoryData).map(
          (cat) => CATEGORIES[cat]?.color || '#C9CBCF'
        ),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: {
        display: true,
        text: 'カテゴリ別支出',
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ¥${ctx.raw.toLocaleString()}`,
        },
      },
    },
  };

  // 棒グラフのデータ設定
  const barData = {
    labels: Object.keys(monthlyData).map((m) => `${m.slice(0, 4)}年${m.slice(5)}月`),
    datasets: [
      {
        label: '合計支出 (円)',
        data: Object.values(monthlyData),
        backgroundColor: '#36A2EB',
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '月別支出推移',
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ¥${ctx.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val) => `¥${val.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="charts-section">
      <h2>集計グラフ</h2>
      <div className="charts-grid">
        {/* カテゴリ別円グラフ */}
        <div className="chart-container">
          {Object.keys(categoryData).length > 0 ? (
            <Pie data={pieData} options={pieOptions} />
          ) : (
            <p>カテゴリデータがありません</p>
          )}
        </div>

        {/* 月別棒グラフ */}
        <div className="chart-container">
          {Object.keys(monthlyData).length > 0 ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <p>日付付きのデータがありません</p>
          )}
        </div>
      </div>
    </div>
  );
}
