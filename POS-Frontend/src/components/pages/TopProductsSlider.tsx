import React from "react";
import "../../styles/page/TopProductsSlider.css";

type TopItem = {
  name: string;
  imageUrl?: string;
  quantity?: number;
  revenue?: number | string;
  rank?: number;
};

type Props = {
  items: TopItem[];
  className?: string;
  emptyMessage?: string;
};

const formatCurrency = (value: number | string | undefined) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "฿0";
  return `฿${numeric.toLocaleString("th-TH")}`;
};

export default function TopProductsSlider({
  items,
  className = "",
  emptyMessage = "— ไม่มีข้อมูลสินค้า —",
}: Props) {
  if (!items.length) {
    return (
      <div className={`top5-showcase ${className}`.trim()}>
        <div className="top5-empty">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={`top5-showcase ${className}`.trim()}>
      <div className="top5-list">
        {items.map((it, idx) => {
          const rank = typeof it.rank === "number" ? it.rank : idx + 1;
          return (
            <div className="top5-item" data-rank={rank} key={`${it.name}-${idx}`}>
              <span className="top5-rank">#{rank}</span>
              <div className="top5-name" title={it.name}>
                {it.name || "—"}
              </div>
              <div className="top5-meta">
                {typeof it.quantity === "number" && (
                  <span>{it.quantity.toLocaleString("th-TH")}&nbsp;ชิ้น</span>
                )}
                {typeof it.revenue !== "undefined" && (
                  <span>{formatCurrency(it.revenue)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
