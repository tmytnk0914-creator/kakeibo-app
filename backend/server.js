import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// メモリ上で画像を受け取る（ディスクに保存しない）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 最大10MB
});

// Node.js v18以降でnode-fetchのgzipストリームが途中切断する問題を回避
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultHeaders: {
    'Accept-Encoding': 'identity',
  },
});

// 開発時のみCORSを許可（本番はExpressが静的ファイルを配信するため不要）
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: 'http://localhost:5173' }));
}
app.use(express.json());

// 本番環境ではビルド済みフロントエンドを配信する
const distPath = join(__dirname, '../frontend/dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
}

// レシート画像を受け取り、Claude APIで解析するエンドポイント
app.post('/api/analyze-receipt', upload.single('receipt'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '画像ファイルが見つかりません' });
  }

  // アップロードされた画像をBase64エンコード
  const imageBase64 = req.file.buffer.toString('base64');
  const mediaType = req.file.mimetype;

  // サポートする画像形式のチェック
  const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!supportedTypes.includes(mediaType)) {
    return res.status(400).json({ error: 'JPEG・PNG・GIF・WebP形式の画像のみ対応しています' });
  }

  try {
    // Claude Haiku（最新版）でレシートを解析
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `このレシート画像を解析して、以下のJSON形式で返してください。
レシートに書かれている情報のみを使用し、不明な場合はnullを使用してください。

{
  "date": "YYYY-MM-DD形式の日付（レシートに記載がない場合はnull）",
  "storeName": "店舗名",
  "items": [
    {
      "name": "商品名",
      "price": 金額（数値、税込み）,
      "category": "以下のカテゴリから最も適切なものを選択: 食費・外食・日用品・交通費・医療費・娯楽・衣類・光熱費・その他"
    }
  ],
  "totalAmount": 合計金額（数値）
}

JSONのみを返してください。説明文は不要です。`,
            },
          ],
        },
      ],
    });

    // Claude APIのレスポンスからJSONを抽出
    const content = response.content[0];
    if (content.type !== 'text') {
      return res.status(500).json({ error: 'APIからの応答が不正です' });
    }

    // JSONのみを抽出（```json ``` ブロックが含まれる場合に対応）
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'レシートの解析に失敗しました' });
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    res.json(parsedData);
  } catch (error) {
    console.error('Claude API エラー:', error);

    if (error instanceof SyntaxError) {
      return res.status(500).json({ error: 'レシートデータの解析に失敗しました' });
    }
    if (error.status === 401) {
      return res.status(500).json({ error: 'APIキーが無効です。.envファイルを確認してください' });
    }

    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// ヘルスチェック用エンドポイント
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

// フロントエンドのルーティングをExpressに委譲（本番のみ）
if (existsSync(distPath)) {
  app.get('*', (_, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`バックエンドサーバー起動中: http://localhost:${PORT}`);
});
