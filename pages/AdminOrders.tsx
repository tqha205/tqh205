
import React, { useEffect, useState, useRef } from 'react';
import { api, formatCurrency } from '../services/realApi';
import { Order } from '../types';
import { 
  ShoppingBag, Search, Eye, Filter, CheckCircle2, Clock, 
  Truck, XCircle, ChevronDown, User, Printer, Package, CreditCard, X 
} from 'lucide-react';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = orders;
    if (selectedStatus !== 'all') {
      result = result.filter(o => o.status === selectedStatus);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(term) || 
        o.customerName.toLowerCase().includes(term)
      );
    }
    setFilteredOrders(result);
  }, [orders, selectedStatus, searchTerm]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await api.updateOrder(orderId, newStatus);
      // Update local state for UI responsiveness
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      alert('Không thể cập nhật trạng thái');
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending') return 'Chờ xử lý';
    if (s === 'shipped') return 'Đang giao';
    if (s === 'delivered') return 'Đã giao';
    if (s === 'cancelled') return 'Đã hủy';
    return status;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <button onClick={loadOrders} className="text-sm font-medium text-blue-600 hover:underline">Làm mới dữ liệu</button>
      </div>
      
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Tìm theo mã đơn hoặc tên khách..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-4 focus:ring-blue-500/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
        </div>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="shipped">Đang giao</option>
          <option value="delivered">Đã giao</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Tổng tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-20 text-gray-400">Đang tải đơn hàng...</td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedOrder(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Đơn hàng #{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-grow space-y-8" ref={invoiceRef}>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> Thông tin khách hàng
                  </h4>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">{selectedOrder.customerInfo?.name || selectedOrder.customerName}</p>
                    <p className="text-sm text-gray-600">SĐT: {selectedOrder.customerInfo?.phone || 'N/A'}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{selectedOrder.customerInfo?.address || 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2 justify-end">
                    <CreditCard className="w-4 h-4" /> Thanh toán & Thời gian
                  </h4>
                  <p className="font-bold text-primary uppercase">{selectedOrder.paymentMethod}</p>
                  <p className="text-sm text-gray-500">{new Date(selectedOrder.date).toLocaleString('vi-VN')}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black border ${getStatusBadge(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status).toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Danh sách sản phẩm ({selectedOrder.items?.length || 0})
                </h4>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-bold text-gray-400 uppercase"><th className="p-4">Sản phẩm</th><th className="p-4 text-center">SL</th><th className="p-4 text-right">Đơn giá</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-4 font-bold text-gray-900">{item.name}</td>
                          <td className="p-4 text-center text-gray-600">{item.quantity}</td>
                          <td className="p-4 text-right font-bold">{formatCurrency(item.price)}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={3} className="p-8 text-center text-gray-400 italic">Dữ liệu sản phẩm không tồn tại</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <p className="text-gray-500 font-medium text-sm">Tổng cộng:</p>
                <p className="text-3xl font-black text-primary">{formatCurrency(selectedOrder.total)}</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-wrap justify-between gap-4">
              <div className="flex gap-3">
                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                  <>
                    <button 
                      onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                      className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-500/20"
                    >
                      Giao hàng thành công
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}
                      className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100"
                    >
                      Hủy đơn
                    </button>
                  </>
                )}
                {selectedOrder.status === 'pending' && (
                  <button 
                    onClick={() => handleStatusChange(selectedOrder.id, 'shipped')}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                  >
                    Đã gửi hàng
                  </button>
                )}
              </div>
              <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 shadow-lg">
                <Printer className="w-4 h-4" /> In hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
