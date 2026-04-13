/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import DefaultChart from "./DefaultChart";

interface Budget {
  _id: string;
  categoryId: string;
  categoryName?: string;
  limit: number;
  month: number;
  year: number;
  recurring: boolean;
  spent?: number;
}

interface BudgetsChartProps {
  budgets: Budget[];
}

const BudgetsChart: React.FC<BudgetsChartProps> = ({ budgets }) => {
  const data = budgets.map((budget) => ({
    name: budget.categoryName || "Unknown",
    budget: budget.limit,
    spent: budget.spent || 0,
  }));

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Budget vs Spent</CardTitle>
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
        <CardTitle>Budget vs Spent</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: any, name: any) => value ? [`$${Number(value).toFixed(2)}`, name === 'budget' ? 'Budget' : 'Spent'] : ["$0.00", name === 'budget' ? 'Budget' : 'Spent']} />
            <Bar dataKey="budget" fill="#4A7C59" name="Budget" />
            <Bar dataKey="spent" fill="#c1666b" name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BudgetsChart;