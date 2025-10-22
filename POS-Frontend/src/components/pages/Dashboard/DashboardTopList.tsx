import React from "react";
import TopProductsSlider from "../TopProductsSlider";

export interface TopProductItem {
    rank: number;
    name: string;
    quantity: number;
    revenue: number;
    imageUrl?: string;
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

    return (
        <TopProductsSlider
        items={items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            revenue: item.revenue,
            rank: item.rank,
            imageUrl: item.imageUrl,
        }))}
        emptyMessage={emptyMessage}
        />
    );
};

export default DashboardTopList;