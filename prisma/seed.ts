import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const PLACEHOLDER_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC",
  "base64"
);

type MediaInput = {
  type: "LIST_IMAGE" | "DETAIL_IMAGE" | "VIDEO";
  contentType: string;
  filename: string;
  data: Buffer;
  sortOrder: number;
};

async function createProductWithMedia(input: {
  title: string;
  description: string;
  price: number;
  sellerId: string;
  media: MediaInput[];
}) {
  const product = await prisma.product.create({
    data: {
      title: input.title,
      description: input.description,
      price: input.price,
      sellerId: input.sellerId,
    },
  });

  await Promise.all(
    input.media.map((item) =>
      prisma.productMedia.create({
        data: {
          productId: product.id,
          type: item.type,
          contentType: item.contentType,
          filename: item.filename,
          data: new Uint8Array(item.data),
          sortOrder: item.sortOrder,
        },
      })
    )
  );
}

async function main() {
  const adminPassword = await hashPassword("Admin123!");
  const sellerPassword = await hashPassword("Seller123!");
  const userPassword = await hashPassword("User123!");

  await prisma.productMedia.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "admin@sample-ec.com",
      name: "管理者",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: "seller@sample-ec.com",
      name: "デモ出品者",
      passwordHash: sellerPassword,
      role: "SELLER",
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "user@sample-ec.com",
      name: "デモユーザー",
      passwordHash: userPassword,
      role: "USER",
    },
  });

  await createProductWithMedia({
    title: "ワイヤレスノイズキャンセリングイヤホン",
    description:
      "長時間の使用でも疲れにくい軽量設計。アクティブノイズキャンセリング機能搭載で、通勤・テレワークに最適です。",
    price: 12800,
    sellerId: seller.id,
    media: [
      {
        type: "LIST_IMAGE",
        contentType: "image/png",
        filename: "earbuds-list.png",
        data: PLACEHOLDER_PNG,
        sortOrder: 0,
      },
      {
        type: "DETAIL_IMAGE",
        contentType: "image/png",
        filename: "earbuds-detail-1.png",
        data: PLACEHOLDER_PNG,
        sortOrder: 0,
      },
      {
        type: "DETAIL_IMAGE",
        contentType: "image/png",
        filename: "earbuds-detail-2.png",
        data: PLACEHOLDER_PNG,
        sortOrder: 1,
      },
    ],
  });

  await createProductWithMedia({
    title: "スタンド付きワイヤレス充電器",
    description:
      "スマートフォンを縦置き・横置きの両方で充電可能。急速充電対応でデスク周りをすっきり整理できます。",
    price: 4980,
    sellerId: seller.id,
    media: [
      {
        type: "LIST_IMAGE",
        contentType: "image/png",
        filename: "charger-list.png",
        data: PLACEHOLDER_PNG,
        sortOrder: 0,
      },
      {
        type: "DETAIL_IMAGE",
        contentType: "image/png",
        filename: "charger-detail-1.png",
        data: PLACEHOLDER_PNG,
        sortOrder: 0,
      },
      {
        type: "DETAIL_IMAGE",
        contentType: "image/png",
        filename: "charger-detail-2.png",
        data: PLACEHOLDER_PNG,
        sortOrder: 1,
      },
    ],
  });

  await createProductWithMedia({
    title: "折りたたみ式ノートPCスタンド",
    description:
      "角度調整可能で姿勢改善をサポート。アルミ製の放熱性に優れたスタンドです。",
    price: 3580,
    sellerId: seller.id,
    media: [
      {
        type: "LIST_IMAGE",
        contentType: "image/png",
        filename: "stand-list.png",
        data: PLACEHOLDER_PNG,
        sortOrder: 0,
      },
      {
        type: "DETAIL_IMAGE",
        contentType: "image/png",
        filename: "stand-detail-1.png",
        data: PLACEHOLDER_PNG,
        sortOrder: 0,
      },
    ],
  });

  console.log("Seed completed.");
  console.log("Admin: admin@sample-ec.com / Admin123!");
  console.log("Seller: seller@sample-ec.com / Seller123!");
  console.log("User: user@sample-ec.com / User123!");
  console.log("Admin ID:", admin.id);
  console.log("User ID:", user.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
