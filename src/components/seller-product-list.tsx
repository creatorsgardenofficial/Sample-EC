"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice, type Product } from "@/lib/types";

export function SellerProductList({ products }: { products: Product[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!window.confirm("この商品を削除しますか？")) return;

    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "削除に失敗しました");
      }
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "削除に失敗しました"
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (products.length === 0) {
    return (
      <div className="amazon-card p-10 text-center text-[#565959]">
        出品中の商品はありません。新しい商品を出品してください。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded border border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {products.map((product) => (
        <article
          key={product.id}
          className="amazon-card flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex min-w-0 flex-1 gap-4">
            {product.listImageUrl ? (
              <div className="aspect-square w-28 shrink-0 overflow-hidden rounded border border-[#ddd] bg-white sm:w-32 md:w-36">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.listImageUrl}
                  alt={product.title}
                  className="h-full w-full object-contain p-1"
                />
              </div>
            ) : null}
            <div className="min-w-0">
              <h3 className="font-semibold text-[#0f1111]">{product.title}</h3>
              <p className="mt-1 text-sm text-[#b12704]">{formatPrice(product.price)}</p>
              {product.sellerName ? (
                <p className="mt-1 text-xs text-[#007185]">出品: {product.sellerName}</p>
              ) : null}
              <p className="mt-2 line-clamp-2 text-sm text-[#565959]">
                {product.description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/seller/products/${product.id}/edit`}
              className="amazon-btn-primary px-4 py-2 text-sm font-medium text-[#0f1111]"
            >
              編集
            </Link>
            <a
              href={`/products/${product.id}`}
              className="amazon-btn-dark px-4 py-2 text-sm text-white"
            >
              プレビュー
            </a>
            <button
              type="button"
              onClick={() => handleDelete(product.id)}
              disabled={deletingId === product.id}
              className="rounded border border-[#b12704] px-4 py-2 text-sm text-[#b12704] hover:bg-red-50 disabled:opacity-60"
            >
              {deletingId === product.id ? "削除中..." : "削除"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
