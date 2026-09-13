import { AuthCard } from "@/components/layout";
import { LoginPageClient } from "@/components/login-form";
import { LOGIN_TITLES } from "@/lib/login";

export default function SellerLoginPage() {
  return (
    <AuthCard title={LOGIN_TITLES.SELLER}>
      <LoginPageClient expectedRole="SELLER" />
    </AuthCard>
  );
}
