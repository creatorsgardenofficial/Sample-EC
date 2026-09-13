import { PageContainer, SiteHeader } from "@/components/layout";
import { ProductFilters } from "@/components/product-filters";
import { ProductGrid, ProductResultsHeader } from "@/components/product";
import { prisma } from "@/lib/db";
import { productInclude, serializeProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const products = await prisma.product.findMany({
    where: query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: productInclude,
  });

  const serialized = products.map(serializeProduct);

  return (
    <div className="min-h-screen" style={{ background: "var(--amazon-bg)" }}>
      <SiteHeader />
      <PageContainer wide className="py-4">
        <div className="flex items-start gap-4">
          <ProductFilters query={query || undefined} />
          <div className="min-w-0 flex-1">
            <div className="amazon-results-panel overflow-hidden">
              <ProductResultsHeader query={query || undefined} count={serialized.length} />
              <div className="p-2 sm:p-3">
                <ProductGrid products={serialized} />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
