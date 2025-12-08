import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Star, Shield, ArrowRight, CheckCircle2, Trophy, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, formatCurrency } from '../services/realApi';

const Membership: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [userSpending, setUserSpending] = useState(0);

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

  const getNextTierInfo = (currentSpending: number) => {
      if (currentSpending < 10000000) {
          return { nextTier: 'Vàng', target: 10000000 };
      } else if (currentSpending < 50000000) {
          return { nextTier: 'Kim Cương', target: 50000000 };
      } else {
          return { nextTier: 'Max', target: currentSpending };
      }
  };

  const { nextTier, target } = getNextTierInfo(userSpending);
  const progressPercent = nextTier === 'Max' ? 100 : Math.min(100, (userSpending / target) * 100);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      
      {/* If logged in, show progress dashboard */}
      {isAuthenticated && (
        <div className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg bg-white/10 backdrop-blur-md`}>
                                    <Crown className={`w-6 h-6 ${user?.tier === 'diamond' ? 'text-blue-300' : user?.tier === 'gold' ? 'text-yellow-300' : 'text-gray-300'}`} />
                                </div>
                                <h2 className="text-2xl font-bold">Xin chào, {user?.name}</h2>
                            </div>
                            <p className="text-blue-200">Thành viên hạng: <span className="font-bold text-white uppercase">{user?.tier === 'diamond' ? 'Kim Cương' : user?.tier === 'gold' ? 'Vàng' : 'Bạc'}</span></p>
                        </div>

                        <div className="flex-grow max-w-xl w-full bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <p className="text-xs text-blue-200 uppercase tracking-wider font-bold mb-1">Tổng chi tiêu tích lũy</p>
                                    <p className="text-2xl font-bold">{formatCurrency(userSpending)}</p>
                                </div>
                                {nextTier !== 'Max' && (
                                    <div className="text-right">
                                        <p className="text-xs text-blue-200">Mục tiêu: <span className="font-bold text-white">{formatCurrency(target)}</span></p>
                                        <p className="text-xs text-blue-200">Còn thiếu: <span className="font-bold text-yellow-300">{formatCurrency(target - userSpending)}</span></p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="w-full bg-gray-700/50 rounded-full h-3 mb-1">
                                <div 
                                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-1000 relative" 
                                    style={{ width: `${progressPercent}%` }}
                                >
                                </div>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase text-white/50 pt-1">
                                <span>0 đ</span>
                                {nextTier !== 'Max' ? <span>{nextTier === 'Vàng' ? '10 Triệu (Vàng)' : '50 Triệu (Kim Cương)'}</span> : <span>MAX</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Hero Section (Only show if NOT logged in, or purely informational) */}
      {!isAuthenticated && (
        <div className="bg-gray-900 text-white pt-20 pb-24 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 opacity-90"></div>
            <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-100">Chương trình Khách hàng Thân thiết</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
                Nâng tầm trải nghiệm <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                Hội viên MobileStore
                </span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Tham gia ngay để nhận ưu đãi độc quyền, tích điểm đổi quà và tận hưởng dịch vụ đẳng cấp dành riêng cho bạn.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold px-8 py-4 rounded-full text-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transform hover:-translate-y-1 transition-all">
                Đăng ký Hội viên ngay <ArrowRight className="w-5 h-5" />
            </Link>
            </div>
        </div>
      )}

      {/* Tiers Section */}
      <div className={`max-w-7xl mx-auto px-4 ${isAuthenticated ? 'pt-10' : '-mt-16'} relative z-20`}>
        <div className="text-center mb-10">
            <h2 className={`text-3xl font-bold ${isAuthenticated ? 'text-gray-900' : 'text-white'}`}>Quyền lợi các hạng thành viên</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Silver Tier */}
            <div className={`bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform transition duration-300 ${user?.tier === 'silver' ? 'ring-4 ring-gray-200 scale-105' : 'hover:-translate-y-2'}`}>
                <div className="bg-gray-100 p-6 text-center border-b border-gray-200 relative">
                    {user?.tier === 'silver' && <div className="absolute top-4 right-4 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">Hiện tại</div>}
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Hội viên Bạc</h3>
                    <p className="text-gray-500 text-sm mt-1">Dành cho tất cả thành viên</p>
                </div>
                <div className="p-8">
                    <div className="text-center mb-6">
                        <span className="text-4xl font-bold text-gray-900">0đ</span>
                        <span className="text-gray-500"> / chi tiêu</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-gray-600">Tặng coupon 200k chào mừng</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-gray-600">Tích lũy 1% giá trị đơn hàng</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-gray-600">Ưu đãi sinh nhật</span>
                        </li>
                    </ul>
                    {!isAuthenticated && (
                        <Link to="/register" className="block w-full text-center py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:border-gray-900 hover:text-gray-900 transition">
                            Đăng ký ngay
                        </Link>
                    )}
                </div>
            </div>

            {/* Gold Tier */}
            <div className={`bg-white rounded-3xl shadow-2xl border-2 border-yellow-400 overflow-hidden transform transition duration-300 relative z-10 ${user?.tier === 'gold' ? 'scale-110 shadow-yellow-200' : 'hover:-translate-y-2'}`}>
                {user?.tier === 'gold' ? (
                     <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">HIỆN TẠI</div>
                ) : (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">PHỔ BIẾN</div>
                )}
                
                <div className="bg-gradient-to-b from-yellow-50 to-white p-6 text-center border-b border-yellow-100">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
                        <Star className="w-8 h-8 fill-current" />
                    </div>
                    <h3 className="text-2xl font-bold text-yellow-800">Hội viên Vàng</h3>
                    <p className="text-yellow-600 text-sm mt-1">Chi tiêu từ 10.000.000đ</p>
                </div>
                <div className="p-8">
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                            <span className="text-gray-900 font-medium">Tất cả quyền lợi hạng Bạc</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                            <span className="text-gray-600">Giảm trực tiếp <span className="font-bold text-gray-900">2%</span> mọi đơn hàng</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                            <span className="text-gray-600">Tích lũy 2% điểm thưởng</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                            <span className="text-gray-600">Freeship toàn quốc</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Diamond Tier */}
            <div className={`bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden transform transition duration-300 ${user?.tier === 'diamond' ? 'ring-4 ring-blue-200 scale-105' : 'hover:-translate-y-2'}`}>
                <div className="bg-blue-50 p-6 text-center border-b border-blue-100 relative">
                    {user?.tier === 'diamond' && <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">Hiện tại</div>}
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <Crown className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-900">Hội viên Kim Cương</h3>
                    <p className="text-blue-600 text-sm mt-1">Chi tiêu từ 50.000.000đ</p>
                </div>
                <div className="p-8">
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <span className="text-gray-900 font-medium">Quyền lợi hạng Vàng</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <span className="text-gray-600">Giảm trực tiếp <span className="font-bold text-gray-900">5%</span> mọi đơn hàng</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <span className="text-gray-600">Hỗ trợ kỹ thuật 24/7 riêng biệt</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <span className="text-gray-600">Quà tặng đặc biệt cuối năm</span>
                        </li>
                    </ul>
                </div>
            </div>

        </div>
      </div>

    </div>
  );
};

export default Membership;