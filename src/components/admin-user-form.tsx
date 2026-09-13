"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Role } from "@prisma/client";

export function AdminUserForm({ defaultRole }: { defaultRole: Role }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      role: defaultRole,
    };

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "作成に失敗しました");
      }

      router.push("/admin/users");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "作成に失敗しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <div className="rounded border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <p className="text-sm text-[#565959]">
        ロール: <strong>{defaultRole === "SELLER" ? "出品者" : "一般ユーザー"}</strong>
      </p>

      <label className="block space-y-1">
        <span className="text-sm font-bold">名前</span>
        <input type="text" name="name" required className="amazon-input w-full px-3 py-2 text-sm" />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-bold">メールアドレス</span>
        <input type="email" name="email" required className="amazon-input w-full px-3 py-2 text-sm" />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-bold">初期パスワード（8文字以上）</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="amazon-input w-full px-3 py-2 text-sm"
        />
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="amazon-btn-primary px-6 py-2 text-sm font-medium text-[#0f1111] disabled:opacity-60"
        >
          {isSubmitting ? "作成中..." : "アカウントを作成"}
        </button>
        <Link href="/admin/users" className="amazon-btn-dark px-6 py-2 text-sm text-white">
          キャンセル
        </Link>
      </div>
    </form>
  );
}
