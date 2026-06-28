// カテゴリの定義と色・アイコンの設定
export const CATEGORIES = {
  食費: { color: '#FF6384', icon: '🍱' },
  外食: { color: '#FF9F40', icon: '🍜' },
  日用品: { color: '#FFCD56', icon: '🧴' },
  交通費: { color: '#4BC0C0', icon: '🚃' },
  医療費: { color: '#36A2EB', icon: '💊' },
  娯楽: { color: '#9966FF', icon: '🎮' },
  衣類: { color: '#FF6B6B', icon: '👕' },
  光熱費: { color: '#C9CBCF', icon: '💡' },
  その他: { color: '#8ED1A0', icon: '📦' },
};

export const CATEGORY_NAMES = Object.keys(CATEGORIES);

// カテゴリ別に支出を集計する関数
export function aggregateByCategory(expenses) {
  const result = {};

  for (const expense of expenses) {
    for (const item of expense.items) {
      const category = item.category || 'その他';
      if (!result[category]) {
        result[category] = 0;
      }
      result[category] += item.price;
    }
  }

  return result;
}

// 月別に支出を集計する関数
export function aggregateByMonth(expenses) {
  const result = {};

  for (const expense of expenses) {
    // 日付がない場合はスキップ
    if (!expense.date) continue;

    const month = expense.date.substring(0, 7); // "YYYY-MM"形式
    if (!result[month]) {
      result[month] = 0;
    }
    // レシートの合計金額を月別に加算
    result[month] += expense.totalAmount || 0;
  }

  // 月の昇順でソートして返す
  return Object.fromEntries(
    Object.entries(result).sort(([a], [b]) => a.localeCompare(b))
  );
}
