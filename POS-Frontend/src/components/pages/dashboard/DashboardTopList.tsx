import React from "react";

export interface TopProductItem {
  rank: number;
  name: string;
  quantity: number;
  revenue: number;
}

interface DashboardTopListProps {
  items: TopProductItem[];
  loading: boolean;
  emptyMessage: string;
}

const DashboardTopList: React.FC<DashboardTopListProps> = ({
  items,
  loading,
  emptyMessage,
}) => {
  if (loading) {
    return <p className="empty-state">กำลังโหลดรายการสินค้า...</p>;
  }

  if (!items.length) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="top5-list">
      {items.map((item) => (
        <div key={`${item.rank}-${item.name}`} className="top5-item">
          <span className="top5-rank">#{item.rank}</span>
          <span className="top5-name">{item.name}</span>
          <div className="top5-meta">
            <span>{item.quantity.toLocaleString("th-TH")} ชิ้น</span>
            <span>฿{item.revenue.toLocaleString("th-TH")}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardTopList;
