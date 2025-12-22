
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/realApi';
import { UserRole } from '../types';
import { User, Lock, Smartphone, ArrowRight, AlertCircle, Loader2, Shield, Briefcase } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.login(username, password);
      login(response.user, response.token);
      
      if (response.user.role === UserRole.ADMIN || response.user.role === UserRole.STAFF) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-10">
          <div className="text-center mb-6">
             <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                <Smartphone className="w-8 h-8 text-primary" />
             </div>
             <h2 className="text-3xl font-black text-gray-900 tracking-tight">Chào mừng trở lại</h2>
             <p className="text-gray-500 mt-2">Đăng nhập để quản lý và mua sắm</p>
          </div>

          {/* Quick Login Buttons for Testing */}
          <div className="mb-6 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase text-center mb-2">Tài khoản Test nhanh</p>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => fillCredentials('admin', '123')}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200 transition"
              >
                <Shield className="w-3 h-3" /> Admin
              </button>
              <button 
                 type="button"
                 onClick={() => fillCredentials('staff', '123')}
                 className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition"
              >
                <Briefcase className="w-3 h-3" /> Staff
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
               <AlertCircle className="w-5 h-5 flex-shrink-0" />
               <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Tên đăng nhập</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" required value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900 placeholder:text-gray-400"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Mật khẩu</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-gray-900 placeholder:text-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:shadow-blue-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <>Đăng nhập <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-gray-500">Chưa có tài khoản? <Link to="/register" className="text-primary font-black hover:underline">Đăng ký ngay</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
