# kakeibo-app — Claude Code ガイド

## プロジェクト概要

家計簿アプリ（kakeibo-app）。収支の記録・管理を行うWebアプリケーション。

---

## Git 運用ルール

**コードを変更するたびに、必ずGitHubへプッシュすること。**

### 手順

1. 変更内容をステージング
   ```
   git add <変更ファイル>
   ```

2. コミット（メッセージは変更内容を端的に記述する）
   ```
   git commit -m "概要: 変更内容の説明"
   ```

3. GitHubへプッシュ
   ```
   git push origin <ブランチ名>
   ```

### コミットメッセージの形式

```
<種別>: <変更の概要>

# 種別の例
feat:     新機能追加
fix:      バグ修正
refactor: リファクタリング
style:    コードスタイルの変更（機能に影響なし）
docs:     ドキュメントのみの変更
test:     テストの追加・修正
chore:    ビルド・ツール・依存関係の変更
```

### ブランチ戦略

- `main` — リリース済みの安定版。直接コミットしない。
- `develop` — 開発中の統合ブランチ。
- `feature/<機能名>` — 機能単位の作業ブランチ。作業完了後は `develop` にマージする。
- `fix/<バグ名>` — バグ修正ブランチ。

### 注意事項

- `.env` や認証情報を含むファイルは絶対にコミットしない。
- `git push --force` は原則禁止。やむを得ない場合はユーザーに確認を取ること。
- `main` ブランチへの直接プッシュは行わず、Pull Request を経由すること。

---

## 開発ガイドライン

- コメントは「なぜ」を説明する場合のみ書く（何をしているかはコードで表現する）。
- セキュリティ：SQLインジェクション・XSS等のOWASP Top 10に注意する。
- ユーザー入力値は必ずバリデーションを行う。
- 不要な抽象化・将来の要件への先回りはしない。

---

## アーキテクチャ

```
frontend/   React + Vite（UIレイヤー）
backend/    Express + @anthropic-ai/sdk（APIレイヤー）
```

- 開発時：フロントは localhost:5173、バックは localhost:3001（Viteプロキシで中継）
- 本番時：Expressが `frontend/dist` を静的配信。1サーバーで完結。
- DB・認証：Supabase（PostgreSQL + Auth）。フロントから直接接続。
- Claude APIはブラウザに秘密キーを渡さないためバックエンド経由で呼び出す。

---

## 開発環境の起動方法

ターミナルを2つ開いて実行する。

```bash
# バックエンド（ターミナル1）
cd backend && npm run dev

# フロントエンド（ターミナル2）
cd frontend && npm run dev
```

---

## 環境変数

### backend/.env（Gitに含めない）
```
ANTHROPIC_API_KEY=  # Anthropic Console で取得
PORT=3001
```

### frontend/.env.local（Gitに含めない）
```
VITE_SUPABASE_URL=      # Supabase → Settings → API → API URL
VITE_SUPABASE_ANON_KEY= # Supabase → Settings → API → anon/public キー
```

---

## デプロイ情報

- **本番URL**：https://kakeibo-app-production-11e7.up.railway.app
- **Railwayプロジェクト**：lavish-emotion / production
- **Supabaseプロジェクト**：kakeibo（hrgqvrhyycpghmbggrsc）
- **デプロイ方法**：`main` ブランチへのプッシュで Railway が自動デプロイ
- **Railwayの環境変数**：`ANTHROPIC_API_KEY` / `NODE_ENV` / `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`

### Supabaseの設定
- テーブル：`expenses`（id / date / store_name / items / total_amount / created_by）
- RLS：ログイン済み全員が閲覧可・自分のレコードのみ削除可
- Authentication → URL Configuration → Site URL にRailwayのURLを登録済み

---

## 既知の注意事項

- Node.js v18以降 + `@anthropic-ai/sdk` でgzipストリームが途中切断する問題あり。`defaultHeaders: { 'Accept-Encoding': 'identity' }` で回避済み（`backend/server.js`）。
- `VITE_` プレフィックスの環境変数はビルド時にJSバンドルに埋め込まれる（ブラウザから見える）。Supabaseのanonキーは公開前提の設計のため問題ない。秘密にすべき情報はバックエンドの `.env` のみに置く。
