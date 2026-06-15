import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import AdminLayout from './components/AdminLayout';
import Login from './pages/admin/Login';
import Orders from './pages/admin/Orders';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/orders" replace />} />
            <Route path="orders" element={<Orders />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
