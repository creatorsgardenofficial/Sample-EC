import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageContainer, SectionTitle } from "@/components/layout";
import { ProductForm } from "@/components/product-form";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { productInclude, serializeProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth();
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });

  if (!product) {
    notFound();
  }

  const isAdmin = session?.user.role === "ADMIN";
  const isOwner = product.sellerId === session?.user.id;

  if (!isAdmin && !isOwner) {
    redirect("/seller/unauthorized");
  }

  return (
    <PageContainer>
      <div className="mb-4 text-sm text-[#007185]">
        <Link href="/seller/products" className="hover:text-[#c7511f] hover:underline">
          出品商品一覧
        </Link>
        <span className="mx-1">›</span>
        <span className="text-[#565959]">商品編集</span>
      </div>
      <SectionTitle
        title="商品編集"
        description="商品名・価格・画像・動画・説明文を更新できます"
      />
      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <ProductForm product={serializeProduct(product)} />
      </div>
    </PageContainer>
  );
}
