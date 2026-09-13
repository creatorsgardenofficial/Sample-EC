"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function normalizeCallbackPath(path: string): string {
  const collapsed = path.replace(/\/{2,}/g, "/");
  if (!collapsed.startsWith("/") || collapsed.startsWith("//")) {
    return "/seller";
  }
  return collapsed.startsWith("/seller") ? collapsed : "/seller";
}

function SellerRegisterFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = normalizeCallbackPath(searchParams.get("callbackUrl") ?? "/seller");
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
    };

    try {
      const response = await fetch("/api/auth/register/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "登録に失敗しました");
      }

      const loginUrl = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}&registered=1`;
      router.push(loginUrl);
    } catch (registerError) {
      setError(
        registerError instanceof Error ? registerError.message : "登録に失敗しました"
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

      <label className="block space-y-1">
        <span className="text-sm font-bold">出品者名 / ショップ名</span>
        <input
          type="text"
          name="name"
          required
          className="amazon-input w-full px-3 py-2 text-sm"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-bold">メールアドレス</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="amazon-input w-full px-3 py-2 text-sm"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-bold">パスワード（8文字以上）</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="amazon-input w-full px-3 py-2 text-sm"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="amazon-btn-primary w-full py-2 text-sm font-medium text-[#0f1111] disabled:opacity-60"
      >
        {isSubmitting ? "登録中..." : "出品者アカウントを作成"}
      </button>

      <p className="text-xs text-[#565959]">
        すでに出品者アカウントをお持ちの方は{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-[#007185] hover:underline"
        >
          出品者ログイン
        </Link>
      </p>
    </form>
  );
}

export function SellerRegisterForm() {
  return (
    <Suspense fallback={<p className="text-sm text-[#565959]">読み込み中...</p>}>
      <SellerRegisterFormInner />
    </Suspense>
  );
}
