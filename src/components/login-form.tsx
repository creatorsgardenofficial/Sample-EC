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

function loginErrorMessage(errorCode: string | null): string | null {
  if (!errorCode) return null;
  if (errorCode === "CredentialsSignin") {
    return "メールアドレスまたはパスワードが正しくないか、このログイン画面では使用できません";
  }
  if (errorCode === "Configuration") {
    return "認証設定に問題があります。AUTH_SECRET と DATABASE_URL を確認してください。";
  }
  return "ログインに失敗しました。入力内容を確認してください。";
}

function LoginFormInner({ expectedRole }: { expectedRole: LoginRole }) {
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") ?? defaultRedirectForRole(expectedRole);
  const [error, setError] = useState<string | null>(
    loginErrorMessage(searchParams.get("error"))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const destination = resolveRedirectUrl(callbackUrl, expectedRole);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        loginRole: expectedRole,
        redirect: false,
        callbackUrl: destination,
      });

      if (!result || result.error || result.ok === false) {
        setError(
          "メールアドレスまたはパスワードが正しくないか、このログイン画面では使用できません"
        );
        return;
      }

      const session = await fetchSessionWithRetry();
      if (!session.user?.role) {
        setError(
          "ログイン処理は完了しましたが、セッションを確立できませんでした。Vercel の AUTH_SECRET 設定と再デプロイを確認してください。"
        );
        return;
      }

      window.location.assign(
        resolveRedirectUrl(callbackUrl, session.user.role as LoginRole)
      );
    } catch {
      setError("ログイン中にエラーが発生しました。時間をおいて再度お試しください。");
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
