import React, { useId } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

interface ChartPoint {
  label: string;
  value: number;
}

interface DashboardLineChartCardProps {
  data: ChartPoint[];
  loading: boolean;
  emptyMessage: string;
  valueFormatter?: (value: number) => string;
  color: string;
  type?: "line" | "area";
}

const DashboardLineChartCard: React.FC<DashboardLineChartCardProps> = ({
  data,
  loading,
  emptyMessage,
  valueFormatter,
  color,
  type = "line",
}) => {
  const gradientId = useId().replace(/:/g, "");

  if (loading) {
    return <p className="empty-state">กำลังโหลดกราฟ...</p>;
  }

  if (!data.length) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  const tooltipFormatter = (value: number) =>
    valueFormatter ? valueFormatter(value) : value.toLocaleString("th-TH");

  if (type === "area") {
    return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, left: -16, right: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" tickFormatter={(value) => value.toLocaleString("th-TH")} />
            <Tooltip formatter={(val: number) => tooltipFormatter(val)} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, left: -16, right: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" tickFormatter={(value) => value.toLocaleString("th-TH")} />
          <Tooltip formatter={(val: number) => tooltipFormatter(val)} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardLineChartCard;
