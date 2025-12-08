import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { X, ShoppingBag, Check, ShieldCheck, Truck, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../services/realApi';

interface ProductDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDrawer: React.FC<ProductDrawerProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Handle animation state
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800';
    e.currentTarget.classList.remove('mix-blend-multiply');
  };

  if (!isVisible && !isOpen) return null;
  if (!product) return null;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    addToCart(product);
  };

  return (
    <>
       {/* Login Request Modal */}
       {showLoginModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <LogIn className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
            <p className="text-gray-500 mb-6">Bạn cần đăng nhập để mua hàng.</p>
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
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-[60] flex justify-end">
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        ></div>

        {/* Drawer Panel */}
        <div 
          className={`relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Chi tiết sản phẩm</h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Image */}
            <div className="bg-gray-50 rounded-2xl mb-8 flex justify-center items-center h-64 overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title & Price */}
            <div className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wide">
                  {product.brand}
                </span>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
                  <span className="text-xs text-gray-500">Đã bao gồm thuế</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>
              
              {/* Description */}
              <div className="prose prose-sm text-gray-600 mb-6">
                <p>{product.description || "Chưa có mô tả cho sản phẩm này."}</p>
              </div>

              {/* Features List */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Tính năng nổi bật</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-600">
                        <div className="mr-3 mt-0.5 text-green-500 bg-green-50 rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 py-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-blue-500/80" />
                <div className="text-xs">
                  <p className="font-bold text-gray-900">Bảo hành 2 năm</p>
                  <p className="text-gray-500">Bảo vệ toàn diện</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="w-8 h-8 text-blue-500/80" />
                <div className="text-xs">
                  <p className="font-bold text-gray-900">Miễn phí vận chuyển</p>
                  <p className="text-gray-500">Đơn hàng trên 10tr</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Tình trạng:</span>
              {product.stock > 0 ? (
                <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div> Còn hàng ({product.stock})
                </span>
              ) : (
                <span className="text-sm font-bold text-red-600">Hết hàng</span>
              )}
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                product.stock > 0
                  ? 'bg-primary text-white hover:bg-blue-600 shadow-blue-500/30 hover:-translate-y-1'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDrawer;