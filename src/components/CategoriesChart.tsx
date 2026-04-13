/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import DefaultChart from "./DefaultChart";

interface Category {
  _id: string;
  name: string;
  color?: string;
  total: number;
}

interface CategoriesChartProps {
  categories: Category[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const CategoriesChart: React.FC<CategoriesChartProps> = ({ categories }) => {
  const data = categories
    .filter((cat) => cat.total > 0)
    .map((cat, index) => ({
      name: cat.name,
      value: cat.total,
      color: cat.color || COLORS[index % COLORS.length],
    }));

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <DefaultChart />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => value ? [`$${Number(value).toFixed(2)}`, "Amount"] : ["$0.00", "Amount"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CategoriesChart;