import { prisma } from "@/lib/db";
import { productInclude, serializeProduct } from "@/lib/types";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string; mediaId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  try {
    const { id, mediaId } = await context.params;

    const media = await prisma.productMedia.findFirst({
      where: {
        id: mediaId,
        productId: id,
      },
    });

    if (!media) {
      return NextResponse.json({ error: "メディアが見つかりません" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(media.data), {
      headers: {
        "Content-Type": media.contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(media.filename ?? "media")}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("GET /api/products/[id]/media/[mediaId] failed:", error);
    return NextResponse.json(
      { error: "メディアの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "SELLER" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "出品者としてログインしてください" }, { status: 401 });
  }

  try {
    const { id, mediaId } = await context.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "商品が見つかりません" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = product.sellerId === session.user.id;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const media = await prisma.productMedia.findFirst({
      where: { id: mediaId, productId: id },
    });
    if (!media) {
      return NextResponse.json({ error: "メディアが見つかりません" }, { status: 404 });
    }

    await prisma.productMedia.delete({ where: { id: mediaId } });

    const updated = await prisma.product.findUniqueOrThrow({
      where: { id },
      include: productInclude,
    });

    return NextResponse.json(serializeProduct(updated));
  } catch (error) {
    console.error("DELETE /api/products/[id]/media/[mediaId] failed:", error);
    return NextResponse.json(
      { error: "メディアの削除に失敗しました" },
      { status: 500 }
    );
  }
}
