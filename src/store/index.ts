import { configureStore } from '@reduxjs/toolkit';
import languageSlice from './slices/languageSlice';
import summarySlice from './slices/summarySlice';
import userSlice from './slices/userSlice';
import categoriesSlice from './slices/categoriesSlice';
import budgetsSlice from './slices/budgetsSlice';
import expensesSlice from './slices/expensesSlice';

export const store = configureStore({
  reducer: {
    language: languageSlice,
    summary: summarySlice,
    user: userSlice,
    categories: categoriesSlice,
    budgets: budgetsSlice,
    expenses: expensesSlice,
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;