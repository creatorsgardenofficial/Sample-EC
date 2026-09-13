"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROLE_LABELS } from "@/lib/auth-utils";
import type { Role } from "@prisma/client";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: Role;
  roleLabel: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
};

export function AdminUserList({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function toggleActive(user: AdminUserRow) {
    setLoadingId(user.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "更新に失敗しました");
      }

      router.refresh();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error ? toggleError.message : "更新に失敗しました"
      );
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(user: AdminUserRow) {
    if (!window.confirm(`${user.name} を削除しますか？`)) return;

    setLoadingId(user.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

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
      setLoadingId(null);
    }
  }

  if (users.length === 0) {
    return (
      <div className="amazon-card p-8 text-center text-[#565959]">
        該当するユーザーがいません。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="amazon-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f0f2f2] text-xs uppercase text-[#565959]">
            <tr>
              <th className="px-4 py-3">名前</th>
              <th className="px-4 py-3">メール</th>
              <th className="px-4 py-3">ロール</th>
              <th className="px-4 py-3">出品数</th>
              <th className="px-4 py-3">状態</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[#ddd]">
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{ROLE_LABELS[user.role]}</td>
                <td className="px-4 py-3">{user.productCount}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {user.isActive ? "有効" : "無効"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.role !== "ADMIN" ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={loadingId === user.id}
                        onClick={() => toggleActive(user)}
                        className="text-[#007185] hover:underline disabled:opacity-50"
                      >
                        {user.isActive ? "無効化" : "有効化"}
                      </button>
                      <button
                        type="button"
                        disabled={loadingId === user.id}
                        onClick={() => handleDelete(user)}
                        className="text-[#b12704] hover:underline disabled:opacity-50"
                      >
                        削除
                      </button>
                    </div>
                  ) : (
                    <span className="text-[#565959]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
