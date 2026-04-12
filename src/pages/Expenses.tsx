import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from "../store/slices/expensesSlice";
import { fetchCategories } from "../store/slices/categoriesSlice";
import { fetchBudgets } from "../store/slices/budgetsSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import MonthYearSelector from "../components/MonthYearSelector";
import toast from "react-hot-toast";

const Expenses = () => {
  const dispatch = useAppDispatch();
  const { expenses } = useAppSelector((state) => state.expenses);
  const { categories } = useAppSelector((state) => state.categories);
  const { budgets } = useAppSelector((state) => state.budgets);
  const { month, year } = useAppSelector((state) => state.summary);
  const currency = useAppSelector((state) => state.user.user?.currency || "USD");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    categoryId: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchBudgets());
  }, [dispatch, month, year]);

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch, month, year]);

  useEffect(() => {
    // Update form date when month/year changes
    const currentDay = new Date().getDate();
    const newDate = new Date(year, month - 1, currentDay);
    setFormData((prev) => ({
      ...prev,
      date: newDate.toISOString().split("T")[0],
    }));
  }, [month, year]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.amount || !formData.date) return;

  const expenseData = {
    amount: parseFloat(formData.amount),
    categoryId: formData.categoryId || undefined,
    description: formData.description || undefined,
    date: formData.date,
  };

  try {
    if (editingId) {
      await dispatch(updateExpense({ id: editingId, expenseData })).unwrap();
      toast.success("Expense updated successfully");
    } else {
      await dispatch(createExpense(expenseData)).unwrap();
      toast.success("Expense created successfully");
    }

    // Reset form + close menu
    const currentDay = new Date().getDate();
    const newDate = new Date(year, month - 1, currentDay);
    setFormData({
      amount: "",
      categoryId: "",
      description: "",
      date: newDate.toISOString().split("T")[0],
    });
    setIsAdding(false);
    setEditingId(null);

    // Refetch data
    dispatch(fetchExpenses());

  } catch (err: any) {
    toast.error(err.message || "Failed to save expense");
  }
};

  const handleEdit = (expense: any) => {
    setFormData({
      amount: expense.amount.toString(),
      categoryId: expense.categoryId || "",
      description: expense.description || "",
      date: new Date(expense.date).toISOString().split("T")[0],
    });
    setEditingId(expense._id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await dispatch(deleteExpense(id)).unwrap();
        // Refetch data to update summary
        dispatch(fetchExpenses());
      } catch (err: any) {
        toast.error(err.message || "Failed to delete expense");
      }
    }
  };

  const resetForm = () => {
    const currentDay = new Date().getDate();
    const newDate = new Date(year, month - 1, currentDay);
    setFormData({
      amount: "",
      categoryId: "",
      description: "",
      date: newDate.toISOString().split("T")[0],
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const getCurrency = (value: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Uncategorized";
    const cat = categories.find((c) => c._id === categoryId);
    return cat?.name || "Unknown";
  };

  const getRemainingBudget = (categoryId: string) => {
    const budget = budgets.find(
      (b) => b.categoryId === categoryId && b.month === month && b.year === year
    );
    if (!budget) return null;

    const categoryExpenses = expenses
      .filter((e) => e.categoryId === categoryId)
      .reduce((sum, e) => sum + e.amount, 0);

    return budget.limit - categoryExpenses;
  };

  return (
    <div className="w-full flex flex-col gap-6 px-6 py-3">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-fg)" }}>
          Expenses
        </h1>
        <MonthYearSelector />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Expenses</CardTitle>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-accent2 text-fg hover:bg-accent2/80"
          >
            {isAdding ? "Cancel" : "Add Expense"}
          </Button>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <form onSubmit={handleSubmit} className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-fg"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category (optional)</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-fg"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {formData.categoryId && getRemainingBudget(formData.categoryId) !== null && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Remaining budget: </span>
                    <span
                      className={
                        getRemainingBudget(formData.categoryId)! >= 0
                          ? "font-semibold text-green-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {getCurrency(getRemainingBudget(formData.categoryId)!)}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-fg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-fg"
                  placeholder="Add notes..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-accent2 text-fg hover:bg-accent2/80"
                >
                  {editingId ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="text-fg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <div key={expense._id} className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getCurrency(expense.amount)}</span>
                      <span className="text-sm text-muted-foreground">
                        {getCategoryName(expense.categoryId)}
                      </span>
                    </div>
                    {expense.description && (
                      <div className="text-sm text-muted-foreground mt-1">{expense.description}</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(expense)}
                      className="text-fg"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(expense._id)}
                      className="text-fg"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No expenses recorded for this month
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;