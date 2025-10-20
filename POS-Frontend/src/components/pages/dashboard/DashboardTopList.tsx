import React from "react";
import TopProductsSlider from "../TopProductsSlider";

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
    <TopProductsSlider
      items={items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        revenue: item.revenue,
        rank: item.rank,
      }))}
    />
  );
};

export default DashboardTopList;
