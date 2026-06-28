import { useState, useEffect } from 'react';
import ReceiptUpload from './components/ReceiptUpload.jsx';
import ExpenseList from './components/ExpenseList.jsx';
import Charts from './components/Charts.jsx';
import Summary from './components/Summary.jsx';
import { loadExpenses, saveExpenses, generateId, clearExpenses } from './utils/storage.js';

// アプリ全体の状態管理と画面レイアウトを担うルートコンポーネント
export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');

  // ページ読み込み時にローカルストレージからデータを復元
  useEffect(() => {
    setExpenses(loadExpenses());
  }, []);

  // Claude APIの解析結果を受け取って支出リストに追加する
  function handleAnalyzed(data) {
    const newExpense = {
      id: generateId(),
      date: data.date || null,
      storeName: data.storeName || '不明な店舗',
      items: data.items || [],
      totalAmount: data.totalAmount || 0,
    };

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);

    // 追加後に一覧タブへ移動
    setActiveTab('list');
  }

  // 指定IDの支出を削除する
  function handleDelete(id) {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
  }

  // 全データを削除する
  function handleClearAll() {
    if (!window.confirm('すべてのデータを削除しますか？この操作は元に戻せません。')) return;
    clearExpenses();
    setExpenses([]);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📒 家計簿アプリ</h1>
        <p className="app-subtitle">レシートを撮影して自動で家計を管理</p>
      </header>

      {/* タブナビゲーション */}
      <nav className="tab-nav">
        {[
          { key: 'upload', label: '📷 読み込み' },
          { key: 'list', label: `📋 一覧 (${expenses.length})` },
          { key: 'charts', label: '📊 グラフ' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'upload' && (
          <ReceiptUpload onAnalyzed={handleAnalyzed} />
        )}

        {activeTab === 'list' && (
          <>
            <Summary expenses={expenses} />
            <ExpenseList expenses={expenses} onDelete={handleDelete} />
            {expenses.length > 0 && (
              <div className="clear-section">
                <button className="clear-button" onClick={handleClearAll}>
                  すべて削除
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'charts' && (
          <Charts expenses={expenses} />
        )}
      </main>
    </div>
  );
}
