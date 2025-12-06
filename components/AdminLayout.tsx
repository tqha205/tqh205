import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, Users, ShoppingBag, LogOut, Store } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { logout, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Tổng quan' },
    { path: '/admin/products', icon: Package, label: 'Sản phẩm' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Đơn hàng' },
    { path: '/admin/users', icon: Users, label: 'Người dùng' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-white flex flex-col fixed h-full shadow-xl">
        <div className="p-6 border-b border-gray-700 bg-gray-900/50">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            Quản Trị
          </h2>
          <span className="text-xs text-gray-400 font-medium bg-gray-800 px-2 py-1 rounded inline-block mt-2">
             {isAdmin ? 'Administrator' : isStaff ? 'Nhân viên (Staff)' : 'User'}
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                  ? 'bg-primary text-white shadow-lg shadow-blue-900/50 translate-x-1' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700 bg-gray-900/30 space-y-2">
          {/* Back to Store Button */}
          <Link
            to="/"
            className="flex items-center w-full px-4 py-3 text-blue-300 hover:bg-blue-900/30 hover:text-blue-200 rounded-lg transition border border-dashed border-blue-800 hover:border-blue-500"
          >
             <Store className="w-5 h-5 mr-3" />
             Về trang bán hàng
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 overflow-auto p-8 bg-gray-100">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;