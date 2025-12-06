import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockApi';
import { User, Lock, Smartphone, ArrowRight, AtSign, CheckCircle2, ShieldCheck, CreditCard, Ticket } from 'lucide-react';

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
    setLoading(true);
    setError('');

    try {
      // Call register API
      const response = await api.register(name, username, password);
      // Auto login after register
      login(response.user, response.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Right Side - Decorative Image (Swapped position for variety) */}
      <div className="hidden lg:block w-1/2 relative bg-gray-900 overflow-hidden order-2">
         <div className="absolute inset-0 bg-gradient-to-bl from-purple-600 to-blue-900 opacity-90 z-10"></div>
         <img 
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" 
            alt="Register Background" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
         />
         <div className="absolute inset-0 z-20 flex flex-col justify-center px-16 text-white text-right items-end">
            <h2 className="text-5xl font-bold mb-6 leading-tight">Tham gia hội viên <br/> công nghệ.</h2>
            <p className="text-blue-100 text-lg max-w-md mb-8 leading-relaxed">
               Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt dành riêng cho thành viên mới.
            </p>
            
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-2xl shadow-xl transform rotate-2 max-w-md mb-12 border border-white/20">
               <div className="flex items-start gap-4">
                  <Ticket className="w-10 h-10 flex-shrink-0" />
                  <div>
                     <h3 className="font-bold text-xl">Coupon Thành Viên Mới</h3>
                     <p className="opacity-90 mt-1">Nhận ngay mã giảm giá <span className="font-bold">200.000đ</span> và voucher lên đến <span className="font-bold">500.000đ</span> cho đơn hàng đầu tiên.</p>
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-lg">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-center hover:bg-white/20 transition">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="font-bold text-sm">Bảo mật cao</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-center hover:bg-white/20 transition">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <p className="font-bold text-sm">Thanh toán tiện lợi</p>
                </div>
            </div>
         </div>
      </div>

      {/* Left Side - Form (Order 1) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-24 relative order-1">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-primary transition">
           <Smartphone className="w-6 h-6 text-primary" />
           <span className="font-bold text-xl tracking-tight">Mobile<span className="text-primary">Store</span></span>
        </Link>

        <div className="max-w-md w-full mx-auto space-y-8 mt-10 lg:mt-0">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Đăng ký Hội Viên</h2>
            <p className="text-gray-500">Tạo tài khoản để nhận ưu đãi độc quyền.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                 {error}
              </div>
            )}
            
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và Tên</label>
                <div className="relative">
                    <input
                        type="text"
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition font-medium"
                        placeholder="Ví dụ: Nguyễn Văn A"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên đăng nhập</label>
                <div className="relative">
                    <input
                        type="text"
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition font-medium"
                        placeholder="Chọn tên đăng nhập"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <AtSign className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
                <div className="relative">
                    <input
                        type="password"
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition font-medium"
                        placeholder="Tạo mật khẩu an toàn"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-400 mt-2 ml-1">Mật khẩu nên có ít nhất 6 ký tự.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transform active:scale-[0.98] duration-200 mt-4"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  Đăng ký tài khoản <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-primary hover:text-blue-600 transition">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;