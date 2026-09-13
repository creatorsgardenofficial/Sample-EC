import { auth } from "@/auth";
import { PageContainer, SectionTitle } from "@/components/layout";
import { SellerProductList } from "@/components/seller-product-list";
import { prisma } from "@/lib/db";
import { productInclude, serializeProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SellerProductsPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const products = await prisma.product.findMany({
    where: isAdmin ? undefined : { sellerId: session?.user.id },
    orderBy: { createdAt: "desc" },
    include: productInclude,
  });

  return (
    <PageContainer wide>
      <SectionTitle
        title="出品商品一覧"
        description={isAdmin ? "全出品者の商品を表示しています" : "あなたが出品した商品一覧"}
      />
      <SellerProductList products={products.map(serializeProduct)} />
    </PageContainer>
  );
}
