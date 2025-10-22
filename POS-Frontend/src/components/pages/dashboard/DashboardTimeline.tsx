import React from "react";

interface TimelineItem {
  id: string;
  name: string;
  reference: string;
  type: string;
  quantity: number;
  timeText: string;
  direction: "in" | "out";
}

interface DashboardTimelineProps {
  items: TimelineItem[];
  loading: boolean;
  emptyMessage: string;
}

const DashboardTimeline: React.FC<DashboardTimelineProps> = ({
  items,
  loading,
  emptyMessage,
}) => {
  if (loading) {
    return <p className="empty-state">กำลังโหลดข้อมูล...</p>;
  }

  if (!items.length) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="timeline-list">
      {items.map((item) => (
        <div key={item.id} className="timeline-item">
          <span
            className={`timeline-dot ${item.direction === "out" ? "outgoing" : ""}`}
          />
          <div className="timeline-content">
            <div className="timeline-line1">
              <span className="name">{item.name}</span>
              <span>{item.timeText}</span>
            </div>
            <div className="timeline-line2">
              <span>
                {item.type} · {item.reference}
              </span>
              <span className="qty">
                {item.quantity ? `${item.quantity.toLocaleString("th-TH")} ชิ้น` : "-"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardTimeline;
