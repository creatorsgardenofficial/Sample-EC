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
import type { AppSession } from "@/lib/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function assertProductEditor(session: AppSession, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    return { error: NextResponse.json({ error: "商品が見つかりません" }, { status: 404 }) };
  }

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = product.sellerId === session.user.id;

  if (!isAdmin && !isOwner) {
    return { error: NextResponse.json({ error: "権限がありません" }, { status: 403 }) };
  }

  return { product };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });

    if (!product) {
      return NextResponse.json({ error: "商品が見つかりません" }, { status: 404 });
    }

    return NextResponse.json(serializeProduct(product));
  } catch (error) {
    console.error("GET /api/products/[id] failed:", error);
    return NextResponse.json(
      { error: "商品の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "SELLER" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "出品者としてログインしてください" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const access = await assertProductEditor(session, id);
    if ("error" in access && access.error) return access.error;

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
    const listImage = isFileEntry(listImageFile)
      ? await parseUploadFile(listImageFile, {
          maxSize: MAX_IMAGE_SIZE,
          allowedTypes: ALLOWED_IMAGE_TYPES,
          label: "一覧用画像",
        })
      : null;

    const detailImageFiles = formData
      .getAll("detailImages")
      .filter(isFileEntry);
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
    const video = isFileEntry(videoFile)
      ? await parseUploadFile(videoFile, {
          maxSize: MAX_VIDEO_SIZE,
          allowedTypes: ALLOWED_VIDEO_TYPES,
          label: "商品動画",
        })
      : null;

    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: { title, description, price },
      });

      if (listImage) {
        await tx.productMedia.deleteMany({
          where: { productId: id, type: "LIST_IMAGE" },
        });
        await tx.productMedia.create({
          data: {
            productId: id,
            type: "LIST_IMAGE",
            contentType: listImage.contentType,
            filename: listImage.filename,
            data: new Uint8Array(listImage.data),
            sortOrder: 0,
          },
        });
      }

      if (detailImages.length > 0) {
        const maxSort = await tx.productMedia.aggregate({
          where: { productId: id, type: "DETAIL_IMAGE" },
          _max: { sortOrder: true },
        });
        const startOrder = (maxSort._max.sortOrder ?? -1) + 1;

        await Promise.all(
          detailImages.map((image, index) =>
            tx.productMedia.create({
              data: {
                productId: id,
                type: "DETAIL_IMAGE",
                contentType: image.contentType,
                filename: image.filename,
                data: new Uint8Array(image.data),
                sortOrder: startOrder + index,
              },
            })
          )
        );
      }

      const listImageCount = await tx.productMedia.count({
        where: { productId: id, type: "LIST_IMAGE" },
      });
      if (listImageCount === 0) {
        throw new Error("一覧用画像を1件以上登録してください");
      }

      const detailCount = await tx.productMedia.count({
        where: { productId: id, type: "DETAIL_IMAGE" },
      });
      if (detailCount === 0) {
        throw new Error("詳細用画像を1件以上登録してください");
      }

      if (video) {
        await tx.productMedia.deleteMany({
          where: { productId: id, type: "VIDEO" },
        });
        await tx.productMedia.create({
          data: {
            productId: id,
            type: "VIDEO",
            contentType: video.contentType,
            filename: video.filename,
            data: new Uint8Array(video.data),
            sortOrder: 0,
          },
        });
      }

      return tx.product.findUniqueOrThrow({
        where: { id },
        include: productInclude,
      });
    });

    return NextResponse.json(serializeProduct(product));
  } catch (error) {
    console.error("PATCH /api/products/[id] failed:", error);
    const message =
      error instanceof Error ? error.message : "商品の更新に失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const access = await assertProductEditor(session, id);
    if ("error" in access && access.error) return access.error;

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] failed:", error);
    return NextResponse.json(
      { error: "商品の削除に失敗しました" },
      { status: 500 }
    );
  }
}
