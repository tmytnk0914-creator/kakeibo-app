import { useState, useEffect } from 'react';
import ReceiptUpload from './components/ReceiptUpload.jsx';
import ExpenseList from './components/ExpenseList.jsx';
import Charts from './components/Charts.jsx';
import Summary from './components/Summary.jsx';
import Auth from './components/Auth.jsx';
import { supabase } from './utils/supabase.js';
import { loadExpenses, insertExpense, deleteExpense, clearAllExpenses } from './utils/storage.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');

  // 認証状態の監視とセッション復元
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ログイン後にSupabaseから支出データを取得
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      return;
    }
    loadExpenses()
      .then(setExpenses)
      .catch(console.error);
  }, [user]);

  // Claude APIの解析結果をSupabaseに保存してリストに追加
  async function handleAnalyzed(data) {
    const expense = {
      date: data.date || null,
      storeName: data.storeName || '不明な店舗',
      items: data.items || [],
      totalAmount: data.totalAmount || 0,
    };

    try {
      const saved = await insertExpense(expense);
      setExpenses((prev) => [saved, ...prev]);
      setActiveTab('list');
    } catch (err) {
      console.error('保存エラー:', err);
    }
  }

  // 指定IDの支出をSupabaseから削除
  async function handleDelete(id) {
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('削除エラー:', err);
    }
  }

  // 自分が登録した支出を全削除
  async function handleClearAll() {
    if (!window.confirm('自分が登録したデータをすべて削除しますか？この操作は元に戻せません。')) return;
    try {
      await clearAllExpenses();
      const updated = await loadExpenses();
      setExpenses(updated);
    } catch (err) {
      console.error('全削除エラー:', err);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setActiveTab('upload');
  }

  // 認証確認中はローディング表示
  if (authLoading) {
    return <div className="loading-screen">読み込み中...</div>;
  }

  // 未ログインの場合は認証画面を表示
  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>📒 家計簿アプリ</h1>
          <p className="app-subtitle">レシートを撮影して自動で家計を管理</p>
        </div>
        <div className="header-user">
          <span className="user-email">{user.email}</span>
          <button className="logout-button" onClick={handleLogout}>ログアウト</button>
        </div>
      </header>

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
                  自分のデータをすべて削除
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
