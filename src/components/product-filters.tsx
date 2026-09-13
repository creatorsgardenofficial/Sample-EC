import Link from "next/link";

type ProductFiltersProps = {
  query?: string;
};

const PRICE_RANGES = [
  { label: "￥0 - ￥1,000", min: 0, max: 1000 },
  { label: "￥1,000 - ￥5,000", min: 1000, max: 5000 },
  { label: "￥5,000 - ￥10,000", min: 5000, max: 10000 },
  { label: "￥10,000以上", min: 10000, max: null },
];

export function ProductFilters({ query }: ProductFiltersProps) {
  return (
    <aside className="hidden w-[220px] shrink-0 lg:block">
      <div className="space-y-5 text-sm text-[#0f1111]">
        <section>
          <h2 className="mb-2 font-bold">カテゴリー</h2>
          <ul className="space-y-1 text-[#007185]">
            <li>
              <Link href="/products" className="hover:text-[#c7511f] hover:underline">
                すべてのカテゴリー
              </Link>
            </li>
            <li>
              <Link href="/products?q=イヤホン" className="hover:text-[#c7511f] hover:underline">
                イヤホン
              </Link>
            </li>
            <li>
              <Link href="/products?q=充電" className="hover:text-[#c7511f] hover:underline">
                充電器
              </Link>
            </li>
            <li>
              <Link href="/products?q=PC" className="hover:text-[#c7511f] hover:underline">
                PCアクセサリ
              </Link>
            </li>
          </ul>
        </section>

        {query ? (
          <section>
            <h2 className="mb-2 font-bold">検索キーワード</h2>
            <p className="text-[#565959]">「{query}」</p>
          </section>
        ) : null}

        <section>
          <h2 className="mb-2 font-bold">お届け先</h2>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5" defaultChecked />
            <span>Prime 対象</span>
          </label>
        </section>

        <section>
          <h2 className="mb-2 font-bold">お客様の評価</h2>
          <ul className="space-y-1">
            {[4, 3, 2].map((stars) => (
              <li key={stars}>
                <label className="flex cursor-pointer items-center gap-2 hover:text-[#c7511f]">
                  <input type="checkbox" />
                  <span className="amazon-stars text-sm">{renderStars(stars)}</span>
                  <span className="text-[#007185]">以上</span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold">価格</h2>
          <ul className="space-y-1">
            {PRICE_RANGES.map((range) => (
              <li key={range.label}>
                <span className="text-[#007185] hover:text-[#c7511f] hover:underline">
                  {range.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold">ブランド</h2>
          <ul className="space-y-1 text-[#007185]">
            <li className="hover:text-[#c7511f] hover:underline">Sample Brand</li>
            <li className="hover:text-[#c7511f] hover:underline">TechGear</li>
            <li className="hover:text-[#c7511f] hover:underline">HomePlus</li>
          </ul>
        </section>
      </div>
    </aside>
  );
}

function renderStars(count: number) {
  return "★".repeat(count) + "☆".repeat(5 - count);
}
