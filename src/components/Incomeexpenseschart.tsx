import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from "../components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchSummaryHistory } from "../store/slices/summarySlice";
import { useEffect } from "react";

const placeholderData = [
  { label: "Sep", income: 4200, expenses: 3100 },
  { label: "Oct", income: 4500, expenses: 3800 },
  { label: "Nov", income: 4100, expenses: 2900 },
  { label: "Dec", income: 5200, expenses: 4600 },
  { label: "Jan", income: 4800, expenses: 3200 },
  { label: "Feb", income: 4600, expenses: 3500 },
];

const chartConfig = {
  income: {
    label: "Income",
    color: "#7fdac2",
  },
  expenses: {
    label: "Expenses",
    color: "#c1666b",
  },
};

export const IncomeExpensesChart = () => {
  const dispatch = useAppDispatch();
  const { history, historyStatus } = useAppSelector((state) => state.summary);

  useEffect(() => {
    dispatch(fetchSummaryHistory(6));
  }, [dispatch]);

  // Use real data if available, fallback to placeholder while loading
  const chartData =
    historyStatus === "succeeded" && history.length > 0
      ? history
      : placeholderData;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium tracking-wide uppercase text-fg">
          Income vs Expenses
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Last 6 months overview
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="var(--border)"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    `$${Number(value).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  }
                />
              }
            />
            <Legend content={<ChartLegendContent />} />
            <Bar
              dataKey="income"
              fill={chartConfig.income.color}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              fill={chartConfig.expenses.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};