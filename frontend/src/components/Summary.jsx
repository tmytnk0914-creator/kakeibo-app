import { CATEGORIES, aggregateByCategory } from '../utils/categories.js';

// 支出サマリー（合計・カテゴリ別集計）を表示するコンポーネント
export default function Summary({ expenses }) {
  if (expenses.length === 0) return null;

  // 全体の合計金額
  const totalAll = expenses.reduce((sum, e) => sum + (e.totalAmount || 0), 0);

  // カテゴリ別集計
  const byCategory = aggregateByCategory(expenses);
  const sortedCategories = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

  return (
    <div className="summary-section">
      <h2>支出サマリー</h2>
      <div className="summary-total">
        <span>累計支出</span>
        <span className="total-value">¥{totalAll.toLocaleString()}</span>
      </div>

      {/* カテゴリ別の内訳 */}
      <div className="summary-categories">
        {sortedCategories.map(([category, amount]) => {
          const cat = CATEGORIES[category] || CATEGORIES['その他'];
          const percentage = ((amount / totalAll) * 100).toFixed(1);
          return (
            <div key={category} className="summary-row">
              <div className="summary-label">
                <span className="summary-icon">{cat.icon}</span>
                <span>{category}</span>
              </div>
              <div className="summary-bar-wrapper">
                <div
                  className="summary-bar"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
              <div className="summary-amount">
                <span>¥{amount.toLocaleString()}</span>
                <span className="summary-percent">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
