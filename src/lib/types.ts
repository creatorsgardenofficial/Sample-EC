import type { MediaType } from "@prisma/client";

export type ProductMediaItem = {
  id: string;
  url: string;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  listImageUrl: string;
  detailImageUrls: string[];
  videoUrl: string | null;
  listImageMediaId?: string | null;
  detailImageMedia?: ProductMediaItem[];
  videoMediaId?: string | null;
  sellerId?: string | null;
  sellerName?: string | null;
  createdAt: string;
  updatedAt: string;
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(price);
}

export function parsePriceInput(value: string): number | null {
  const normalized = value.replace(/[,，]/g, "").trim();
  if (!/^\d+$/.test(normalized)) return null;
  const price = Number(normalized);
  if (!Number.isSafeInteger(price) || price <= 0) return null;
  return price;
}

export function productMediaUrl(productId: string, mediaId: string): string {
  return `/api/products/${productId}/media/${mediaId}`;
}

type ProductMediaRecord = {
  id: string;
  type: MediaType;
  sortOrder: number;
};

export function serializeProduct(product: {
  id: string;
  title: string;
  description: string;
  price: number;
  sellerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  seller?: { name: string } | null;
  media?: ProductMediaRecord[];
}): Product {
  const media = product.media ?? [];
  const listImage = media.find((item) => item.type === "LIST_IMAGE");
  const detailImages = media
    .filter((item) => item.type === "DETAIL_IMAGE")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const video = media.find((item) => item.type === "VIDEO");

  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    listImageUrl: listImage ? productMediaUrl(product.id, listImage.id) : "",
    detailImageUrls: detailImages.map((item) => productMediaUrl(product.id, item.id)),
    videoUrl: video ? productMediaUrl(product.id, video.id) : null,
    listImageMediaId: listImage?.id ?? null,
    detailImageMedia: detailImages.map((item) => ({
      id: item.id,
      url: productMediaUrl(product.id, item.id),
    })),
    videoMediaId: video?.id ?? null,
    sellerId: product.sellerId,
    sellerName: product.seller?.name ?? null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export const productInclude = {
  seller: { select: { name: true } },
  media: {
    select: { id: true, type: true, sortOrder: true },
    orderBy: { sortOrder: "asc" as const },
  },
};
