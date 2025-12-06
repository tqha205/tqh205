import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockApi';
import { UserRole } from '../types';
import { User, Lock, Smartphone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

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
      
      // Redirect based on role: Admin goes to dashboard, others to home
      if (response.user.role === UserRole.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
    } catch (err) {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-24 relative">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-primary transition">
           <Smartphone className="w-6 h-6 text-primary" />
           <span className="font-bold text-xl tracking-tight">Mobile<span className="text-primary">Store</span></span>
        </Link>

        <div className="max-w-md w-full mx-auto space-y-8 mt-10 lg:mt-0">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Chào mừng trở lại!</h2>
            <p className="text-gray-500">Vui lòng nhập thông tin đăng nhập của bạn.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên đăng nhập</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition font-medium"
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                   <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition font-medium"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transform active:scale-[0.98] duration-200"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  Đăng nhập <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-primary hover:text-blue-600 transition">
              Đăng ký ngay
            </Link>
          </p>

          {/* Demo Credentials Box */}
          <div className="mt-8 pt-8 border-t border-gray-100">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Tài khoản trải nghiệm</p>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { role: 'Admin', user: 'admin', pass: '123' },
                  { role: 'Staff', user: 'staff', pass: '123' },
                  { role: 'Khách', user: 'client', pass: '123' }
                ].map((acc, idx) => (
                  <div key={idx} 
                       onClick={() => { setUsername(acc.user); setPassword(acc.pass); }}
                       className="cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-lg p-3 text-center transition group"
                  >
                     <p className="text-xs font-bold text-gray-600 group-hover:text-primary mb-1">{acc.role}</p>
                     <p className="text-xs text-gray-400 font-mono">{acc.user} / {acc.pass}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Right Side - Decorative Image */}
      <div className="hidden lg:block w-1/2 relative bg-gray-900 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90 z-10"></div>
         <img 
            src="https://images.unsplash.com/photo-1556656793-02715d8dd655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80" 
            alt="Login Background" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
         />
         <div className="absolute inset-0 z-20 flex flex-col justify-center px-16 text-white">
            <h2 className="text-5xl font-bold mb-6 leading-tight">Khám phá công nghệ <br/> đỉnh cao.</h2>
            <p className="text-blue-100 text-lg max-w-md mb-8 leading-relaxed">
               Trải nghiệm mua sắm thiết bị di động hàng đầu với dịch vụ chuyên nghiệp và ưu đãi hấp dẫn.
            </p>
            <div className="space-y-4">
               <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-sm">
                  <div className="bg-green-400/20 p-2 rounded-lg">
                     <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                     <p className="font-bold">Sản phẩm chính hãng</p>
                     <p className="text-sm text-blue-200">Cam kết 100% chất lượng</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-sm ml-8">
                  <div className="bg-blue-400/20 p-2 rounded-lg">
                     <Smartphone className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                     <p className="font-bold">Đa dạng mẫu mã</p>
                     <p className="text-sm text-blue-200">Từ các thương hiệu hàng đầu</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Login;