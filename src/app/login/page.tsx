import { AuthCard } from "@/components/layout";
import { LoginPageClient } from "@/components/login-form";
import { LOGIN_TITLES } from "@/lib/login";

export default function UserLoginPage() {
  return (
    <AuthCard title={LOGIN_TITLES.USER}>
      <LoginPageClient expectedRole="USER" />
    </AuthCard>
  );
}
