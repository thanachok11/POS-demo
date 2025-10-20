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
  width?: number; // tile width (px)
  height?: number; // image height (px)
  reverse?: boolean;
  className?: string;
  emptyMessage?: string;
};

export default function TopProductsSlider({
  items,
  width = 200,
  height = 150, // สูงเฉพาะส่วน "รูป"
  reverse = false,
  className = "",
  emptyMessage = "— ไม่มีข้อมูลสินค้า —",
}: Props) {
  if (!items.length) {
    return (
      <div className={`top5-slider ${className}`.trim()}>
        <div className="top5-empty">{emptyMessage}</div>
      </div>
    );
  }

  const cssVars = {
    "--width": `${width}px`,
    "--imgH": `${height}px`,
    "--cap": `80px`, // สูงส่วน caption ใต้รูป
    "--quantity": `${items.length || 0}`,
  } as React.CSSProperties;

  return (
    <div
      className={`top5-slider ${className}`.trim()}
      style={cssVars}
      data-reverse={reverse ? "true" : undefined}
    >
      <div className="list">
        {items.map((it, idx) => {
          const rank = typeof it.rank === "number" ? it.rank : idx + 1;
          return (
            <div
              className="item"
              key={`${it.name}-${idx}`}
              data-rank={rank}
              style={{ "--position": `${idx + 1}` } as React.CSSProperties}
              title={it.name}
            >
              <div className={`rank-badge rank-${rank}`}>#{rank}</div>
              <div className="img-wrap">
                <img
                  src={
                    it.imageUrl ||
                    "https://cdn-icons-png.flaticon.com/512/2331/2331970.png"
                  }
                  alt={it.name}
                  loading="lazy"
                />
              </div>

              <div className="caption">
                <div className="title" title={it.name}>
                  {it.name}
                </div>
                <div className="sub">
                  {typeof it.quantity === "number" && (
                    <span>{it.quantity.toLocaleString()} ชิ้น</span>
                  )}
                  {typeof it.revenue !== "undefined" && (
                    <span>฿{Number(it.revenue || 0).toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
