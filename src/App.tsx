/// <reference types="vite-plugin-svgr/client" />
import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Budgets from './pages/Budgets';
import Expenses from './pages/Expenses';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchCurrentUser } from './store/slices/userSlice';
import Callback from './pages/Callback';

export default function App() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, authChecked } = useAppSelector((state) => state.user);

  const isLoginPage = location.pathname === '/login';
  const isAuthenticated = !!user && user.role === 'user';
  // const isGuest = user?.role === 'guest';

  useEffect(() => {
    if (!authChecked) {
      dispatch(fetchCurrentUser());
    }
  }, [authChecked, dispatch]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-base font-medium">Checking authentication...</p>
      </div>
    );
  }

  // Authenticated user on login page → send home
  if (isAuthenticated && isLoginPage) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback" element={<Callback />} />
      <Route path="/" element={<Index />}>
        <Route index element={<Dashboard />} />
        <Route path="categories" element={<Categories />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="expenses" element={<Expenses />} />
      </Route>
    </Routes>
  );
}