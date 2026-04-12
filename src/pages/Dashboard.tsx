import { useEffect, useState, type ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchSummary, fetchSummaryHistory, type SummaryState } from "../store/slices/summarySlice";
import { fetchCategories, fetchCategoryTotals } from "../store/slices/categoriesSlice";
import { changeCurrency } from "../store/slices/userSlice";
import { IncomeExpensesChart } from "../components/Incomeexpenseschart";
import CategoriesList from "../components/CategoriesList";
import CategoriesChart from "../components/CategoriesChart";
import MonthYearSelector from "../components/MonthYearSelector";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Lightbulb, X } from "lucide-react";

const getCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const stats = (summary: SummaryState, currency: string) => [
  {
    title: "Total Balance",
    value: getCurrency(summary.totalBalance, currency),
    change: "As of this month",
    positive: summary.totalBalance >= 0,
    icon: Wallet,
    color: "#275DAD",
  },
  {
    title: "Income",
    value: getCurrency(summary.totalIncome, currency),
    change: `Savings rate: ${summary.savingsRate?.toFixed(1) ?? 0}%`,
    positive: true,
    icon: TrendingUp,
    color: "#7fdac2",
  },
  {
    title: "Expenses",
    value: getCurrency(summary.totalExpenses, currency),
    change: "Track reduction opportunities",
    positive: false,
    icon: TrendingDown,
    color: "#c1666b",
  },
  {
    title: "Net Savings",
    value: getCurrency(summary.netSavings, currency),
    change: "Keep building",
    positive: summary.netSavings >= 0,
    icon: PiggyBank,
    color: "#89608E",
  },
];

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const summary = useAppSelector((state) => state.summary);
  const categories = useAppSelector((state) => state.categories.categories);
  const currency = useAppSelector((state) => state.user.user?.currency || "USD");
  const user = useAppSelector((state) => state.user.user);

  const { month, year } = useAppSelector((state) => state.summary);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding && user?.role === "user") {
      setShowOnboarding(true);
    }
  }, [user]);

  const dismissOnboarding = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowOnboarding(false);
  };

  // Fetch all data on component mount
  useEffect(() => {
    dispatch(fetchSummary());
    dispatch(fetchSummaryHistory(6));
    dispatch(fetchCategoryTotals());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Refetch summary when month/year changes
  useEffect(() => {
    dispatch(fetchSummary());
    dispatch(fetchCategoryTotals());
  }, [dispatch, month, year]);

  const cards = stats(summary, currency);

  const handleCurrencyChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedCurrency = event.target.value;
    await dispatch(changeCurrency(selectedCurrency)).unwrap();
  };

  return (
    <div className="w-full flex flex-col gap-6 px-6 py-3">
      {/* Onboarding Alert for First-Time Users */}
      {showOnboarding && (
        <Alert variant="info" className="border-blue-500/30 bg-blue-500/10 relative">
          <button
            onClick={dismissOnboarding}
            className="absolute top-2 right-2 p-1 rounded-md hover:bg-blue-500/20 transition-colors"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-center h-full mb-1">
            <Lightbulb className="h-4 w-4 inline-block items-center mr-1" />
            <AlertTitle>Getting started with Expense Tracker</AlertTitle>
          </div>
          
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <p>Follow these steps to set up your finances:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li><strong>Create Categories</strong> - Set up spending categories (e.g., Food, Transport, Entertainment)</li>
                <li><strong>Set Budgets</strong> - Define monthly budget limits for each category</li>
                <li><strong>Track Expenses</strong> - Log your daily expenses and monitor your spending</li>
              </ol>
              <Button
                onClick={dismissOnboarding}
                size="sm"
                className="mt-4 hover:bg-accent2"
                variant="ghost"
              >
                Got it, thanks!
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--color-fg)" }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Currency: {currency}
          </p>
        </div>

        <div className="flex gap-3  items-center justify-between">
          <div>
            <label className="sr-only" htmlFor="currency-select">
              Select currency
            </label>
            <select
              id="currency-select"
              value={currency}
              onChange={handleCurrencyChange}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-fg outline-none focus:border-accent2 focus:ring-2 focus:ring-accent2/40"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
          <MonthYearSelector />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {cards.map(({ title, value, change, positive, icon: Icon, color }) => {
          const bg = color !== "#7fdac2" ? `${color}2A` : `${color}6A`;
          return (
            <Card
              key={title}
              className="relative overflow-hidden transition-shadow"
              style={{ background: bg }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm text-fg font-medium tracking-wide uppercase">
                  {title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-background">
                  <Icon size={16} style={{ color }} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xl font-bold tracking-tight mb-1 text-fg">
                  {value}
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ color: positive ? "#3a6ea5" : "#c1666b" }}
                >
                  {positive ? "▲" : "▼"} {change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <IncomeExpensesChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoriesList categories={categories} />
        <CategoriesChart categories={categories} />
      </div>

    </div>
  );
};

export default Dashboard;