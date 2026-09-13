import { AuthCard } from "@/components/layout";
import { LoginPageClient } from "@/components/login-form";
import { LOGIN_TITLES } from "@/lib/login";

export default function AdminLoginPage() {
  return (
    <AuthCard title={LOGIN_TITLES.ADMIN}>
      <LoginPageClient expectedRole="ADMIN" />
    </AuthCard>
  );
}
