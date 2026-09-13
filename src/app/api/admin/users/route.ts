import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ROLE_LABELS } from "@/lib/auth-utils";
import type { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") as Role | null;

  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
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

  return NextResponse.json(
    users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      roleLabel: ROLE_LABELS[user.role],
      isActive: user.isActive,
      productCount: user._count.products,
      createdAt: user.createdAt.toISOString(),
    }))
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "新規アカウントの作成は無効になっています" },
    { status: 403 }
  );
}
