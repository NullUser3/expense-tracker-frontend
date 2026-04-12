import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// --- Types ---

export interface MonthlyHistoryItem {
  month: number;
  year: number;
  label: string;
  income: number;
  expenses: number;
  netSavings: number;
}

export interface SummaryState {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  totalBalance: number;
  savingsRate: number;
  month: number;
  year: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  history: MonthlyHistoryItem[];
  historyStatus: "idle" | "loading" | "succeeded" | "failed";
  historyError: string | null;
}

const initialState: SummaryState = {
  totalIncome: 0,
  totalExpenses: 0,
  netSavings: 0,
  totalBalance: 0,
  savingsRate: 0,
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  status: "idle",
  error: null,
  history: [],
  historyStatus: "idle",
  historyError: null,
};

// --- Thunks ---

export const fetchSummary = createAsyncThunk(
  "summary/fetchSummary",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as { summary: SummaryState };
    const { month, year } = state.summary;

    const params = new URLSearchParams({
      month: month.toString(),
      year: year.toString(),
    });

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/expenses/getSummary?${params}`,
      { method: "GET", credentials: "include" }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return thunkAPI.rejectWithValue(errorData?.message || "Failed to fetch summary");
    }

    return await response.json();
  }
);

// months param is optional — defaults to 6 on the backend
export const fetchSummaryHistory = createAsyncThunk(
  "summary/fetchSummaryHistory",
  async (months: number = 6, thunkAPI) => {
    const params = new URLSearchParams({ months: months.toString() });

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/expenses/summaryHistory?${params}`,
      { method: "GET", credentials: "include" }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return thunkAPI.rejectWithValue(errorData?.message || "Failed to fetch summary history");
    }

    const data = await response.json();
    return data.history as MonthlyHistoryItem[];
  }
);

// --- Slice ---

export const summarySlice = createSlice({
  name: "summary",
  initialState,
  reducers: {
    setMonthYear: (state, action: PayloadAction<{ month: number; year: number }>) => {
      state.month = action.payload.month;
      state.year = action.payload.year;
      // Reset summary so stale data doesn't show while refetching
      state.status = "idle";
    },
  },
  extraReducers(builder) {
    builder
      // --- fetchSummary ---
      .addCase(fetchSummary.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.totalIncome = action.payload.totalIncome;
        state.totalExpenses = action.payload.totalExpenses;
        state.netSavings = action.payload.netSavings;
        state.totalBalance = action.payload.totalBalance;
        state.savingsRate = action.payload.savingsRate;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // --- fetchSummaryHistory ---
      .addCase(fetchSummaryHistory.pending, (state) => {
        state.historyStatus = "loading";
        state.historyError = null;
      })
      .addCase(fetchSummaryHistory.fulfilled, (state, action) => {
        state.historyStatus = "succeeded";
        state.history = action.payload;
      })
      .addCase(fetchSummaryHistory.rejected, (state, action) => {
        state.historyStatus = "failed";
        state.historyError = action.payload as string;
      });
  },
});

export const { setMonthYear } = summarySlice.actions;
export default summarySlice.reducer;