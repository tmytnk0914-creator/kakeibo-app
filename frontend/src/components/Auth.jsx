import { useState } from 'react';
import { supabase } from '../utils/supabase.js';

// ログイン・新規登録フォームコンポーネント
export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('確認メールを送信しました。メールのリンクをクリックしてログインしてください。');
      }
    } catch (err) {
      // Supabaseのエラーメッセージを日本語化
      const msg = err.message;
      if (msg.includes('Invalid login credentials')) {
        setError('メールアドレスまたはパスワードが正しくありません');
      } else if (msg.includes('Email not confirmed')) {
        setError('メールアドレスが確認されていません。確認メールをご確認ください');
      } else if (msg.includes('Password should be at least')) {
        setError('パスワードは6文字以上で入力してください');
      } else if (msg.includes('already registered')) {
        setError('このメールアドレスはすでに登録されています');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">📒 家計簿アプリ</h1>
        <p className="auth-subtitle">家族みんなで使える家計管理</p>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
          >
            ログイン
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
          >
            新規登録
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </div>
          <div className="auth-field">
            <label>パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
              required
              minLength={6}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '処理中...' : isLogin ? 'ログイン' : '登録する'}
          </button>
        </form>
      </div>
    </div>
  );
}
