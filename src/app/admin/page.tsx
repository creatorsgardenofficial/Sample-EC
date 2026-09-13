import Link from "next/link";
import { AdminHeader, PageContainer, SectionTitle } from "@/components/layout";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [userCount, sellerCount, productCount] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.product.count(),
  ]);

  return (
    <div className="min-h-screen" style={{ background: "var(--amazon-bg)" }}>
      <AdminHeader />
      <PageContainer wide>
        <SectionTitle
          title="管理ダッシュボード"
          description="出品者・一般ユーザーの管理"
        />
        <div className="grid gap-4 md:grid-cols-3">
          <DashboardCard title="一般ユーザー" value={`${userCount} 人`} href="/admin/users?role=USER" />
          <DashboardCard title="出品者" value={`${sellerCount} 人`} href="/admin/users?role=SELLER" />
          <DashboardCard title="出品商品" value={`${productCount} 件`} href="/products" external />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin/users" className="amazon-btn-dark px-5 py-2 text-sm text-white">
            ユーザー一覧
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  href,
  external,
}: {
  title: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  const className = "amazon-card block p-5 transition hover:shadow-md";
  if (external) {
    return (
      <a href={href} className={className}>
        <p className="text-sm text-[#565959]">{title}</p>
        <p className="mt-2 text-2xl font-bold">{value}</p>
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      <p className="text-sm text-[#565959]">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </Link>
  );
}
