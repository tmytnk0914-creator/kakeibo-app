// ローカルストレージのキー名
const STORAGE_KEY = 'kakeibo_expenses';

// 支出データを読み込む
export function loadExpenses() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    // データが壊れている場合は空配列を返す
    return [];
  }
}

// 支出データを保存する
export function saveExpenses(expenses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('ローカルストレージへの保存に失敗しました:', error);
  }
}

// 支出データを全削除する
export function clearExpenses() {
  localStorage.removeItem(STORAGE_KEY);
}

// 一意なIDを生成する
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
