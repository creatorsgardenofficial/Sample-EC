-- Sample EC 初期セットアップ（pgAdmin の Query Tool で実行）
-- 実行前: 既存テーブルがある場合は DROP されます

DROP TABLE IF EXISTS "ProductMedia" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TYPE IF EXISTS "MediaType" CASCADE;
DROP TYPE IF EXISTS "Role" CASCADE;

CREATE TYPE "Role" AS ENUM ('ADMIN', 'SELLER', 'USER');
CREATE TYPE "MediaType" AS ENUM ('LIST_IMAGE', 'DETAIL_IMAGE', 'VIDEO');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "sellerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Product_title_idx" ON "Product"("title");
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");
CREATE INDEX "Product_sellerId_idx" ON "Product"("sellerId");

CREATE TABLE "ProductMedia" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "type" "MediaType" NOT NULL,
  "contentType" TEXT NOT NULL,
  "filename" TEXT,
  "data" BYTEA NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ProductMedia_productId_type_idx" ON "ProductMedia"("productId", "type");

-- 初期ユーザー（パスワードは README 参照）
INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "updatedAt") VALUES
  ('seed_admin_001', 'admin@sample-ec.com', '$2b$12$mY6cc9j/vMA0SDDUdpUPh.9StzYEhIXTEKG5/bG93jk5lGKBSnnvi', '管理者', 'ADMIN', CURRENT_TIMESTAMP),
  ('seed_seller_001', 'seller@sample-ec.com', '$2b$12$PCeqJdAtFY7jsSuk78bJ6uyGesom5knIOnLJLcsx0xAhFRGiOKFSm', 'デモ出品者', 'SELLER', CURRENT_TIMESTAMP),
  ('seed_user_001', 'user@sample-ec.com', '$2b$12$2T4D7HI3rePSlYWGYd7Qx.KDE.CRu66mSBRUmIgIAAXIIhZSpIdqC', 'デモユーザー', 'USER', CURRENT_TIMESTAMP);

-- サンプル商品
INSERT INTO "Product" ("id", "title", "description", "price", "sellerId", "updatedAt") VALUES
  ('seed_product_001', 'ワイヤレスノイズキャンセリングイヤホン', '長時間の使用でも疲れにくい軽量設計。アクティブノイズキャンセリング機能搭載で、通勤・テレワークに最適です。', 12800, 'seed_seller_001', CURRENT_TIMESTAMP),
  ('seed_product_002', 'スタンド付きワイヤレス充電器', 'スマートフォンを縦置き・横置きの両方で充電可能。急速充電対応でデスク周りをすっきり整理できます。', 4980, 'seed_seller_001', CURRENT_TIMESTAMP),
  ('seed_product_003', '折りたたみ式ノートPCスタンド', '角度調整可能で姿勢改善をサポート。アルミ製の放熱性に優れたスタンドです。', 3580, 'seed_seller_001', CURRENT_TIMESTAMP);

-- プレースホルダー画像（1x1 PNG）
INSERT INTO "ProductMedia" ("id", "productId", "type", "contentType", "filename", "data", "sortOrder") VALUES
  ('seed_media_001', 'seed_product_001', 'LIST_IMAGE', 'image/png', 'earbuds-list.png', decode('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64'), 0),
  ('seed_media_002', 'seed_product_001', 'DETAIL_IMAGE', 'image/png', 'earbuds-detail-1.png', decode('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64'), 0),
  ('seed_media_003', 'seed_product_001', 'DETAIL_IMAGE', 'image/png', 'earbuds-detail-2.png', decode('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64'), 1),
  ('seed_media_004', 'seed_product_002', 'LIST_IMAGE', 'image/png', 'charger-list.png', decode('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64'), 0),
  ('seed_media_005', 'seed_product_002', 'DETAIL_IMAGE', 'image/png', 'charger-detail-1.png', decode('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64'), 0),
  ('seed_media_006', 'seed_product_002', 'DETAIL_IMAGE', 'image/png', 'charger-detail-2.png', decode('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64'), 1),
  ('seed_media_007', 'seed_product_003', 'LIST_IMAGE', 'image/png', 'stand-list.png', decode('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64'), 0),
  ('seed_media_008', 'seed_product_003', 'DETAIL_IMAGE', 'image/png', 'stand-detail-1.png', decode('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64'), 0);
