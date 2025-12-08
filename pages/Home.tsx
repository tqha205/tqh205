import React, { useEffect, useState } from 'react';
import { api, formatCurrency } from '../services/realApi';
import { Product, MembershipTier } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Search, ShoppingBag, Filter, Eye, LogIn, CreditCard, ChevronDown, ArrowUpDown, Crown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Membership Progress State
  const [userSpending, setUserSpending] = useState(0);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');
  
  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await api.getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch User Spending if Logged In
  useEffect(() => {
      const fetchSpending = async () => {
          if (user) {
              try {
                  const spent = await api.getUserTotalSpending(user.id);
                  setUserSpending(spent);
              } catch (e) {
                  console.error(e);
              }
          }
      };
      fetchSpending();
  }, [user]);

  useEffect(() => {
    let result = [...products];

    // 1. Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.brand.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 3. Sort by Price
    if (sortOrder === 'asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, sortOrder, products]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    addToCart(product);
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!isAuthenticated) {
        setShowLoginModal(true);
        return;
    }
    addToCart(product);
    navigate('/cart');
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const brands = ['All', ...Array.from(new Set(products.map(p => p.brand)))];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800';
    e.currentTarget.classList.remove('mix-blend-multiply');
  };

  // Helper to calculate next tier progress
  const getNextTierInfo = (currentSpending: number) => {
      if (currentSpending < 10000000) {
          return { nextTier: 'Vàng', target: 10000000, next: 'gold' };
      } else if (currentSpending < 50000000) {
          return { nextTier: 'Kim Cương', target: 50000000, next: 'diamond' };
      } else {
          return { nextTier: 'Max', target: currentSpending, next: 'diamond' };
      }
  };

  const { nextTier, target } = getNextTierInfo(userSpending);
  const progressPercent = Math.min(100, (userSpending / target) * 100);

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* Login Request Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <LogIn className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
            <p className="text-gray-500 mb-6">Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng và thanh toán.</p>
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

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        
        {/* Modern Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gray-900 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
          <div className="relative z-10 px-8 py-12 md:py-16 md:px-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:w-2/3">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
                Nâng cấp <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">Cuộc sống số</span>
              </h1>
              <p className="text-base md:text-lg text-blue-100 max-w-xl mb-8">
                Khám phá những mẫu điện thoại thông minh hàng đầu với công nghệ tiên tiến và thiết kế đẳng cấp.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  {!isAuthenticated ? (
                     // Show Register Button if NOT logged in
                     <Link 
                        to="/membership" 
                        className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-yellow-500/30 transition-transform transform hover:-translate-y-1"
                    >
                        <Crown className="w-5 h-5 fill-current" />
                        Đăng ký Hội viên
                    </Link>
                  ) : (
                      // Show Progress Info if Logged In
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl min-w-[300px] text-left">
                          <div className="flex items-center gap-2 mb-2">
                             <Crown className={`w-5 h-5 ${user?.tier === 'diamond' ? 'text-blue-300' : user?.tier === 'gold' ? 'text-yellow-300' : 'text-gray-300'} fill-current`} />
                             <span className="text-white font-bold uppercase text-sm">Hạng hiện tại: {user?.tier === 'diamond' ? 'Kim Cương' : user?.tier === 'gold' ? 'Vàng' : 'Bạc'}</span>
                          </div>
                          {nextTier !== 'Max' ? (
                             <>
                                <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
                                    <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                                <p className="text-xs text-blue-200">
                                    Tiêu thêm <span className="font-bold text-white">{formatCurrency(target - userSpending)}</span> để lên hạng {nextTier}
                                </p>
                             </>
                          ) : (
                             <p className="text-xs text-blue-200 font-bold">Bạn đã đạt hạng cao nhất!</p>
                          )}
                          <Link to="/membership" className="text-xs text-white/70 hover:text-white underline mt-1 block">Xem chi tiết quyền lợi</Link>
                      </div>
                  )}
                  
                  <button 
                    onClick={() => {
                        const element = document.getElementById('products-section');
                        element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-white/10 backdrop-blur-md text-white font-semibold px-6 py-3 rounded-full border border-white/30 hover:bg-white/20 transition h-fit"
                  >
                     Xem sản phẩm
                  </button>
              </div>
            </div>
            {/* Decorative Element */}
            <div className="hidden md:block">
              <div className="w-64 h-64 bg-gradient-to-tr from-white/20 to-transparent rounded-full backdrop-blur-3xl absolute -right-10 -top-10"></div>
              <div className="w-40 h-40 bg-blue-500/30 rounded-full blur-2xl absolute right-20 bottom-10"></div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">

        {/* Filter and Search Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-4 sticky top-20 z-30 bg-gray-50/95 backdrop-blur-sm py-4 rounded-xl px-2 lg:px-0">
          
          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
             {/* Brand Dropdown */}
            <div className="relative w-full sm:w-56 group">
                <div className="absolute left-4 top-3.5 pointer-events-none text-gray-500">
                    <Filter className="w-5 h-5" />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary appearance-none cursor-pointer font-medium text-gray-700 shadow-sm transition hover:border-gray-300"
                >
                    {brands.map((brand) => (
                        <option key={brand} value={brand}>
                            {brand === 'All' ? 'Tất cả thương hiệu' : brand}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" />
            </div>

            {/* Price Sort Dropdown */}
            <div className="relative w-full sm:w-56 group">
                <div className="absolute left-4 top-3.5 pointer-events-none text-gray-500">
                    <ArrowUpDown className="w-5 h-5" />
                </div>
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary appearance-none cursor-pointer font-medium text-gray-700 shadow-sm transition hover:border-gray-300"
                >
                    <option value="default">Sắp xếp: Mặc định</option>
                    <option value="asc">Giá: Thấp đến Cao</option>
                    <option value="desc">Giá: Cao đến Thấp</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-80 group mt-4 lg:mt-0">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-primary bg-white shadow-sm transition-all group-hover:shadow-md"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="bg-white rounded-2xl h-96 animate-pulse shadow-sm p-4">
                  <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                  <div className="bg-gray-200 h-6 w-3/4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 w-1/2 rounded mb-8"></div>
                  <div className="bg-gray-200 h-10 w-full rounded"></div>
               </div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product.id)}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden relative cursor-pointer"
              >
                
                {/* Image Container */}
                <div className="relative h-64 bg-gray-50 overflow-hidden">
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-10"></div>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    onError={handleImageError}
                    loading="lazy" // Lazy load for performance
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110" 
                  />
                  
                  {/* Overlay Action Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                       <Eye className="w-4 h-4" /> Xem chi tiết
                    </span>
                  </div>

                  {product.promotion && (
                     <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm z-10 flex items-center gap-1">
                        ƯU ĐÃI
                     </div>
                  )}

                  {product.stock < 5 && product.stock > 0 && (
                     <span className="absolute top-4 left-4 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full border border-red-200 z-10">
                       Sắp hết hàng
                     </span>
                  )}
                  {product.stock === 0 && (
                     <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <span className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold shadow-lg">Hết hàng</span>
                     </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {product.brand}
                    </span>
                    
                    {/* Price Display Logic - Prioritize Original vs Sale Price comparison */}
                    <div className="text-right">
                       {product.originalPrice && product.originalPrice > product.price ? (
                         <>
                            <span className="block text-xs text-gray-400 line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                            <span className="block text-lg font-bold text-red-600">
                              {formatCurrency(product.price)}
                            </span>
                         </>
                       ) : (
                           <span className="block text-lg font-bold text-gray-900">
                             {formatCurrency(product.price)}
                           </span>
                       )}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex gap-2">
                    {product.stock > 0 ? (
                        <>
                            <button 
                            onClick={(e) => handleQuickAdd(e, product)}
                            className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl font-semibold transition-all duration-300 transform active:scale-95 bg-gray-100 text-gray-900 hover:bg-gray-200"
                            >
                            <ShoppingBag className="w-4 h-4" />
                            <span className="text-sm">Thêm</span>
                            </button>
                            <button 
                            onClick={(e) => handleBuyNow(e, product)}
                            className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl font-semibold transition-all duration-300 transform active:scale-95 bg-primary text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20"
                            >
                            <CreditCard className="w-4 h-4" />
                            <span className="text-sm">Mua ngay</span>
                            </button>
                        </>
                    ) : (
                        <button 
                            disabled
                            className="w-full py-3 rounded-xl font-semibold bg-gray-200 text-gray-400 cursor-not-allowed"
                        >
                            Hết hàng
                        </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <Filter className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-500">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;