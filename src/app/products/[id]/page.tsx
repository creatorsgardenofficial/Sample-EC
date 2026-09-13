import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer, SiteHeader } from "@/components/layout";
import { formatPrice } from "@/components/product";
import { prisma } from "@/lib/db";
import { productInclude, serializeProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });

  if (!product) {
    notFound();
  }

  const serialized = serializeProduct(product);
  const galleryImages = [serialized.listImageUrl, ...serialized.detailImageUrls];

  return (
    <div className="min-h-screen" style={{ background: "var(--amazon-bg)" }}>
      <SiteHeader />
      <PageContainer wide>
        <div className="mb-4 text-sm text-[#007185]">
          <Link href="/products" className="hover:text-[#c7511f] hover:underline">
            商品一覧
          </Link>
          <span className="mx-1">›</span>
          <span className="text-[#565959]">{serialized.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="amazon-card p-4 lg:p-6">
            <div className="grid gap-6 lg:grid-cols-[120px_1fr]">
              <div className="flex flex-row gap-2 overflow-x-auto lg:flex-col">
                {galleryImages.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="h-16 w-16 shrink-0 overflow-hidden border border-[#ddd] lg:h-20 lg:w-20"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`${serialized.title} ${index + 1}`}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                ))}
              </div>
              <div className="relative aspect-square max-h-[500px] w-full overflow-hidden bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={serialized.listImageUrl}
                  alt={serialized.title}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            {serialized.videoUrl ? (
              <div className="mt-6 border-t border-[#ddd] pt-6">
                <h2 className="mb-3 text-lg font-bold">商品動画</h2>
                <video
                  src={serialized.videoUrl}
                  controls
                  className="w-full max-w-2xl rounded border border-[#ddd] bg-black"
                />
              </div>
            ) : null}

            <div className="mt-6 border-t border-[#ddd] pt-6">
              <h2 className="text-lg font-bold">商品説明</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#0f1111]">
                {serialized.description}
              </p>
            </div>
          </div>

          <aside className="amazon-card h-fit p-5">
            <h1 className="text-xl font-normal leading-snug">{serialized.title}</h1>
            {serialized.sellerName ? (
              <p className="mt-2 text-sm">
                出品者:{" "}
                <span className="text-[#007185]">{serialized.sellerName}</span>
              </p>
            ) : null}
            <div className="mt-4 border-t border-[#ddd] pt-4">
              <span className="text-xs text-[#565959]">参考価格</span>
              <div className="flex items-start gap-1">
                <span className="text-sm text-[#565959]">￥</span>
                <span className="text-3xl text-[#b12704]">
                  {serialized.price.toLocaleString("ja-JP")}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#565959]">税込 {formatPrice(serialized.price)}</p>
            </div>
            <button
              type="button"
              className="amazon-btn-primary mt-5 w-full py-2 text-sm font-medium text-[#0f1111]"
            >
              カートに入れる（デモ）
            </button>
            <button
              type="button"
              className="amazon-btn-dark mt-2 w-full py-2 text-sm text-white"
            >
              ほしい物リストに追加（デモ）
            </button>
          </aside>
        </div>
      </PageContainer>
    </div>
  );
}
