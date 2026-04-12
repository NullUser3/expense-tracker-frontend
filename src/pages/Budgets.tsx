import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchBudgets, createBudget, updateBudget, deleteBudget } from "../store/slices/budgetsSlice";
import { fetchCategories } from "../store/slices/categoriesSlice";
import BudgetsChart from "../components/BudgetsChart";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import MonthYearSelector from "../components/MonthYearSelector";
import toast from "react-hot-toast";

const Budgets = () => {
  const dispatch = useAppDispatch();
  const { budgets } = useAppSelector((state) => state.budgets);
  const { categories } = useAppSelector((state) => state.categories);
  const { month, year } = useAppSelector((state) => state.summary);
  const currency = useAppSelector((state) => state.user.user?.currency || "USD");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    limit: "",
    recurring: false,
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchBudgets());
  }, [dispatch, month, year]);

  useEffect(() => {
    // Reset form when month/year changes to ensure budget is for the selected period
    if (!editingId) {
      setFormData({ categoryId: "", limit: "", recurring: false });
    }
  }, [month, year, editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.categoryId || !formData.limit) return;

  const budgetData = {
    categoryId: formData.categoryId,
    limit: parseFloat(formData.limit),
    month,
    year,
    recurring: formData.recurring,
  };

  try {
    if (editingId) {
      await dispatch(updateBudget({ id: editingId, budgetData })).unwrap();
      toast.success("Budget updated successfully");
    } else {
      await dispatch(createBudget(budgetData)).unwrap();
      toast.success("Budget created successfully");
    }

    // Reset + close form
    setFormData({ categoryId: "", limit: "", recurring: false });
    setIsAdding(false);
    setEditingId(null);

    // Refetch
    dispatch(fetchBudgets());

  } catch (err: any) {
    toast.error(err.message || "Failed to save budget");
  }
};

  const handleEdit = (budget: any) => {
    setFormData({
      categoryId: budget.categoryId,
      limit: budget.limit.toString(),
      recurring: budget.recurring,
    });
    setEditingId(budget._id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      try {
        await dispatch(deleteBudget(id)).unwrap();
        // Refetch data to update charts
        dispatch(fetchBudgets());
      } catch (err: any) {
        toast.error(err.message || "Failed to delete budget");
      }
    }
  };

  const resetForm = () => {
    setFormData({ categoryId: "", limit: "", recurring: false });
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

  return (
    <div className="w-full flex flex-col gap-6 px-6 py-3">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-fg)" }}>
          Budgets
        </h1>
        <MonthYearSelector />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetsChart budgets={budgets} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Manage Budgets</CardTitle>
            <Button
              onClick={() => setIsAdding(!isAdding)}
              className="bg-[var(--color-accent2)] text-[var(--color-fg)] hover:bg-[var(--color-accent2)]/80"
            >
              {isAdding ? "Cancel" : "Add Budget"}
            </Button>
          </CardHeader>
          <CardContent>
            {isAdding && (
              <form onSubmit={handleSubmit} className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-fg"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Budget Limit</label>
                  <input
                    type="number"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-fg"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                  />
                  <label htmlFor="recurring" className="text-sm">Recurring budget</label>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="bg-[var(--color-accent2)] text-[var(--color-fg)] hover:bg-[var(--color-accent2)]/80"
                  >
                    {editingId ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="text-[var(--color-fg)]"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {budgets.map((budget) => (
                <div key={budget._id} className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <div className="font-medium">{budget.categoryName || "Unknown"}</div>
                    <div className="text-sm text-muted-foreground">
                      Limit: {getCurrency(budget.limit)} | Spent: {getCurrency(budget.spent || 0)}
                      {budget.recurring && " (Recurring)"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(budget)}
                      className="text-[var(--color-fg)]"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(budget._id)}
                      className="text-[var(--color-fg)]"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Budgets;