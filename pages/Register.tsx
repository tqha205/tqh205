
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/realApi';
import { User, Lock, Smartphone, ArrowRight, AlertCircle, Loader2, UserPlus } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 3) return setError('Mật khẩu quá ngắn (tối thiểu 3 ký tự)');
    
    setLoading(true);
    setError('');

    try {
      // API Backend will default role to CUSTOMER
      const response = await api.register(name, username, password);
      login(response.user, response.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Tên đăng nhập đã tồn tại hoặc lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-10">
          <div className="text-center mb-10">
             <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                <UserPlus className="w-8 h-8 text-primary" />
             </div>
             <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tạo tài khoản</h2>
             <p className="text-gray-500 mt-2">Tham gia ngay để nhận ưu đãi thành viên</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
               <AlertCircle className="w-5 h-5 flex-shrink-0" />
               <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Họ và Tên</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Tên đăng nhập</label>
              <div className="relative group">
                <Smartphone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" required value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                  placeholder="username123"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Mật khẩu</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                  placeholder="Ít nhất 3 ký tự"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:shadow-blue-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>Đăng ký ngay <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-gray-500">Đã có tài khoản? <Link to="/login" className="text-primary font-black hover:underline">Đăng nhập</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
