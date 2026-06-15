import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import { Menu, LogOut, LayoutDashboard, Utensils } from 'lucide-react';

export default function AdminLayout() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const token = localStorage.getItem('access_token');
  const navigate = useNavigate();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <Utensils className="h-8 w-8 text-indigo-600" />
          {sidebarOpen && <span className="ml-3 font-semibold text-xl">SaaS Menu</span>}
        </div>
        <nav className="flex-1 py-4 px-3 space-y-2">
          <button className="flex items-center w-full px-3 py-2 text-indigo-700 bg-indigo-50 rounded-lg">
            <LayoutDashboard className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3 font-medium">Orders</span>}
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
