import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  PieLabelRenderProps,
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

const RADIAN = Math.PI / 180;

const renderPercentLabel = ({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: PieLabelRenderProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const angle = -midAngle * RADIAN;
  const x = cx + radius * Math.cos(angle);
  const y = cy + radius * Math.sin(angle);
  const anchor = x > cx ? "start" : "end";
  const safePercent = Number.isFinite(percent) ? percent : 0;
  const percentageLabel = `${Math.max(0, Math.round((safePercent || 0) * 100))}%`;
  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      fontSize={12}
      fontWeight={600}
      textAnchor={anchor}
      dominantBaseline="central"
    >
      {percentageLabel}
    </text>
  );
};

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
          <PieChart style={{ width: "100%", height: "100%" }}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="72%"
              outerRadius="100%"
              paddingAngle={5}
              cornerRadius="45%"
              labelLine={false}
              label={renderPercentLabel}
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