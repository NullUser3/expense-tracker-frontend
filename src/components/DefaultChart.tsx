/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DefaultChartProps {
  height?: number;
}

const defaultData = [
  { name: "No data", value: 100 },
];

const DefaultChart: React.FC<DefaultChartProps> = ({ height = 300 }) => {
  const GREY_COLOR = "#A3A3A3";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={defaultData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill={GREY_COLOR}
          dataKey="value"
        >
          <Cell fill={GREY_COLOR} />
        </Pie>
        <Tooltip formatter={(_: any) => ["--", "Amount"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DefaultChart;