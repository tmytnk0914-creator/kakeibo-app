import { CATEGORIES } from '../utils/categories.js';

// 登録済み支出の一覧を表示するコンポーネント
export default function ExpenseList({ expenses, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="expense-list-empty">
        <p>まだレシートが登録されていません</p>
        <p className="hint">上のエリアからレシートをアップロードしてください</p>
      </div>
    );
  }

  // 日付の新しい順に表示
  const sorted = [...expenses].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  return (
    <div className="expense-list">
      <h2>支出一覧</h2>
      {sorted.map((expense) => (
        <div key={expense.id} className="expense-card">
          <div className="expense-card-header">
            <div>
              <span className="store-name">{expense.storeName || '不明な店舗'}</span>
              <span className="expense-date">{expense.date || '日付不明'}</span>
            </div>
            <div className="expense-card-actions">
              <span className="total-amount">¥{expense.totalAmount?.toLocaleString() || 0}</span>
              <button
                className="delete-button"
                onClick={() => onDelete(expense.id)}
                title="削除"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 商品明細一覧 */}
          <ul className="item-list">
            {expense.items.map((item, idx) => {
              const cat = CATEGORIES[item.category] || CATEGORIES['その他'];
              return (
                <li key={idx} className="item-row">
                  <span
                    className="category-badge"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.icon} {item.category || 'その他'}
                  </span>
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">¥{item.price?.toLocaleString() || 0}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
