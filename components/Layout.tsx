
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingCart, LogOut, User, Menu, X, Smartphone, Crown, Ticket, Tag, 
  Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, 
  ChevronRight, Send, ShieldCheck, Truck, Headphones, CreditCard
} from 'lucide-react';
import { formatCurrency } from '../services/realApi';

const Layout: React.FC = () => {
  const { user, isAuthenticated, logout, isAdmin, isStaff } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [emailValue, setEmailValue] = useState('');

  // Scroll to top whenever the route changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [location.pathname]);

  const handleLogout = () => {
    clearCart();
    logout();
    navigate('/login');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Cảm ơn bạn! Ưu đãi sẽ được gửi tới ${emailValue}`);
    setEmailValue('');
  };

  const isActive = (path: string) => location.pathname === path;

  const getTierIcon = (tier?: string) => {
    switch(tier) {
      case 'gold': return 'text-yellow-500';
      case 'diamond': return 'text-blue-500';
      default: return 'text-gray-400';
    }
  };

  const getTierLabel = (tier?: string) => {
    switch(tier) {
      case 'gold': return 'Hạng Vàng';
      case 'diamond': return 'Hạng Kim Cương';
      default: return 'Hạng Bạc';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {/* Coupon Modal */}
      {isCouponModalOpen && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsCouponModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   <Ticket className="w-6 h-6 text-primary" /> Kho Coupon của bạn
                </h3>
                <button onClick={() => setIsCouponModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition">
                   <X className="w-5 h-5" />
                </button>
             </div>
             
             {user?.coupons && user.coupons.length > 0 ? (
               <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                 {user.coupons.map((coupon, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition relative overflow-hidden group">
                       <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                          ACTIVE
                       </div>
                       <div className="flex gap-4">
                          <div className="bg-blue-50 text-blue-600 rounded-lg p-3 flex items-center justify-center border border-blue-100">
                             <Tag className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="font-bold text-gray-900 text-lg">{coupon.code}</p>
                             <p className="text-sm text-gray-600">{coupon.description}</p>
                             <p className="text-sm font-bold text-primary mt-1">Giảm: {formatCurrency(coupon.discount)}</p>
                          </div>
                       </div>
                    </div>
                 ))}
               </div>
             ) : (
                <div className="text-center py-8">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ticket className="w-8 h-8 text-gray-400" />
                   </div>
                   <p className="text-gray-500">Bạn chưa có mã giảm giá nào.</p>
                   <Link to="/membership" onClick={() => setIsCouponModalOpen(false)} className="text-primary font-bold hover:underline mt-2 block">
                      Đăng ký hội viên để nhận mã
                   </Link>
                </div>
             )}
             
             <div className="mt-6 pt-4 border-t border-gray-100">
                <button onClick={() => setIsCouponModalOpen(false)} className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition">
                   Đóng
                </button>
             </div>
          </div>
         </div>
      )}

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-110">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">Mobile<span className="text-primary">Store</span></span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1">
              {isAuthenticated && (
                <button
                   onClick={() => setIsCouponModalOpen(true)}
                   className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                   <Ticket className="w-4 h-4" /> Kho Coupon
                </button>
              )}

              <Link 
                to="/" 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive('/') ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                Trang chủ
              </Link>
              
              <div className="h-6 w-px bg-gray-200 mx-4"></div>
              
              <div className="flex items-center space-x-6">
                <Link to="/cart" className="relative group p-2">
                  <div className={`p-2 rounded-full transition-colors ${cart.length > 0 ? 'text-primary bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  {cart.length > 0 && (
                    <span className="absolute top-1 right-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full ring-2 ring-white">
                      {cart.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
                </Link>

                {isAuthenticated ? (
                  <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                    {(isAdmin || isStaff) && (
                       <Link 
                         to="/admin" 
                         className="text-sm font-medium px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition shadow-md flex items-center gap-2"
                       >
                         <span>Quản trị</span>
                       </Link>
                    )}
                    <div className="flex items-center gap-3 group cursor-pointer relative">
                       <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                         <User className="w-5 h-5 text-primary" />
                       </div>
                       <div className="hidden lg:block">
                          <p className="text-xs text-gray-500 font-medium">Xin chào,</p>
                          <div className="flex items-center gap-1.5">
                             <span className="text-sm font-bold text-gray-900 leading-none">{user?.name}</span>
                             {!isAdmin && !isStaff && (
                               <div className="flex items-center gap-0.5 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-600" title={getTierLabel(user?.tier)}>
                                 <Crown className={`w-3 h-3 ${getTierIcon(user?.tier)} fill-current`} />
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                    <button 
                      onClick={handleLogout} 
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all" 
                      title="Đăng xuất"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 pl-2">
                    <Link to="/login" className="text-gray-600 hover:text-primary font-medium text-sm transition px-3 py-2">
                      Đăng nhập
                    </Link>
                    <Link to="/register" className="bg-primary text-white px-5 py-2.5 rounded-full hover:bg-blue-600 text-sm font-semibold transition shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5">
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            <div className="md:hidden flex items-center gap-4">
               <Link to="/cart" className="relative text-gray-600">
                  <ShoppingCart className="w-6 h-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white">
                      {cart.length}
                    </span>
                  )}
                </Link>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 p-2 hover:bg-gray-100 rounded-lg">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <Link to="/" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-primary hover:bg-blue-50 transition">Trang chủ</Link>
              {isAuthenticated && (
                 <button onClick={() => { setIsCouponModalOpen(true); setIsMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-primary hover:bg-blue-50 transition">
                    Kho Coupon
                 </button>
              )}
              <Link to="/membership" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-primary hover:bg-blue-50 transition">Hội viên</Link>
              {isAuthenticated ? (
                <>
                  {(isAdmin || isStaff) && (
                    <Link to="/admin" className="block px-4 py-3 rounded-xl text-base font-medium text-white bg-gray-900">Trang Quản Trị</Link>
                  )}
                  <div className="px-4 py-3 border-t border-gray-100 mt-2">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                         <User className="w-4 h-4 text-blue-600" />
                       </div>
                       <span className="font-bold text-gray-900">{user?.name}</span>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 transition font-medium">
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-4 px-2">
                 <Link to="/login" className="flex justify-center items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 border border-gray-200 hover:bg-gray-50">Đăng nhập</Link>
                 <Link to="/register" className="flex justify-center items-center px-4 py-3 rounded-xl text-base font-medium text-white bg-primary hover:bg-blue-600">Đăng ký</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer Section */}
      <footer className="bg-secondary text-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Footer: Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Column 1: Brand Info */}
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-primary text-white p-2 rounded-xl transition-transform group-hover:rotate-12">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="text-2xl font-extrabold text-white tracking-tight">Mobile<span className="text-primary">Store</span></span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">
                MobileStore Deluxe tự hào là đơn vị cung cấp các dòng điện thoại thông minh chính hãng hàng đầu Việt Nam. Chất lượng - Uy tín - Tận tâm.
              </p>
              <div className="flex items-center gap-4">
                {[Facebook, Instagram, Twitter, Youtube].map((Icon, idx) => (
                  <a key={idx} href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6 relative inline-block">
                Khám phá
                <span className="absolute -bottom-1 left-0 w-12 h-1 bg-primary rounded-full"></span>
              </h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                {[
                  { label: 'Trang chủ', to: '/' },
                  { label: 'Sản phẩm mới', to: '/' },
                  { label: 'Chương trình Hội viên', to: '/membership' },
                  { label: 'Chính sách bảo hành', to: '/' },
                  { label: 'Điều khoản dịch vụ', to: '/' },
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.to} className="flex items-center gap-2 hover:text-primary transition-all hover:translate-x-1">
                      <ChevronRight className="w-4 h-4 text-primary" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-6 relative inline-block">
                Hỗ trợ khách hàng
                <span className="absolute -bottom-1 left-0 w-12 h-1 bg-primary rounded-full"></span>
              </h4>
              <div className="space-y-4 text-sm text-gray-400">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  <span>123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-white font-bold">1900 1234 (8:00 - 22:00)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <span>support@mobilestore.com</span>
                </div>
                <div className="pt-4 flex gap-4">
                  <div className="p-2 bg-gray-800 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="p-2 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="p-2 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <h4 className="text-lg font-bold mb-6 relative inline-block">
                Đăng ký nhận tin
                <span className="absolute -bottom-1 left-0 w-12 h-1 bg-primary rounded-full"></span>
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                Đừng bỏ lỡ các ưu đãi khủng và tin tức công nghệ mới nhất.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="relative group">
                <input 
                  type="email" 
                  placeholder="Email của bạn..." 
                  required
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  className="w-full bg-gray-800 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary transition-all group-hover:bg-gray-700"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1.5 p-1.5 bg-primary rounded-lg text-white hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Thanh toán an toàn</p>
                <div className="flex flex-wrap gap-2">
                   <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center"><CreditCard className="w-5 h-5 text-gray-900" /></div>
                   <div className="bg-blue-600 text-white p-1 rounded h-8 w-12 text-[10px] font-bold flex items-center justify-center">VISA</div>
                   <div className="bg-red-600 text-white p-1 rounded h-8 w-12 text-[10px] font-bold flex items-center justify-center">MOMO</div>
                   <div className="bg-orange-500 text-white p-1 rounded h-8 w-12 text-[10px] font-bold flex items-center justify-center">COD</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer: Copyright */}
          <div className="py-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start">
               <p className="text-gray-500 text-xs mb-1">
                 &copy; 2024 MobileStore Deluxe. Tất cả quyền được bảo lưu.
               </p>
               <p className="text-gray-600 text-[10px]">
                 Thiết kế bởi Senior Engineering Team
               </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-gray-500">
               <a href="#" className="hover:text-white transition">Chính sách bảo mật</a>
               <a href="#" className="hover:text-white transition">Chính sách thanh toán</a>
               <a href="#" className="hover:text-white transition">Chính sách vận chuyển</a>
               <a href="#" className="hover:text-white transition">Sitemap</a>
            </div>

            <div className="flex gap-4">
               {/* Mock App Download Buttons */}
               <div className="px-3 py-1 bg-gray-800 rounded-md flex items-center gap-2 cursor-pointer hover:bg-gray-700 transition">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                  <div className="flex flex-col text-[8px] leading-tight">
                     <span className="text-gray-400">Download on</span>
                     <span className="text-white font-bold">App Store</span>
                  </div>
               </div>
               <div className="px-3 py-1 bg-gray-800 rounded-md flex items-center gap-2 cursor-pointer hover:bg-gray-700 transition">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                  <div className="flex flex-col text-[8px] leading-tight">
                     <span className="text-gray-400">Get it on</span>
                     <span className="text-white font-bold">Google Play</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
