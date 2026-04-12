import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface Budget {
  _id: string;
  categoryId: string;
  categoryName?: string;
  limit: number;
  month: number;
  year: number;
  recurring: boolean;
  spent?: number; // calculated
}

interface BudgetsState {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
}

const initialState: BudgetsState = {
  budgets: [],
  loading: false,
  error: null,
};

export const fetchBudgets = createAsyncThunk(
  "budgets/fetchBudgets",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as { summary: { month: number; year: number } };
    const { month, year } = state.summary;

    const params = new URLSearchParams({
      month: month.toString(),
      year: year.toString(),
    });

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/budgets?${params}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch budgets");
    }

    const data = await response.json();
    return data.budgets;
  }
);

export const createBudget = createAsyncThunk(
  "budgets/createBudget",
  async (budgetData: { categoryId: string; limit: number; month: number; year: number; recurring: boolean }) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/budgets`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(budgetData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to create budget" }));
      throw new Error(errorData.message || "Failed to create budget");
    }

    const data = await response.json();
    return data.budget;
  }
);

export const updateBudget = createAsyncThunk(
  "budgets/updateBudget",
  async ({ id, budgetData }: { id: string; budgetData: { limit?: number; recurring?: boolean } }) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/budgets/${id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(budgetData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to update budget" }));
      throw new Error(errorData.message || "Failed to update budget");
    }

    const data = await response.json();
    return data.budget;
  }
);

export const deleteBudget = createAsyncThunk(
  "budgets/deleteBudget",
  async (id: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/budgets/${id}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to delete budget" }));
      throw new Error(errorData.message || "Failed to delete budget");
    }

    return id;
  }
);

export const budgetsSlice = createSlice({
  name: "budgets",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch budgets";
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.budgets.push(action.payload);
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        const index = state.budgets.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter((b) => b._id !== action.payload);
      });
  },
});

export default budgetsSlice.reducer;