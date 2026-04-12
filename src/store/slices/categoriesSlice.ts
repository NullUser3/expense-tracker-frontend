import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface Category {
  _id: string;
  name: string;
  color?: string;
  icon?: string;
  total: number; // total expenses for this category
}

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/categories`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();
    return data.categories;
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData: { name: string; color?: string; icon?: string }) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/categories`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to create category" }));
      throw new Error(errorData.message || "Failed to create category");
    }

    const data = await response.json();
    return data.category;
  }
);

export const fetchCategoryTotals = createAsyncThunk(
  "categories/fetchCategoryTotals",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as { summary: { month: number; year: number } };
    const { month, year } = state.summary;

    const params = new URLSearchParams({
      month: month.toString(),
      year: year.toString(),
    });

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/expenses/categoryTotals?${params}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch category totals");
    }

    const data = await response.json();
    return data.totals; // assume { categoryId: total }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, categoryData }: { id: string; categoryData: { name?: string; color?: string; icon?: string } }) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/categories/${id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to update category" }));
      throw new Error(errorData.message || "Failed to update category");
    }

    const data = await response.json();
    return data.category;
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/categories/${id}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to delete category" }));
      throw new Error(errorData.message || "Failed to delete category");
    }

    return id;
  }
);

export const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.map((cat: any) => ({
          ...cat,
          total: 0, // will be updated by fetchCategoryTotals
        }));
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch categories";
      })
      .addCase(fetchCategoryTotals.fulfilled, (state, action) => {
        const totals = action.payload;
        state.categories = state.categories.map((cat) => ({
          ...cat,
          total: totals[cat._id] || 0,
        }));
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push({ ...action.payload, total: 0 });
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((cat) => cat._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = { ...action.payload, total: state.categories[index].total };
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
      });
  },
});


export default categoriesSlice.reducer;