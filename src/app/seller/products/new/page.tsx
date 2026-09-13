import { PageContainer, SectionTitle } from "@/components/layout";
import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  return (
    <PageContainer>
      <SectionTitle
        title="商品出品"
        description="一覧用画像・詳細用画像・価格・動画ファイル・説明文を登録します"
      />
      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <ProductForm />
      </div>
    </PageContainer>
  );
}
