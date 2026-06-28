import { useState, useRef } from 'react';

// レシート画像のアップロードと解析を行うコンポーネント
export default function ReceiptUpload({ onAnalyzed }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // ファイル選択時にプレビューを表示する
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  // 解析ボタンクリック時にバックエンドAPIを呼び出す
  async function handleAnalyze() {
    const file = fileInputRef.current?.files[0];
    if (!file) {
      setError('画像を選択してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '解析に失敗しました');
      }

      // 解析結果を親コンポーネントに渡す
      onAnalyzed(data);

      // フォームをリセット
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // ドラッグ&ドロップ対応
  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  return (
    <div className="upload-section">
      <h2>レシートを読み込む</h2>

      {/* ドロップゾーン */}
      <div
        className={`drop-zone ${preview ? 'has-preview' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="レシートのプレビュー" className="preview-image" />
        ) : (
          <div className="drop-zone-placeholder">
            <span className="drop-icon">📷</span>
            <p>クリックまたはドラッグ&ドロップで画像を選択</p>
            <p className="drop-hint">JPEG・PNG・WebP対応</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {error && <p className="error-message">{error}</p>}

      <button
        className="analyze-button"
        onClick={handleAnalyze}
        disabled={isLoading || !preview}
      >
        {isLoading ? '解析中...' : 'レシートを解析する'}
      </button>
    </div>
  );
}
