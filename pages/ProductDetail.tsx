import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, formatCurrency } from '../services/realApi';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ArrowLeft, Star, Check, ShieldCheck, Truck, LogIn, Send, User, Gift, Zap, ArrowRight, CreditCard } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Review State
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      if (id) {
        try {
          const allProducts = await api.getProducts();
          const foundProduct = allProducts.find(p => p.id === id);
          
          if (foundProduct) {
            setProduct(foundProduct);
            
            // Filter related products (same brand, excluding current)
            const related = allProducts.filter(
              p => p.brand === foundProduct.brand && p.id !== foundProduct.id
            ).slice(0, 4);
            setRelatedProducts(related);
          } else {
            navigate('/'); // Redirect if not found
          }
        } catch (error) {
          console.error('Failed to load product');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProductAndRelated();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (product) addToCart(product);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (product) {
        addToCart(product);
        navigate('/cart');
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setReviewSubmitting(true);
    try {
        const userName = user?.name || 'Khách';
        const updatedProduct = await api.addReview(product.id, {
            userName,
            rating: newReview.rating,
            comment: newReview.comment
        });
        setProduct(updatedProduct);
        setNewReview({ rating: 5, comment: '' }); // Reset form
    } catch (error) {
        console.error('Failed to add review');
    } finally {
        setReviewSubmitting(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800';
    e.currentTarget.classList.remove('mix-blend-multiply');
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
      );
  }

  if (!product) return null;

  const averageRating = product.reviews && product.reviews.length > 0
    ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
    : 0;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
       {/* Login Request Modal */}
       {showLoginModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <LogIn className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
            <p className="text-gray-500 mb-6">Bạn cần đăng nhập để thực hiện hành động này.</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary font-medium mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Quay lại trang chủ
        </Link>

        {/* Main Product Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12">
                {/* Image Gallery Side */}
                <div className="bg-gray-50 p-0 flex items-center justify-center h-[500px] overflow-hidden">
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        onError={handleImageError}
                        className="w-full h-full object-cover drop-shadow-2xl transition-transform hover:scale-105 duration-500"
                    />
                </div>

                {/* Info Side */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="mb-6">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wide">
                                {product.brand}
                            </span>
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="font-bold text-gray-900">{averageRating || 'N/A'}</span>
                                <span className="text-gray-400 text-sm">({product.reviews?.length || 0} đánh giá)</span>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
                        
                        {/* Price Display */}
                        <div className="mb-2">
                           {product.originalPrice && product.originalPrice > product.price ? (
                               <div className="flex flex-col">
                                   <span className="text-lg text-gray-400 line-through font-medium">
                                       {formatCurrency(product.originalPrice)}
                                   </span>
                                   <div className="flex items-center gap-3">
                                       <span className="text-3xl font-bold text-red-600">
                                           {formatCurrency(product.price)}
                                       </span>
                                       <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md">
                                           -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                       </span>
                                   </div>
                               </div>
                           ) : (
                               <p className="text-3xl font-bold text-primary">{formatCurrency(product.price)}</p>
                           )}
                        </div>
                        
                        <p className="text-gray-500 text-sm">Đã bao gồm thuế VAT</p>
                    </div>

                    {/* Promotion Section */}
                    {product.promotion && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                           <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600">
                             <Gift className="w-5 h-5" />
                           </div>
                           <div>
                             <h4 className="text-sm font-bold text-indigo-900 mb-1 flex items-center gap-1">
                               <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Ưu đãi đặc biệt
                             </h4>
                             <p className="text-sm text-indigo-800">{product.promotion}</p>
                           </div>
                        </div>
                    )}

                    <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
                         <p>{product.description || "Chưa có mô tả cho sản phẩm này."}</p>
                    </div>

                    {product.features && product.features.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Tính năng nổi bật</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {product.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start text-sm text-gray-700">
                                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t border-gray-100 pt-8 mt-auto">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-500">Tình trạng kho:</span>
                            {product.stock > 0 ? (
                                <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Còn hàng ({product.stock})
                                </span>
                            ) : (
                                <span className="text-sm font-bold text-red-600">Hết hàng</span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                           <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <ShieldCheck className="w-6 h-6 text-blue-500" />
                              <div className="text-xs">
                                <p className="font-bold text-gray-900">Bảo hành 2 năm</p>
                                <p className="text-gray-500">Chính hãng</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <Truck className="w-6 h-6 text-blue-500" />
                              <div className="text-xs">
                                <p className="font-bold text-gray-900">Freeship</p>
                                <p className="text-gray-500">Toàn quốc</p>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <button 
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                                    product.stock > 0
                                    ? 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                }`}
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Thêm vào giỏ
                            </button>
                            <button 
                                onClick={handleBuyNow}
                                disabled={product.stock === 0}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                                    product.stock > 0
                                    ? 'bg-primary text-white hover:bg-blue-600 shadow-blue-500/30'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <CreditCard className="w-5 h-5" />
                                {product.stock > 0 ? 'Mua ngay' : 'Hết hàng'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Reviews List */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    Đánh giá từ khách hàng
                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {product.reviews?.length || 0}
                    </span>
                </h2>

                <div className="space-y-6">
                    {product.reviews && product.reviews.length > 0 ? (
                        product.reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold">
                                        {review.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-gray-900">{review.userName}</h4>
                                            <span className="text-xs text-gray-500">{review.date}</span>
                                        </div>
                                        <div className="flex text-yellow-400 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            Chưa có đánh giá nào. Hãy là người đầu tiên!
                        </div>
                    )}
                </div>
            </div>

            {/* Add Review Form */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Viết đánh giá của bạn</h3>
                    
                    {!isAuthenticated ? (
                         <div className="text-center py-6">
                            <p className="text-gray-500 mb-4">Vui lòng đăng nhập để gửi đánh giá.</p>
                            <button 
                                onClick={() => setShowLoginModal(true)}
                                className="w-full py-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition"
                            >
                                Đăng nhập ngay
                            </button>
                         </div>
                    ) : (
                        <form onSubmit={handleAddReview}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Chất lượng sản phẩm</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star 
                                                className={`w-8 h-8 ${star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung đánh giá</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition resize-none"
                                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={reviewSubmitting || !newReview.comment}
                                className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    Sản phẩm tương tự
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map((related) => (
                        <div 
                            key={related.id}
                            onClick={() => {
                                window.scrollTo(0,0);
                                navigate(`/product/${related.id}`);
                            }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
                        >
                            <div className="h-48 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                                <img 
                                    src={related.image} 
                                    alt={related.name} 
                                    onError={handleImageError}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                                />
                                {related.promotion && (
                                    <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                        ƯU ĐÃI
                                    </span>
                                )}
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-blue-600 font-bold mb-1 uppercase">{related.brand}</p>
                                <h4 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">{related.name}</h4>
                                <p className="font-bold text-gray-900">{formatCurrency(related.price)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;