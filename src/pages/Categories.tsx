import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCategories, createCategory, updateCategory, deleteCategory, fetchCategoryTotals, type Category } from "../store/slices/categoriesSlice";
import CategoriesChart from "../components/CategoriesChart";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import MonthYearSelector from "../components/MonthYearSelector";
import toast from "react-hot-toast";

const Categories = () => {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.categories);
  const { month, year } = useAppSelector((state) => state.summary);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", color: "#8884d8", icon: "" });

  const CATEGORY_COLORS = [
  "#00A676", // jungle green (primary)
  "#4CC9A6", // light jungle green
  "#275DAD", // tech blue
  "#5C7AEA", // soft indigo
  "#89608E", // vintage lavender
  "#B07D62", // warm brown (fits almond tones)
  "#D17A22", // muted orange
  "#C1666B", // soft red
  "#7A9E7E", // muted green
  "#A3A380", // olive neutral
];

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCategoryTotals());
  }, [dispatch, month, year]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.name.trim()) return;

  try {
    if (editingId) {
      await dispatch(updateCategory({ id: editingId, categoryData: formData })).unwrap();
      toast.success("Category updated successfully");
    } else {
      await dispatch(createCategory(formData)).unwrap();
      toast.success("Category created successfully");
    }

    // Reset + close form
    setFormData({ name: "", color: "#8884d8", icon: "" });
    setIsAdding(false);
    setEditingId(null);

    // Refetch data to update charts
    dispatch(fetchCategories());
    dispatch(fetchCategoryTotals());

  } catch (err: any) {
    toast.error(err.message || "Failed to save category");
  }
};

  const handleEdit = (category: Category) => {
    setFormData({ name: category.name, color: category.color || "#8884d8", icon: category.icon || "" });
    setEditingId(category._id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await dispatch(deleteCategory(id)).unwrap();
        // Refetch data to update charts
        dispatch(fetchCategories());
        dispatch(fetchCategoryTotals());
      } catch (err: any) {
        toast.error(err.message || "Failed to delete category");
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", color: "#8884d8", icon: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="w-full flex flex-col gap-6 px-6 py-3">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-fg)" }}>
          Categories
        </h1>
        <MonthYearSelector />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


            <CategoriesChart categories={categories} />



        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Manage Categories</CardTitle>
            <Button
              onClick={() => setIsAdding(!isAdding)}
              className="bg-accent2 text-fg hover:bg-accent2/80"
            >
              {isAdding ? "Cancel" : "Add Category"}
            </Button>
          </CardHeader>
          <CardContent>
            {isAdding && (
              <form onSubmit={handleSubmit} className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-fg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <div className="flex flex-wrap gap-2">
  {CATEGORY_COLORS.map((color) => (
    <button
      key={color}
      type="button"
      onClick={() => setFormData({ ...formData, color })}
      className={`w-8 h-8 rounded-full border-2 ${
        formData.color === color ? "border-black" : "border-transparent"
      }`}
      style={{ backgroundColor: color }}
    />
  ))}
</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Icon (optional)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-fg"
                    placeholder="e.g., shopping-cart"
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
              {categories.map((category) => (
                <div key={category._id} className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color || "#8884d8" }}
                    ></div>
                    <span className="font-medium">{category.name}</span>
                    {category.icon && <span className="text-sm text-muted-foreground">{category.icon}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(category)}
                      className="text-fg"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(category._id)}
                      className="text-fg"
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

export default Categories;