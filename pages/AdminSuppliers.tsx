
import React, { useEffect, useState } from 'react';
import { api } from '../services/realApi';
import { Supplier } from '../types';
import { Truck, Plus, Edit, Trash2, Search, X, CheckCircle2, AlertCircle, Phone, Mail, MapPin } from 'lucide-react';

const AdminSuppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier>>({});
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await api.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Fetch suppliers error:", error);
      showNotification('Lỗi khi tải danh sách nhà cung cấp', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentSupplier.id) {
        await api.updateSupplier(currentSupplier.id, currentSupplier);
        showNotification('Cập nhật thành công', 'success');
      } else {
        await api.createSupplier(currentSupplier as Omit<Supplier, 'id'>);
        showNotification('Thêm mới thành công', 'success');
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (error) {
      showNotification('Lỗi khi lưu thông tin', 'error');
    }
  };

  const confirmDelete = async () => {
      if(!supplierToDelete) return;
      try {
          await api.deleteSupplier(supplierToDelete);
          showNotification('Đã xóa nhà cung cấp', 'success');
          loadSuppliers();
      } catch (error) {
          showNotification('Xóa thất bại', 'error');
      } finally {
          setSupplierToDelete(null);
      }
  };

  const filteredSuppliers = suppliers.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.phone && s.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý Nhà cung cấp</h1>
          <p className="text-gray-500 mt-1">Thông tin đối tác và nguồn hàng.</p>
        </div>
        <button
          onClick={() => { setCurrentSupplier({}); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Thêm Nhà cung cấp</span>
        </button>
      </div>

       {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-bounce ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-6 h-6"/> : <AlertCircle className="w-6 h-6"/>}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Delete Modal */}
      {supplierToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSupplierToDelete(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
            <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button onClick={() => setSupplierToDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 font-medium text-white hover:bg-red-700">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full text-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-gray-400 font-medium">Đang tải dữ liệu từ SQL Server...</p>
             </div>
          ) : filteredSuppliers.length === 0 ? (
             <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <Truck className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-500">Chưa có nhà cung cấp nào được tìm thấy.</p>
             </div>
          ) : filteredSuppliers.map(supplier => (
             <div key={supplier.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition group">
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 p-3 rounded-xl">
                        <Truck className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setCurrentSupplier(supplier); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setSupplierToDelete(supplier.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">{supplier.name}</h3>
                
                <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" /> {supplier.phone || 'N/A'}
                    </div>
                    <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" /> {supplier.email || 'N/A'}
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-400" /> {supplier.address || 'N/A'}
                    </div>
                </div>
             </div>
          ))}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
           <div className="flex min-h-full items-center justify-center p-4">
              <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                 <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
                    <h3 className="text-xl font-bold text-gray-900">{currentSupplier.id ? 'Sửa thông tin' : 'Thêm nhà cung cấp'}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
                 </div>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tên nhà cung cấp</label>
                        <input type="text" required value={currentSupplier.name || ''} onChange={e => setCurrentSupplier({...currentSupplier, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                        <input type="text" required value={currentSupplier.phone || ''} onChange={e => setCurrentSupplier({...currentSupplier, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <input type="email" required value={currentSupplier.email || ''} onChange={e => setCurrentSupplier({...currentSupplier, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ</label>
                        <input type="text" required value={currentSupplier.address || ''} onChange={e => setCurrentSupplier({...currentSupplier, address: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Hủy</button>
                        <button type="submit" className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 shadow-lg">Lưu lại</button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuppliers;
