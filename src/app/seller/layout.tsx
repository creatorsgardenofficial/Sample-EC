import { SellerHeader } from "@/components/seller-header";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "var(--amazon-bg)" }}>
      <SellerHeader />
      {children}
    </div>
  );
}
