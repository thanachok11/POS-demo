import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

interface PieItem {
  name: string;
  value: number;
}

interface DashboardPieChartCardProps {
  data: PieItem[];
  loading: boolean;
  emptyMessage: string;
  valueFormatter?: (value: number) => string;
  colors: string[];
}

const DashboardPieChartCard: React.FC<DashboardPieChartCardProps> = ({
  data,
  loading,
  emptyMessage,
  valueFormatter,
  colors,
}) => {
  if (loading) {
    return <p className="empty-state">กำลังโหลดกราฟ...</p>;
  }

  if (!data.length) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  const chartData = data.map((item) => ({ ...item, value: Number(item.value) }));

  return (
    <>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`${entry.name}-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                valueFormatter ? valueFormatter(value) : value.toLocaleString("th-TH")
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="pie-legend">
        {chartData.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="pie-legend-item">
            <span
              className="pie-dot"
              style={{ background: colors[index % colors.length] }}
            />
            <span>{entry.name}</span>
            <span className="card-subtitle">
              {valueFormatter
                ? valueFormatter(entry.value)
                : entry.value.toLocaleString("th-TH")}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default DashboardPieChartCard;
