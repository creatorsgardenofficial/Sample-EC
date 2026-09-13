import Link from "next/link";
import { PageContainer, SectionTitle } from "@/components/layout";
import { SellerHero } from "@/components/seller-hero";
import { SELLER_PORTAL_NAME } from "@/lib/site";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SellerHomePage() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const productCount = await prisma.product.count({
    where: isAdmin ? undefined : { sellerId: session?.user.id },
  });

  return (
    <>
      <SellerHero />
      <PageContainer wide>
        <SectionTitle
          title={SELLER_PORTAL_NAME}
          description={`${session?.user.name} さん、出品管理画面へようこそ`}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <DashboardCard
            title="出品商品数"
            value={`${productCount} 件`}
            description="現在公開中の商品"
          />
          <DashboardCard
            title="商品を出品"
            value="新規登録"
            description="画像・価格・動画・説明を入力"
            href="/seller/products/new"
          />
          <DashboardCard
            title="出品一覧"
            value="管理する"
            description="登録済み商品の確認・削除"
            href="/seller/products"
          />
        </div>
      </PageContainer>
    </>
  );
}

function DashboardCard({
  title,
  value,
  description,
  href,
}: {
  title: string;
  value: string;
  description: string;
  href?: string;
}) {
  const content = (
    <article className="amazon-card p-6 transition hover:shadow-md">
      <h3 className="text-sm font-medium text-[#565959]">{title}</h3>
      <p className="mt-2 text-2xl font-bold text-[#0f1111]">{value}</p>
      <p className="mt-2 text-sm text-[#565959]">{description}</p>
    </article>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
