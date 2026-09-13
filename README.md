# Sample EC

Sample EC は、出品者が商品を登録し、ユーザーが検索・閲覧できる EC マーケットプレイスです。

## 技術スタック

- **フロントエンド / バックエンド**: Next.js 15 (App Router) + React 19
- **スタイル**: Tailwind CSS 4
- **データベース**: Neon PostgreSQL
- **ORM**: Prisma
- **認証**: NextAuth.js（メール + パスワード）

## 機能

### ユーザー側

- ログイン必須（未ログイン時はログイン画面へリダイレクト）
- トップ画面（新着商品表示・検索）
- 商品検索・一覧画面
- 商品詳細画面（一覧用画像、詳細用画像、動画、説明文、価格）

### 出品者側

- トップ画面（ダッシュボード）
- 商品出品画面（ログイン必須 → DB に保存）
- 出品商品一覧（プレビュー・削除）

### 管理者側

- ダッシュボード（`/admin`）
- ユーザー/出品者一覧・有効化/無効化/削除

## 画面構成

| パス | 説明 |
|------|------|
| `/` | ユーザー向けトップ（要ログイン） |
| `/products` | 商品検索・一覧（要ログイン） |
| `/products/[id]` | 商品詳細（要ログイン） |
| `/login` | 一般ユーザーログイン |
| `/login/seller` | 出品者ログイン |
| `/login/admin` | 管理者ログイン |
| `/seller` | 出品者向けトップ（要ログイン） |
| `/seller/products/new` | 商品出品 |
| `/seller/products` | 出品商品一覧 |
| `/admin` | 管理ダッシュボード（管理者のみ） |
| `/admin/users` | ユーザー管理 |

## 初期アカウント（`npm run db:seed` 後）

| ロール | メール | パスワード |
|--------|--------|------------|
| 管理者 | admin@sample-ec.com | Admin123! |
| 出品者 | seller@sample-ec.com | Seller123! |
| 一般ユーザー | user@sample-ec.com | User123! |

新規アカウントの作成（自己登録・管理者による作成）は無効です。上記は `npm run db:seed` で投入される初期アカウントです。

各ロールは専用のログイン URL からのみログインできます（例: 出品者アカウントは `/login/seller` のみ）。

## セットアップ

### 1. 依存関係のインストール

Node.js 20 以上をインストールしたうえで:

```bash
npm install
```

### 2. Neon データベースの準備

1. [Neon](https://neon.tech/) で PostgreSQL プロジェクトを作成
2. 接続文字列をコピー

### 3. 環境変数

`.env.example` を `.env` にコピーし、`DATABASE_URL` を設定します。

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
AUTH_SECRET="your-random-secret-here"
```

### 4. データベースマイグレーション

```bash
npm run db:push
```

### 5. サンプルデータ投入（任意）

```bash
npm run db:seed
```

### 6. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でユーザー画面、http://localhost:3000/seller で出品者画面にアクセスできます。

## Vercel へのデプロイ

### 事前準備

1. [Neon](https://neon.tech/) で PostgreSQL プロジェクトを作成し、接続文字列を控える
2. シークレットを生成（PowerShell 例）:
   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```

### 方法 A: Vercel CLI（Git 不要）

```powershell
# 1. 開発サーバーを停止してから実行
npx vercel login

# 2. 初回デプロイ（対話形式でプロジェクト名などを設定）
npx vercel

# 3. 本番デプロイ
npx vercel --prod
```

Vercel ダッシュボード（または CLI）で環境変数を設定:

| 変数 | 値 |
|------|-----|
| `DATABASE_URL` | Neon の接続文字列 |
| `AUTH_SECRET` | 上で生成したランダム文字列 |

### 方法 B: GitHub 連携

1. GitHub にリポジトリを push
2. [Vercel](https://vercel.com/) → **Add New Project** → リポジトリをインポート
3. 環境変数 `DATABASE_URL` と `AUTH_SECRET` を設定
4. **Deploy**

### デプロイ後（初回のみ）

ローカルで本番 DB にスキーマと初期データを投入:

```powershell
$env:DATABASE_URL="postgresql://..."   # Neon の接続文字列
npm run db:push
npm run db:seed
```

### 注意

- ビルド時に Prisma Client が自動生成されます（`postinstall` / `build`）
- Vercel の Serverless Functions にはリクエストサイズ上限（約 4.5MB）があるため、20MB の動画アップロードは本番では失敗する場合があります。画像（5MB 以下）は問題ありません

## 出品時の入力項目

| 項目 | 必須 | 説明 |
|------|------|------|
| 商品名 | ✓ | 一覧・詳細に表示 |
| 価格 | ✓ | 日本円（整数） |
| 一覧用画像 | ✓ | トップ・一覧のサムネイル（JPEG/PNG/WebP/GIF、最大5MB） |
| 詳細用画像 | ✓ | 詳細画面のギャラリー（1件以上、各最大5MB） |
| 商品動画 | - | 詳細画面で再生（MP4/WebM、最大20MB） |
| 商品詳細説明 | ✓ | 詳細画面の説明文 |

画像・動画はファイルアップロード方式で、PostgreSQL の `BYTEA` カラムにバイナリとして保存されます。表示時は `/api/products/[id]/media/[mediaId]` から配信されます。

## API

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/products?q=` | 商品一覧・検索 |
| POST | `/api/products` | 商品出品（multipart/form-data、出品者ログイン必須） |
| GET | `/api/products/[id]` | 商品詳細 |
| GET | `/api/products/[id]/media/[mediaId]` | 商品画像・動画の配信 |
| DELETE | `/api/products/[id]` | 商品削除 |

## 今後の拡張例

- カート・注文機能
- カテゴリ・在庫管理
- 大容量メディア向けの外部ストレージ（S3 / Vercel Blob）連携
