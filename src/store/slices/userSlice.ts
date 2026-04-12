import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "guest";
  currency: string;
  avatar?:string;
  guestId?: string;
}

interface AuthPayload {
  name?: string;
  email: string;
  password: string;
}

interface UserState {
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  authChecked: boolean;
}

const initialState: UserState = {
  user: null,
  status: "idle",
  error: null,
  authChecked: false,
};

export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (payload: AuthPayload, thunkAPI) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          passwordHash: payload.password,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return thunkAPI.rejectWithValue(errorData?.message || "Failed to register user");
    }

    const data = await response.json();
    return data.safeUser as User;
  }
);

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (payload: AuthPayload, thunkAPI) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return thunkAPI.rejectWithValue(errorData?.message || "Failed to login user");
    }

    const data = await response.json();
    return data.safeUser as User;
  }
);

// fetchCurrentUser will always get a user back (guest or real)
// since protect auto-creates a guest token if none exists
export const fetchCurrentUser = createAsyncThunk<User>(
  "user/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/me`,
        { method: "GET", credentials: "include" }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return thunkAPI.rejectWithValue(errorData?.message || "Failed to fetch user");
      }

      const data = await response.json();
      return data.user as User;
    } catch {
      return thunkAPI.rejectWithValue("Network error");
    }
  }
);

export const changeCurrency = createAsyncThunk<string, string>(
  "user/changeCurrency",
  async (currency, thunkAPI) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/changeCurrency`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return thunkAPI.rejectWithValue(errorData?.message || "Failed to change currency");
    }

    const data = await response.json();
    return data.currency as string;
  }
);

export const logoutUser = createAsyncThunk(
  "user/logoutUser",
  async (_, thunkAPI) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/logout`,
      { method: "POST", credentials: "include" }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return thunkAPI.rejectWithValue(errorData?.message || "Failed to logout");
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.error = null;
      state.status = action.payload ? "succeeded" : "idle";
    },
    clearUserError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.authChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.authChecked = true;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.authChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.authChecked = true;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.authChecked = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.user = null;
        state.authChecked = true;
      })
      .addCase(changeCurrency.fulfilled, (state, action) => {
        if (state.user) {
          state.user.currency = action.payload;
        }
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
        state.error = null;
        state.authChecked = false; // force refresh so guest token is created immediately
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.user = null;
        state.status = "idle";
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearUserError } = userSlice.actions;
export default userSlice.reducer;