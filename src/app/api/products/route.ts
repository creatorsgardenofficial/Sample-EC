import { prisma } from "@/lib/db";
import { productInclude, serializeProduct } from "@/lib/types";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  isFileEntry,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  parseUploadFile,
} from "@/lib/upload";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";

    const products = await prisma.product.findMany({
      where: q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: productInclude,
    });

    return NextResponse.json(products.map(serializeProduct));
  } catch (error) {
    console.error("GET /api/products failed:", error);
    return NextResponse.json(
      { error: "商品一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "SELLER" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "出品者としてログインしてください" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const priceRaw = String(formData.get("price") ?? "").trim();
    const price = Number(priceRaw);

    if (!title) {
      return NextResponse.json({ error: "商品名は必須です" }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ error: "商品説明は必須です" }, { status: 400 });
    }
    if (!Number.isInteger(price) || price <= 0) {
      return NextResponse.json({ error: "価格が不正です" }, { status: 400 });
    }

    const listImageFile = formData.get("listImage");
    if (!isFileEntry(listImageFile)) {
      return NextResponse.json({ error: "一覧用画像をアップロードしてください" }, { status: 400 });
    }

    const detailImageFiles = formData
      .getAll("detailImages")
      .filter(isFileEntry);
    if (detailImageFiles.length === 0) {
      return NextResponse.json(
        { error: "詳細用画像を1件以上アップロードしてください" },
        { status: 400 }
      );
    }

    const listImage = await parseUploadFile(listImageFile, {
      maxSize: MAX_IMAGE_SIZE,
      allowedTypes: ALLOWED_IMAGE_TYPES,
      label: "一覧用画像",
    });

    const detailImages = await Promise.all(
      detailImageFiles.map((file, index) =>
        parseUploadFile(file, {
          maxSize: MAX_IMAGE_SIZE,
          allowedTypes: ALLOWED_IMAGE_TYPES,
          label: `詳細用画像${index + 1}`,
        })
      )
    );

    const videoFile = formData.get("video");
    const video =
      isFileEntry(videoFile)
        ? await parseUploadFile(videoFile, {
            maxSize: MAX_VIDEO_SIZE,
            allowedTypes: ALLOWED_VIDEO_TYPES,
            label: "商品動画",
          })
        : null;

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          title,
          description,
          price,
          sellerId: session.user.id,
        },
      });

      await tx.productMedia.create({
        data: {
          productId: created.id,
          type: "LIST_IMAGE",
          contentType: listImage.contentType,
          filename: listImage.filename,
          data: new Uint8Array(listImage.data),
          sortOrder: 0,
        },
      });

      await Promise.all(
        detailImages.map((image, index) =>
          tx.productMedia.create({
            data: {
              productId: created.id,
              type: "DETAIL_IMAGE",
              contentType: image.contentType,
              filename: image.filename,
              data: new Uint8Array(image.data),
              sortOrder: index,
            },
          })
        )
      );

      if (video) {
        await tx.productMedia.create({
          data: {
            productId: created.id,
            type: "VIDEO",
            contentType: video.contentType,
            filename: video.filename,
            data: new Uint8Array(video.data),
            sortOrder: 0,
          },
        });
      }

      return tx.product.findUniqueOrThrow({
        where: { id: created.id },
        include: productInclude,
      });
    });

    return NextResponse.json(serializeProduct(product), { status: 201 });
  } catch (error) {
    console.error("POST /api/products failed:", error);
    const message =
      error instanceof Error ? error.message : "商品の出品に失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
