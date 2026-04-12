import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface Expense {
  _id: string;
  amount: number;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  date: string;
}

interface ExpensesState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpensesState = {
  expenses: [],
  loading: false,
  error: null,
};

export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as { summary: { month: number; year: number } };
    const { month, year } = state.summary;

    const params = new URLSearchParams({
      month: month.toString(),
      year: year.toString(),
    });

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/expenses?${params}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch expenses");
    }

    const data = await response.json();
    return data.expenses;
  }
);

export const createExpense = createAsyncThunk(
  "expenses/createExpense",
  async (expenseData: { amount: number; categoryId?: string; description?: string; date: string }) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/expenses`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to create expense" }));
      throw new Error(errorData.message || "Failed to create expense");
    }

    const data = await response.json();
    return data.expense;
  }
);

export const updateExpense = createAsyncThunk(
  "expenses/updateExpense",
  async ({ id, expenseData }: { id: string; expenseData: { amount?: number; categoryId?: string; description?: string; date?: string } }) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/expenses/${id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to update expense" }));
      throw new Error(errorData.message || "Failed to update expense");
    }

    const data = await response.json();
    return data.expense;
  }
);

export const deleteExpense = createAsyncThunk(
  "expenses/deleteExpense",
  async (id: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/expenses/${id}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to delete expense" }));
      throw new Error(errorData.message || "Failed to delete expense");
    }

    return id;
  }
);

export const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch expenses";
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.push(action.payload);
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((e) => e._id !== action.payload);
      });
  },
});

export default expensesSlice.reducer;