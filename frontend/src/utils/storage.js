import { supabase } from './supabase.js';

// DBのスネークケースをアプリのキャメルケースに変換
function fromDb(row) {
  return {
    id: row.id,
    date: row.date,
    storeName: row.store_name,
    items: row.items,
    totalAmount: row.total_amount,
    createdBy: row.created_by,
  };
}

// 全支出を新しい順で取得する
export async function loadExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(fromDb);
}

// 支出を1件登録して登録済みデータを返す
export async function insertExpense(expense) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      created_by: user.id,
      date: expense.date || null,
      store_name: expense.storeName,
      items: expense.items,
      total_amount: expense.totalAmount,
    })
    .select()
    .single();

  if (error) throw error;
  return fromDb(data);
}

// 指定IDの支出を削除する（自分のデータのみ削除可能）
export async function deleteExpense(id) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// 自分が登録した支出をすべて削除する
export async function clearAllExpenses() {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('created_by', user.id);

  if (error) throw error;
}
