import { SITE_NAME } from "@/lib/site";
import { mockRating, renderStarRating } from "@/lib/product-display";
import Link from "next/link";
import { formatPrice, type Product } from "@/lib/types";

function ProductImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-white text-xs text-[#565959] ${className}`}
      >
        No Image
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
    />
  );
}

export function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const rating = mockRating(product.id);
  const imageHeight = compact ? "h-[180px]" : "h-[220px]";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex h-full flex-col bg-white p-2 transition hover:outline hover:outline-1 hover:outline-[#007185]"
    >
      <div
        className={`relative mb-2 flex ${imageHeight} w-full items-center justify-center overflow-hidden bg-white`}
      >
        <ProductImage
          src={product.listImageUrl}
          alt={product.title}
          className="max-h-[92%] max-w-full object-contain transition duration-200 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col px-1 pb-2">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] leading-[1.35] text-[#0f1111] group-hover:text-[#c7511f]">
          {product.title}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-[#007185]">
          <span className="amazon-stars text-[13px] leading-none text-[#ffa41c]">
            {renderStarRating(rating.score)}
          </span>
          <span className="text-xs">{rating.count.toLocaleString("ja-JP")}</span>
        </div>
        <div className="mt-1">
          <div className="flex items-start leading-none text-[#0f1111]">
            <span className="pt-1 text-[13px]">￥</span>
            <span className="text-[21px] font-normal tracking-tight">
              {product.price.toLocaleString("ja-JP")}
            </span>
          </div>
        </div>
        <p className="amazon-prime-badge mt-2 w-fit">prime</p>
        {product.sellerName ? (
          <p className="mt-1 line-clamp-1 text-xs text-[#565959]">{product.sellerName}</p>
        ) : null}
      </div>
    </Link>
  );
}

export function ProductGrid({
  products,
  columns = "default",
}: {
  products: Product[];
  columns?: "default" | "home";
}) {
  if (products.length === 0) {
    return (
      <div className="bg-white p-10 text-center text-[#565959]">
        該当する商品がありません。
      </div>
    );
  }

  const gridClass =
    columns === "home"
      ? "grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      : "grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-4";

  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} compact={columns === "home"} />
      ))}
    </div>
  );
}

export function ProductResultsHeader({
  query,
  count,
}: {
  query?: string;
  count: number;
}) {
  const label = query
    ? `「${query}」の検索結果 ${count.toLocaleString("ja-JP")}件`
    : `商品一覧 ${count.toLocaleString("ja-JP")}件`;

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#ddd] bg-white px-4 py-3 text-sm">
      <p className="text-[#565959]">
        <span className="font-bold text-[#c7511f]">{count.toLocaleString("ja-JP")}件</span>
        {query ? (
          <>
            {" "}
            の結果
            <span className="text-[#0f1111]">（検索: {query}）</span>
          </>
        ) : (
          " の商品"
        )}
      </p>
      <label className="flex items-center gap-2 text-[#0f1111]">
        <span className="text-[#565959]">並べ替え:</span>
        <select className="amazon-input px-2 py-1 text-sm" defaultValue="featured">
          <option value="featured">おすすめ順</option>
          <option value="price-asc">価格: 安い順</option>
          <option value="price-desc">価格: 高い順</option>
          <option value="newest">新着順</option>
        </select>
      </label>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function SearchForm({
  defaultQuery = "",
  action = "/products",
  variant = "default",
}: {
  defaultQuery?: string;
  action?: string;
  variant?: "default" | "header";
}) {
  if (variant === "header") {
    return (
      <form action={action} method="get" className="flex w-full overflow-hidden rounded-md">
        <select
          aria-label="カテゴリー"
          className="hidden shrink-0 border border-r-0 border-[#888c8c] bg-[#f3f3f3] px-3 py-2 text-xs text-[#0f1111] sm:block"
          defaultValue="all"
        >
          <option value="all">すべて</option>
          <option value="electronics">家電</option>
          <option value="pc">PC</option>
        </select>
        <input
          type="search"
          name="q"
          defaultValue={defaultQuery}
          placeholder={`${SITE_NAME}で検索`}
          className="amazon-input min-w-0 flex-1 rounded-none border-r-0 px-4 py-2 text-sm text-[#0f1111]"
        />
        <button
          type="submit"
          style={{ background: "var(--amazon-yellow)" }}
          className="amazon-search-btn shrink-0 px-4 text-[#0f1111]"
          aria-label="検索"
        >
          🔍
        </button>
      </form>
    );
  }

  return (
    <form action={action} method="get" className="flex gap-2">
      <input
        type="search"
        name="q"
        defaultValue={defaultQuery}
        placeholder="商品名・キーワードで検索"
        className="amazon-input flex-1 px-4 py-3 text-sm"
      />
      <button
        type="submit"
        className="amazon-btn-primary px-6 py-3 text-sm font-medium text-[#0f1111]"
      >
        検索
      </button>
    </form>
  );
}

export { formatPrice };
