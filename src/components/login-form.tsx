"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import {
  defaultRedirectForRole,
  type LoginRole,
} from "@/lib/login";

function normalizeCallbackPath(path: string): string {
  const collapsed = path.replace(/\/{2,}/g, "/");
  if (!collapsed.startsWith("/") || collapsed.startsWith("//")) {
    return "/";
  }
  return collapsed;
}

function resolveRedirectUrl(
  callbackUrl: string,
  expectedRole: LoginRole
): string {
  const safeCallback = normalizeCallbackPath(callbackUrl);
  const defaultPath = defaultRedirectForRole(expectedRole);

  if (safeCallback !== "/") {
    return safeCallback;
  }

  return defaultPath;
}

async function fetchSessionWithRetry() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const sessionResponse = await fetch("/api/auth/session");
    const session = (await sessionResponse.json()) as {
      user?: { role?: string };
    };
    if (session.user) return session;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return { user: undefined };
}

function LoginFormInner({ expectedRole }: { expectedRole: LoginRole }) {
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") ?? defaultRedirectForRole(expectedRole);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      loginRole: expectedRole,
      redirect: false,
    });

    if (result?.error) {
      setError("メールアドレスまたはパスワードが正しくないか、このログイン画面では使用できません");
      setIsSubmitting(false);
      return;
    }

    const session = await fetchSessionWithRetry();
    const destination = resolveRedirectUrl(callbackUrl, expectedRole);
    window.location.assign(destination);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <div className="rounded border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

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
        <span className="text-sm font-bold">パスワード</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="amazon-input w-full px-3 py-2 text-sm"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="amazon-btn-primary w-full py-2 text-sm font-medium text-[#0f1111] disabled:opacity-60"
      >
        {isSubmitting ? "ログイン中..." : "ログイン"}
      </button>

      <p className="text-xs text-[#565959]">
        新規アカウントの作成は管理者により無効化されています。アカウント情報は管理者にお問い合わせください。
      </p>
    </form>
  );
}

export function LoginPageClient({ expectedRole }: { expectedRole: LoginRole }) {
  return (
    <Suspense fallback={<p className="text-sm text-[#565959]">読み込み中...</p>}>
      <LoginFormInner expectedRole={expectedRole} />
    </Suspense>
  );
}
