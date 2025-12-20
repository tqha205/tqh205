
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { api, formatCurrency } from '../services/realApi';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { DollarSign, Package, ShoppingCart, Users, RefreshCw } from 'lucide-react';

type TimeRange = '6m' | '1y' | 'all';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, users: 0 });
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('6m');
  const { isAdmin } = useAuth();

  const loadStats = async () => {
    setLoading(true);
    try {
      const [products, orders, users] = await Promise.all([
          api.getProducts(),
          api.getOrders(),
          api.getUsers()
      ]);
      
      // Tính doanh thu thực tế (chỉ đơn 'delivered')
      // Sử dụng toLowerCase() để chắc chắn khớp dữ liệu
      const totalRevenue = orders
        .filter(order => order.status?.toLowerCase() === 'delivered')
        .reduce((acc, order) => acc + order.total, 0);

      setStats({
        revenue: totalRevenue,
        orders: orders.length,
        products: products.length,
        users: users.length
      });
      setAllOrders(orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const processChartData = (orders: Order[], range: TimeRange) => {
    if (orders.length === 0) return [];
    const now = new Date();
    const dataMap = new Map<string, number>();
    const sortedOrders = [...orders].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (range === 'all') {
      sortedOrders.forEach(order => {
        if (order.status?.toLowerCase() === 'delivered') {
          const year = new Date(order.date).getFullYear().toString();
          dataMap.set(year, (dataMap.get(year) || 0) + order.total);
        }
      });
      if (dataMap.size === 0) dataMap.set(now.getFullYear().toString(), 0);
      return Array.from(dataMap.entries())
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => parseInt(a.name) - parseInt(b.name));
    } else {
      let monthsToLookBack = range === '6m' ? 6 : 12;
      for (let i = monthsToLookBack - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
        dataMap.set(key, 0);
      }
      sortedOrders.forEach(order => {
        const d = new Date(order.date);
        const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
        if (dataMap.has(key) && order.status?.toLowerCase() === 'delivered') {
          dataMap.set(key, (dataMap.get(key) || 0) + order.total);
        }
      });
      return Array.from(dataMap.entries()).map(([key, amount]) => {
        const [month, year] = key.split('/');
        return { name: `Thg ${month}`, amount };
      });
    }
  };

  const currentChartData = processChartData(allOrders, timeRange);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        
        <div className="flex gap-2">
          <button 
            onClick={loadStats}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {isAdmin && (
            <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex">
              {['6m', '1y', 'all'].map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r as TimeRange)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    timeRange === r ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {r === '6m' ? '6 Tháng' : r === '1y' ? '1 Năm' : 'Tất cả'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Doanh thu thực tế</p>
              <p className="text-xs text-green-600 mb-1">(Đã giao hàng)</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
              <p className="text-xs text-gray-400 mb-1">(Tất cả trạng thái)</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.orders}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Sản phẩm</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-5">{stats.products}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Người dùng</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-5">{stats.users}</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-400" /> Doanh thu thực tế (Đã giao)
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={currentChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} tickLine={false} axisLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
             <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-400" /> Xu hướng tăng trưởng (Doanh thu)
             </h3>
             <ResponsiveContainer width="100%" height="85%">
              <BarChart data={currentChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} tickLine={false} axisLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Doanh số']}
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={timeRange === 'all' ? 40 : 20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
