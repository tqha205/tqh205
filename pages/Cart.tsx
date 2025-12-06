import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard, CheckCircle, Loader2, User, Phone, MapPin, Calendar, X, Wallet, Banknote, LogIn, AlertCircle, Ticket, Tag, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api, formatCurrency } from '../services/mockApi';
import { useAuth } from '../context/AuthContext';
import { PaymentMethod, Coupon } from '../types';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    birthYear: '',
    paymentMethod: 'cod' as PaymentMethod
  });

  // Coupon State
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [manualCouponCode, setManualCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{show: boolean, message: string}>({show: false, message: ''});

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800';
    e.currentTarget.classList.remove('mix-blend-multiply');
  };

  const initiateCheckout = () => {
    if (!isAuthenticated || !user) {
      setShowLoginModal(true);
      return;
    }
    // Pre-fill name if available
    setCheckoutForm(prev => ({ ...prev, name: user.name }));
    setIsCheckoutOpen(true);
  };

  // Handle Manual Coupon Apply
  const handleApplyManualCoupon = () => {
    setCouponMessage(null);
    if (!manualCouponCode.trim()) return;

    // Check if code exists in user's coupons
    const foundCoupon = user?.coupons?.find(c => c.code.toLowerCase() === manualCouponCode.trim().toLowerCase());

    if (foundCoupon) {
      setSelectedCoupon(foundCoupon);
      setCouponMessage({ type: 'success', text: `Đã áp dụng mã ${foundCoupon.code}: Giảm ${formatCurrency(foundCoupon.discount)}` });
      setManualCouponCode(''); // Clear input on success
    } else {
      setSelectedCoupon(null);
      setCouponMessage({ type: 'error', text: 'Mã giảm giá không hợp lệ hoặc bạn không sở hữu mã này.' });
    }
  };

  // Handle Select from List
  const handleSelectCoupon = (coupon: Coupon) => {
    if (selectedCoupon?.code === coupon.code) {
      setSelectedCoupon(null);
      setCouponMessage(null);
    } else {
      setSelectedCoupon(coupon);
      setCouponMessage({ type: 'success', text: `Đã áp dụng mã ${coupon.code}` });
      setManualCouponCode(''); 
    }
  };

  // Calculate discount based on payment method
  const calculatePaymentMethodDiscount = () => {
      let discount = 0;
      cart.forEach(item => {
          if (item.discountAmount && item.discountAmount > 0) {
              // Check condition
              if (item.discountCondition === 'all') {
                  discount += item.discountAmount * item.quantity;
              } else if (item.discountCondition === checkoutForm.paymentMethod) {
                  discount += item.discountAmount * item.quantity;
              }
          }
      });
      return discount;
  };

  const paymentMethodDiscount = calculatePaymentMethodDiscount();
  const couponDiscount = selectedCoupon ? selectedCoupon.discount : 0;
  const totalDiscount = paymentMethodDiscount + couponDiscount;

  const tax = cartTotal * 0.02; // Updated to 2%
  const finalTotal = Math.max(0, cartTotal + tax - totalDiscount);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsProcessing(true);
    try {
      const newOrder = await api.createOrder({
        userId: user.id,
        customerName: checkoutForm.name, // Main display name
        customerInfo: {
          name: checkoutForm.name,
          phone: checkoutForm.phone,
          address: checkoutForm.address,
          birthYear: checkoutForm.birthYear
        },
        paymentMethod: checkoutForm.paymentMethod,
        items: cart,
        total: finalTotal, // Use final total with discount applied
      });
      
      setOrderId(newOrder.id);
      setIsCheckoutOpen(false);
      setOrderSuccess(true);
      clearCart();
    } catch (error) {
      setErrorModal({show: true, message: "Có lỗi xảy ra khi thanh toán. Vui lòng thử lại."});
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-500 mb-2 text-center">
          Cảm ơn bạn đã mua sắm. Mã đơn hàng của bạn là <span className="font-bold text-gray-900">#{orderId}</span>.
        </p>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Đơn hàng sẽ sớm được xử lý và giao đến bạn.
        </p>
        <div className="flex gap-4">
          <Link 
            to="/" 
            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Login Request Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <LogIn className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
            <p className="text-gray-500 mb-6">Bạn cần đăng nhập để tiếp tục thanh toán.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLoginModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="flex-1 py-2.5 rounded-xl bg-primary font-medium text-white hover:bg-blue-600 transition shadow-lg shadow-blue-500/30"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModal.show && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setErrorModal({...errorModal, show: false})}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thông báo</h3>
            <p className="text-gray-500 mb-6">{errorModal.message}</p>
            <button 
              onClick={() => setErrorModal({...errorModal, show: false})}
              className="w-full py-2.5 rounded-xl bg-gray-900 font-medium text-white hover:bg-gray-800 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng của bạn đang trống</h2>
          <p className="text-gray-500 mb-8 text-center max-w-md">
            Có vẻ như bạn chưa thêm gì vào giỏ hàng. 
            Hãy bắt đầu duyệt qua bộ sưu tập của chúng tôi để tìm thiết bị tốt nhất cho bạn.
          </p>
          <Link 
            to="/" 
            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Bắt đầu mua sắm
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            Giỏ hàng
            <span className="text-lg font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {cart.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm
            </span>
          </h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items List */}
            <div className="lg:w-2/3 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 transition-transform hover:shadow-md">
                  {/* Product Image */}
                  <div className="w-full sm:w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      onError={handleImageError}
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow text-center sm:text-left">
                    <p className="text-sm text-primary font-bold uppercase tracking-wider mb-1">{item.brand}</p>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-gray-500 text-sm mb-1">{item.category}</p>
                    {item.discountAmount && item.discountAmount > 0 && (
                        <p className="text-xs text-red-500 font-medium">
                            * Giảm thêm {formatCurrency(item.discountAmount)} (Áp dụng: {item.discountCondition === 'all' ? 'Mọi hình thức' : item.discountCondition === 'banking' ? 'Chuyển khoản' : 'COD'})
                        </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:text-primary transition disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:text-primary transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 min-w-[100px] justify-end">
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              
              <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary font-medium mt-4 group">
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Tiếp tục mua sắm
              </Link>
            </div>

            {/* Order Summary - Desktop Only (Hidden on mobile checkout because details are in modal) */}
            <div className="hidden lg:block lg:w-1/3">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tổng đơn hàng</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-medium">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Vận chuyển</span>
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Thuế (2%)</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  <div className="h-px bg-gray-100 my-4"></div>
                   <div className="text-xs text-gray-400 italic text-center mb-2">
                      * Ưu đãi và coupon sẽ được tính toán chi tiết tại bước thanh toán
                   </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Ước tính</span>
                    <span>{formatCurrency(cartTotal * 1.02)}</span>
                  </div>
                </div>

                <button 
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={initiateCheckout}
                  disabled={isProcessing}
                >
                  <CreditCard className="w-5 h-5" />
                  Tiến hành thanh toán
                </button>
                
                <p className="text-xs text-center text-gray-400 mt-4">
                  Thanh toán bảo mật - Hoàn tiền 100% nếu có lỗi
                </p>
              </div>
            </div>
            
            {/* Mobile Sticky Checkout Button */}
             <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
                <div className="flex justify-between items-center mb-3">
                   <span className="text-gray-600">Tổng tiền ước tính:</span>
                   <span className="text-xl font-bold text-primary">{formatCurrency(cartTotal * 1.02)}</span>
                </div>
                <button 
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                  onClick={initiateCheckout}
                >
                  <CreditCard className="w-5 h-5" />
                  Thanh toán ngay
                </button>
             </div>
          </div>
        </>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
             <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCheckoutOpen(false)}></div>
             
             <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
               <div className="bg-white px-6 py-6">
                 <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-2xl font-bold text-gray-900">Thông tin thanh toán</h3>
                    <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                      <X className="w-6 h-6" />
                    </button>
                 </div>

                 <form onSubmit={handleConfirmOrder} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và Tên</label>
                        <div className="relative">
                          <input 
                            type="text" required
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                            placeholder="Nguyễn Văn A"
                            value={checkoutForm.name}
                            onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})}
                          />
                          <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
                        <div className="relative">
                          <input 
                            type="tel" required
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                            placeholder="0912345678"
                            value={checkoutForm.phone}
                            onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                          />
                          <Phone className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        </div>
                      </div>

                       {/* Birth Year */}
                       <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Năm sinh</label>
                        <div className="relative">
                          <input 
                            type="number" required min="1900" max={new Date().getFullYear()}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                            placeholder="2000"
                            value={checkoutForm.birthYear}
                            onChange={e => setCheckoutForm({...checkoutForm, birthYear: e.target.value})}
                          />
                          <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      
                      {/* Address */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Địa chỉ giao hàng</label>
                        <div className="relative">
                          <textarea 
                            required rows={2}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                            placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
                            value={checkoutForm.address}
                            onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})}
                          />
                          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Coupon Section */}
                    {user?.coupons && (
                      <div className="border-t border-gray-100 pt-6">
                        <label className="block text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                           <Ticket className="w-5 h-5 text-primary" /> Mã giảm giá (Coupon)
                        </label>
                        
                        {/* Manual Input */}
                        <div className="flex gap-2 mb-4">
                           <div className="relative flex-grow">
                             <input 
                               type="text"
                               placeholder="Nhập mã giảm giá..."
                               className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition uppercase"
                               value={manualCouponCode}
                               onChange={(e) => setManualCouponCode(e.target.value)}
                             />
                             <Tag className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                           </div>
                           <button
                             type="button"
                             onClick={handleApplyManualCoupon}
                             className="px-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
                           >
                             Áp dụng
                           </button>
                        </div>

                        {/* Message Toast */}
                        {couponMessage && (
                           <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 text-sm font-medium ${
                              couponMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                           }`}>
                              {couponMessage.type === 'success' ? <CheckCircle className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
                              {couponMessage.text}
                           </div>
                        )}

                        {/* List of Available Coupons */}
                        {user.coupons.length > 0 ? (
                           <div>
                             <p className="text-sm text-gray-500 mb-2 font-medium">Mã của bạn:</p>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1">
                              {user.coupons.map((coupon, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => handleSelectCoupon(coupon)}
                                    className={`border rounded-xl p-3 cursor-pointer transition relative flex items-start gap-3 ${
                                      selectedCoupon?.code === coupon.code 
                                      ? 'border-primary bg-blue-50 ring-1 ring-primary' 
                                      : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg flex-shrink-0 ${selectedCoupon?.code === coupon.code ? 'bg-white text-primary' : 'bg-gray-100 text-gray-500'}`}>
                                      <Tag className="w-5 h-5" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                      <div className="flex justify-between items-center">
                                         <p className="font-bold text-gray-900 truncate">{coupon.code}</p>
                                         <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">Hội viên</span>
                                      </div>
                                      <p className="text-xs text-gray-500 line-clamp-1">{coupon.description}</p>
                                      <p className="text-xs font-bold text-primary mt-1">Giảm: {formatCurrency(coupon.discount)}</p>
                                    </div>
                                    {selectedCoupon?.code === coupon.code && (
                                      <CheckCircle className="absolute -top-2 -right-2 w-5 h-5 text-primary bg-white rounded-full" />
                                    )}
                                </div>
                              ))}
                             </div>
                           </div>
                        ) : (
                          <div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                             <p className="text-sm text-gray-500">Bạn chưa có coupon nào. Đăng ký hội viên để nhận ưu đãi!</p>
                             <Link to="/membership" onClick={() => setIsCheckoutOpen(false)} className="text-sm text-primary font-bold hover:underline mt-1 block">Xem quyền lợi hội viên</Link>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-6">
                      <label className="block text-lg font-bold text-gray-900 mb-4">Phương thức thanh toán</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* COD Option */}
                        <div 
                          className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                            checkoutForm.paymentMethod === 'cod' 
                              ? 'border-primary bg-blue-50 ring-2 ring-primary/20' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: 'cod'})}
                        >
                          <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4">
                            <Banknote className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">Tiền mặt (COD)</p>
                            <p className="text-xs text-gray-500">Thanh toán khi nhận hàng</p>
                          </div>
                          {checkoutForm.paymentMethod === 'cod' && (
                            <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-primary" />
                          )}
                        </div>

                        {/* Banking Option */}
                        <div 
                          className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                            checkoutForm.paymentMethod === 'banking' 
                              ? 'border-primary bg-blue-50 ring-2 ring-primary/20' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: 'banking'})}
                        >
                          <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4">
                            <Wallet className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">Chuyển khoản</p>
                            <p className="text-xs text-gray-500">Qua ngân hàng / QR Code</p>
                          </div>
                           {checkoutForm.paymentMethod === 'banking' && (
                            <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-primary" />
                          )}
                        </div>
                      </div>

                      {/* Banking Details Info */}
                      {checkoutForm.paymentMethod === 'banking' && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 animate-in fade-in slide-in-from-top-2">
                           <p className="font-bold mb-1">Thông tin chuyển khoản:</p>
                           <p>Ngân hàng: <span className="font-mono font-bold">MB Bank</span></p>
                           <p>Số tài khoản: <span className="font-mono font-bold">9999 8888 6666</span></p>
                           <p>Chủ tài khoản: <span className="font-bold uppercase">Cong Ty Mobile Store</span></p>
                           <p className="mt-2 text-xs opacity-80">* Nội dung chuyển khoản: Tên + SĐT</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                       <div className="space-y-2 mb-4">
                           <div className="flex justify-between text-gray-600">
                                <span>Tạm tính</span>
                                <span>{formatCurrency(cartTotal)}</span>
                           </div>
                           <div className="flex justify-between text-gray-600">
                                <span>Thuế (2%)</span>
                                <span>{formatCurrency(tax)}</span>
                           </div>
                           {paymentMethodDiscount > 0 && (
                                <div className="flex justify-between text-red-500 font-medium">
                                    <span>Ưu đãi thanh toán ({checkoutForm.paymentMethod === 'banking' ? 'Chuyển khoản' : 'Tiền mặt'})</span>
                                    <span>- {formatCurrency(paymentMethodDiscount)}</span>
                                </div>
                           )}
                           {couponDiscount > 0 && (
                                <div className="flex justify-between text-green-600 font-medium animate-in fade-in slide-in-from-right-4">
                                    <span>Coupon áp dụng ({selectedCoupon?.code})</span>
                                    <span>- {formatCurrency(couponDiscount)}</span>
                                </div>
                           )}
                       </div>
                       <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                          <div className="text-lg">
                             Tổng tiền: <span className="font-bold text-primary text-2xl">{formatCurrency(finalTotal)}</span>
                          </div>
                          <button 
                            type="submit"
                            disabled={isProcessing}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-70"
                          >
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                            Xác nhận đặt hàng
                          </button>
                       </div>
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

export default Cart;