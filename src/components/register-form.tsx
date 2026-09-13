"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegisterForm() {
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
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "登録に失敗しました");
      }

      router.push("/login?registered=1");
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
        <span className="text-sm font-bold">お名前</span>
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
        {isSubmitting ? "登録中..." : "アカウントを作成"}
      </button>

      <p className="text-xs text-[#565959]">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="text-[#007185] hover:underline">
          ログイン
        </Link>
      </p>
    </form>
  );
}
