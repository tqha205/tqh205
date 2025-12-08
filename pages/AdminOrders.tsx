import React, { useEffect, useState } from 'react';
import { api, formatCurrency } from '../services/realApi';
import { Order } from '../types';
import { ShoppingBag, Search, Eye, Filter, CheckCircle2, Clock, Truck, XCircle, ChevronDown, MapPin, Phone, User, Calendar, CreditCard, AlertTriangle, Package, Star, MessageSquareQuote } from 'lucide-react';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Alert Modal State
  const [alertModal, setAlertModal] = useState<{show: boolean, message: string}>({show: false, message: ''});

  useEffect(() => {
    loadOrders();
  }, []);

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
      result = result.filter(order => order.status === selectedStatus);
    }
    if (searchTerm) {
      result = result.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredOrders(result);
  }, [orders, selectedStatus, searchTerm]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await api.updateOrder(orderId, newStatus);
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      setAlertModal({ show: true, message: 'Không thể cập nhật trạng thái đơn hàng' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
      switch (status) {
        case 'pending': return 'Chờ xử lý';
        case 'shipped': return 'Đang giao';
        case 'delivered': return 'Đã giao';
        case 'cancelled': return 'Đã hủy';
        default: return status;
      }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800';
    e.currentTarget.classList.remove('mix-blend-multiply');
  };

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý đơn hàng</h1>
      
      {/* Alert Modal */}
      {alertModal.show && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setAlertModal({...alertModal, show: false})}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thông báo</h3>
            <p className="text-gray-500 mb-6">{alertModal.message}</p>
            <button 
              onClick={() => setAlertModal({...alertModal, show: false})}
              className="w-full py-2.5 rounded-xl bg-gray-900 font-medium text-white hover:bg-gray-800 transition"
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: 'Chờ xử lý', count: orders.filter(o => o.status === 'pending').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
           { label: 'Đang giao', count: orders.filter(o => o.status === 'shipped').length, color: 'text-blue-600', bg: 'bg-blue-50' },
           { label: 'Hoàn thành', count: orders.filter(o => o.status === 'delivered').length, color: 'text-green-600', bg: 'bg-green-50' },
           { label: 'Đã hủy', count: orders.filter(o => o.status === 'cancelled').length, color: 'text-red-600', bg: 'bg-red-50' },
         ].map((stat, idx) => (
           <div key={idx} className={`${stat.bg} p-4 rounded-xl border border-transparent`}>
             <p className={`text-sm font-medium ${stat.color} mb-1`}>{stat.label}</p>
             <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
           </div>
         ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Tìm theo mã đơn hoặc tên khách..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        </div>
        
        {/* Dropdown Filter for Order Status */}
        <div className="relative min-w-[200px]">
          <div className="absolute left-3 top-3 pointer-events-none">
            <Filter className="w-4 h-4 text-gray-500" />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer transition text-sm font-medium text-gray-700"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="shipped">Đang giao hàng</option>
            <option value="delivered">Đã giao hàng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã đơn</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                <th className="hidden xl:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10">Đang tải...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500">Không tìm thấy đơn hàng nào.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#{order.id}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.items.length} sản phẩm</div>
                      {/* Mobile View: Collapsed details */}
                      <div className="sm:hidden mt-1 flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-primary">{formatCurrency(order.total)}</span>
                        <span className="text-[10px] text-gray-400">#{order.id}</span>
                      </div>
                    </td>
                    <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(order.total)}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        <span className="hidden sm:inline">{getStatusIcon(order.status)}</span>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                     <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Đơn hàng #{selectedOrder.id}</h3>
                    <p className="text-xs text-gray-500">Ngày đặt: {selectedOrder.date}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full">
                  <XCircle className="w-7 h-7" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-grow bg-white">
                {/* Logical Grouping: Customer & Shipping */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Customer Info Card */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
                             <User className="w-4 h-4 text-blue-600" /> Thông tin khách hàng
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"/>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Họ và tên</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedOrder.customerInfo?.name || selectedOrder.customerName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"/>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Số điện thoại</p>
                                    <p className="text-sm font-bold text-gray-900 font-mono">{selectedOrder.customerInfo?.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"/>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Năm sinh</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedOrder.customerInfo?.birthYear || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping & Payment Card */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
                             <Truck className="w-4 h-4 text-orange-600" /> Vận chuyển & Thanh toán
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"/>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Địa chỉ giao hàng</p>
                                    <p className="text-sm font-bold text-gray-900 leading-snug">{selectedOrder.customerInfo?.address || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"/>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Thanh toán</p>
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold mt-1 ${
                                        selectedOrder.paymentMethod === 'banking' 
                                        ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                        : 'bg-green-50 text-green-700 border-green-100'
                                    }`}>
                                        {selectedOrder.paymentMethod === 'banking' ? 'Chuyển khoản' : 'Tiền mặt (COD)'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Section - Show only if feedback exists */}
                {selectedOrder.feedback && (
                  <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100 mb-6">
                     <div className="flex items-start gap-3">
                        <MessageSquareQuote className="w-6 h-6 text-yellow-600 mt-1" />
                        <div>
                           <h4 className="text-sm font-bold text-yellow-800 uppercase mb-2">Đánh giá từ khách hàng</h4>
                           <div className="flex items-center gap-1 mb-2">
                             {[1, 2, 3, 4, 5].map((star) => (
                               <Star 
                                 key={star} 
                                 className={`w-4 h-4 ${star <= (selectedOrder.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                               />
                             ))}
                             <span className="text-sm font-medium text-yellow-700 ml-2">{(selectedOrder.rating || 0)}/5</span>
                           </div>
                           <p className="text-gray-700 italic">"{selectedOrder.feedback}"</p>
                        </div>
                     </div>
                  </div>
                )}

                {/* Items */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
                  <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase flex justify-between items-center">
                    <span>Sản phẩm</span>
                    <span>{selectedOrder.items.length} món</span>
                  </div>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        onError={handleImageError}
                        className="w-14 h-14 object-contain bg-white border border-gray-100 rounded-xl p-1" 
                      />
                      <div className="ml-4 flex-grow">
                        <p className="font-bold text-gray-900 text-sm mb-0.5">{item.name}</p>
                        <p className="text-xs text-blue-600 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded">{item.brand}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-0.5">{item.quantity} x {formatCurrency(item.price)}</p>
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(item.quantity * item.price)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-lg font-bold p-5 bg-gray-50/50">
                    <span>Tổng tiền thanh toán</span>
                    <span className="text-primary text-xl">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-grow w-full sm:w-auto">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cập nhật trạng thái</label>
                    <div className="relative">
                       <select 
                         value={selectedOrder.status}
                         onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as Order['status'])}
                         className="w-full p-3 pl-4 pr-10 rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none appearance-none bg-white font-medium cursor-pointer"
                       >
                         <option value="pending">Chờ xử lý</option>
                         <option value="shipped">Đang giao hàng</option>
                         <option value="delivered">Đã giao hàng</option>
                         <option value="cancelled">Đã hủy</option>
                       </select>
                       <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-900/10 mt-6 sm:mt-0">
                   Đóng
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;