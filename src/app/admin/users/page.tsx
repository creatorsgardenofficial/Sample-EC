import Link from "next/link";
import { AdminHeader, PageContainer, SectionTitle } from "@/components/layout";
import { AdminUserList, type AdminUserRow } from "@/components/admin-user-list";
import { ROLE_LABELS } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

type AdminUsersPageProps = {
  searchParams: Promise<{ role?: string }>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const { role: roleParam } = await searchParams;
  const role = (roleParam === "SELLER" || roleParam === "USER" ? roleParam : undefined) as
    | Role
    | undefined;

  const users = await prisma.user.findMany({
    where: role ? { role } : { role: { not: "ADMIN" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { products: true } },
    },
  });

  const rows: AdminUserRow[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    roleLabel: ROLE_LABELS[user.role],
    isActive: user.isActive,
    productCount: user._count.products,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen" style={{ background: "var(--amazon-bg)" }}>
      <AdminHeader />
      <PageContainer wide>
        <SectionTitle title="ユーザー管理" description="出品者・一般ユーザーの有効化/無効化・削除" />
        <div className="mb-4 flex flex-wrap gap-2">
          <FilterLink href="/admin/users" active={!role} label="すべて" />
          <FilterLink href="/admin/users?role=SELLER" active={role === "SELLER"} label="出品者" />
          <FilterLink href="/admin/users?role=USER" active={role === "USER"} label="一般ユーザー" />
        </div>
        <AdminUserList users={rows} />
      </PageContainer>
    </div>
  );
}

function FilterLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm ${
        active
          ? "bg-[#232f3e] text-white"
          : "amazon-card text-[#0f1111] hover:bg-[#f7fafa]"
      }`}
    >
      {label}
    </Link>
  );
}
