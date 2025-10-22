import React from "react";

export interface KpiCardItem {
    id: string;
    title: string;
    value: string;
    change?: number | null;
    changeText?: string;
    footnote?: string;
    trend?: "positive" | "negative" | "neutral";
}

interface DashboardKpiRowProps {
    items: KpiCardItem[];
    loading: boolean;
}

const DashboardKpiRow: React.FC<DashboardKpiRowProps> = ({ items, loading }) => {
    if (loading) {
        return <p className="empty-state">กำลังโหลดข้อมูลภาพรวม...</p>;
    }

    return (
        <div className="kpi-row">
        {items.map((item) => {
            const changeValue =
            typeof item.change === "number"
                ? `${item.change > 0 ? "+" : ""}${item.change.toFixed(2)}%`
                : item.changeText;
            const trend =
            item.trend ||
            (typeof item.change === "number"
                ? item.change > 0
                ? "positive"
                : item.change < 0
                ? "negative"
                : "neutral"
                : "neutral");
            const icon =
            typeof item.change === "number"
                ? item.change > 0
                ? "▲"
                : item.change < 0
                ? "▼"
                : "▬"
                : "•";

            return (
            <div key={item.id} className="kpi-card">
                <p className="kpi-title">{item.title}</p>
                <p className="kpi-value">{item.value}</p>
                {changeValue && (
                <span className={`kpi-change ${trend}`}>
                    <span>{icon}</span>
                    {changeValue}
                </span>
                )}
                {item.footnote && <span className="card-subtitle">{item.footnote}</span>}
            </div>
            );
        })}
        </div>
    );
};

export default DashboardKpiRow;