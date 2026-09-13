import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { PageContainer, SiteFooter, SiteHeader } from "@/components/layout";
import { ProductGrid, SearchForm } from "@/components/product";
import { prisma } from "@/lib/db";
import { productInclude, serializeProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: productInclude,
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--amazon-bg)" }}>
      <SiteHeader />

      <section className="relative overflow-hidden bg-[#232f3e] text-white">
        <PageContainer wide className="py-10">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm text-[#febd69]">{SITE_NAME} セール開催中</p>
              <h1 className="mt-2 text-4xl font-bold leading-tight">
                欲しいもの、全部ここに。
              </h1>
              <p className="mt-4 text-gray-300">
                {SITE_NAME} で商品を検索・比較・購入。豊富なラインナップからお気に入りを見つけましょう。
              </p>
              <div className="mt-6 max-w-xl">
                <SearchForm />
              </div>
            </div>
            <div className="amazon-card hidden p-6 text-[#0f1111] lg:block">
              <h2 className="text-lg font-bold">今日のおすすめ</h2>
              <p className="mt-2 text-sm text-[#565959]">
                新着・人気商品をチェックして、お気に入りを見つけましょう。
              </p>
              <Link
                href="/products"
                className="amazon-btn-primary mt-4 inline-block px-5 py-2 text-sm font-medium"
              >
                すべての商品を見る
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      <PageContainer wide className="py-4">
        <div className="amazon-results-panel overflow-hidden">
          <div className="border-b border-[#ddd] px-4 py-3">
            <h2 className="text-xl font-bold text-[#0f1111]">おすすめ商品</h2>
            <p className="mt-1 text-sm text-[#565959]">人気・新着の商品をピックアップ</p>
          </div>
          <div className="p-2 sm:p-3">
            <ProductGrid products={products.map(serializeProduct)} columns="home" />
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/products"
            className="amazon-btn-primary inline-block px-6 py-2 text-sm font-medium text-[#0f1111]"
          >
            もっと商品を見る
          </Link>
        </div>
      </PageContainer>

      <SiteFooter />
    </div>
  );
}
