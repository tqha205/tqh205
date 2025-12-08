import React, { useEffect, useState } from 'react';
import { api } from '../services/realApi';
import { User, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { Shield, User as UserIcon, Trash2, Search, AtSign, Briefcase, Users, Plus, X, Lock, AlertTriangle, Info } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'customers' | 'internal'>('customers');
  const { user: currentUser, isAdmin } = useAuth();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: UserRole.STAFF });

  // Custom Alert Modals
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [modalInfo, setModalInfo] = useState<{show: boolean, title: string, message: string, type: 'info' | 'error' | 'success'}>({
    show: false, title: '', message: '', type: 'info'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const showModal = (title: string, message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setModalInfo({ show: true, title, message, type });
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const initiateDelete = (userId: string) => {
    if (userId === currentUser?.id) {
      showModal('Không thể thực hiện', 'Bạn không thể xóa chính mình!', 'error');
      return;
    }
    setUserToDelete(userId);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.deleteUser(userToDelete);
      setUsers(users.filter(u => u.id !== userToDelete));
    } catch (error) {
      showModal('Lỗi', 'Xóa người dùng thất bại', 'error');
    } finally {
      setUserToDelete(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (userId === currentUser?.id) {
       showModal('Không thể thực hiện', 'Bạn không thể thay đổi quyền của chính mình!', 'error');
       return;
    }
    // Double check logic for staff trying to change roles
    if (!isAdmin) {
        showModal('Từ chối', 'Bạn không có quyền thực hiện hành động này.', 'error');
        return;
    }

    try {
      await api.updateUser(userId, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      showModal('Lỗi', 'Cập nhật quyền thất bại', 'error');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return; // Prevention
    try {
      const createdUser = await api.createUser({
        name: newUser.name,
        username: newUser.username,
        password: newUser.password,
        role: newUser.role
      });
      setUsers([...users, createdUser]);
      setIsModalOpen(false);
      setNewUser({ name: '', username: '', password: '', role: UserRole.STAFF });
      showModal('Thành công', 'Tạo tài khoản thành công!', 'success');
    } catch (error: any) {
      showModal('Lỗi', error.message || 'Có lỗi xảy ra khi tạo tài khoản', 'error');
    }
  };

  // Filter based on tab and search
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'customers') {
      return user.role === UserRole.CUSTOMER;
    } else {
      // Logic for Internal Tab (Only Admin can see Admin/Staff list theoretically, but handled by UI hiding)
      return user.role === UserRole.ADMIN || user.role === UserRole.STAFF;
    }
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý người dùng</h1>
           <p className="text-gray-500 mt-1">Quản lý tài khoản khách hàng{isAdmin && ' và phân quyền nhân viên'}.</p>
        </div>
        
        {/* Only Admin can add internal users */}
        {activeTab === 'internal' && isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition duration-300 transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Thêm nhân viên</span>
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setUserToDelete(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
            <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 font-medium text-white hover:bg-red-700 transition shadow-lg shadow-red-500/30"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info/Alert Modal */}
      {modalInfo.show && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setModalInfo({...modalInfo, show: false})}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              modalInfo.type === 'error' ? 'bg-red-100 text-red-600' :
              modalInfo.type === 'success' ? 'bg-green-100 text-green-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {modalInfo.type === 'error' ? <AlertTriangle className="w-8 h-8" /> :
               modalInfo.type === 'success' ? <Info className="w-8 h-8" /> :
               <Info className="w-8 h-8" />}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{modalInfo.title}</h3>
            <p className="text-gray-500 mb-6">{modalInfo.message}</p>
            <button 
              onClick={() => setModalInfo({...modalInfo, show: false})}
              className="w-full py-2.5 rounded-xl bg-gray-900 font-medium text-white hover:bg-gray-800 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Tabs - Only show Internal tab if Admin */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'customers' 
              ? 'bg-white text-primary shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Khách hàng
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('internal')}
            className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'internal' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Nội bộ (Admin/Nhân viên)
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder={activeTab === 'customers' ? "Tìm khách hàng..." : "Tìm nhân viên..."}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên người dùng</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-10">Đang tải...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-gray-500">Không tìm thấy người dùng nào.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        user.role === UserRole.ADMIN ? 'bg-purple-600' : 
                        user.role === UserRole.STAFF ? 'bg-blue-500' : 'bg-gray-400'
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-400">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <AtSign className="w-4 h-4 mr-2 text-gray-400" />
                      {user.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Only show Dropdown for Internal if Admin, otherwise static badge */}
                    {activeTab === 'internal' && isAdmin ? (
                      <select
                        disabled={user.id === currentUser?.id}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className={`text-sm font-medium rounded-lg px-3 py-1.5 border-0 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 cursor-pointer outline-none ${
                          user.role === UserRole.ADMIN 
                          ? 'bg-purple-50 text-purple-700 ring-purple-600/20 focus:ring-purple-600' 
                          : 'bg-blue-50 text-blue-700 ring-blue-600/20 focus:ring-blue-600'
                        } ${user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value={UserRole.ADMIN}>Quản Trị Viên (Admin)</option>
                        <option value={UserRole.STAFF}>Nhân Viên (Staff)</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        user.role === UserRole.CUSTOMER 
                        ? 'bg-gray-50 text-gray-600 ring-gray-500/10'
                        : 'bg-blue-50 text-blue-700 ring-blue-600/20'
                      }`}>
                         {user.role === UserRole.CUSTOMER ? 'Khách Hàng' : user.role === UserRole.ADMIN ? 'Quản Trị Viên' : 'Nhân Viên'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.id !== currentUser?.id && isAdmin && (
                      <button 
                        onClick={() => initiateDelete(user.id)}
                        className="text-gray-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg group"
                        title="Xóa người dùng"
                      >
                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal - Only Render/Open if Admin */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
                  <h3 className="text-xl font-bold text-gray-900">Thêm nhân viên mới</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition rounded-full p-1 hover:bg-gray-100">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                        placeholder="Nguyễn Văn A"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      />
                      <UserIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tên đăng nhập</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                        placeholder="staff123"
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      />
                      <AtSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu</label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                        placeholder="******"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      />
                      <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Vai trò</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition bg-white"
                    >
                      <option value={UserRole.STAFF}>Nhân Viên (Staff)</option>
                      <option value={UserRole.ADMIN}>Quản Trị Viên (Admin)</option>
                    </select>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition"
                    >
                      Tạo tài khoản
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;