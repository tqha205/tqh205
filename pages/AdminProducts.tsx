import React, { useEffect, useState } from 'react';
import { api, formatCurrency } from '../services/mockApi';
import { Product } from '../types';
import { Edit, Trash2, Plus, X, Search, Package, AlertCircle, CheckCircle2, Image as ImageIcon, Upload, FileText, List, ArrowUpDown, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

type SortKey = 'name' | 'price' | 'stock';
type SortDirection = 'asc' | 'desc';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  
  // Delete Modal State
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Filter first
    let result = products;
    if (searchTerm) {
      result = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Then Sort
    if (sortConfig) {
      result = [...result].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, products, sortConfig]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      showNotification('Không thể tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const initiateDelete = (id: string) => {
    setProductToDelete(id);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.deleteProduct(productToDelete);
      showNotification('Đã xóa sản phẩm thành công', 'success');
      loadProducts();
    } catch (error) {
      showNotification('Xóa sản phẩm thất bại', 'error');
    } finally {
      setProductToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: currentProduct.name!,
        brand: currentProduct.brand!,
        price: Number(currentProduct.price), // Giá bán (khuyến mãi)
        originalPrice: Number(currentProduct.originalPrice), // Giá gốc
        category: 'Smartphone',
        stock: Number(currentProduct.stock),
        image: currentProduct.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
        description: currentProduct.description || '',
        features: typeof currentProduct.features === 'string' 
          ? (currentProduct.features as string).split('\n').filter((f: string) => f.trim() !== '') 
          : currentProduct.features,
        promotion: currentProduct.promotion,
        discountAmount: Number(currentProduct.discountAmount || 0),
        discountCondition: currentProduct.discountCondition || 'all'
      };

      if (currentProduct.id) {
        await api.updateProduct(currentProduct.id, productData);
        showNotification('Cập nhật sản phẩm thành công', 'success');
      } else {
        await api.createProduct(productData);
        showNotification('Tạo sản phẩm mới thành công', 'success');
      }
      setIsModalOpen(false);
      loadProducts(); // Refresh list immediately
    } catch (error) {
      showNotification('Lưu sản phẩm thất bại', 'error');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Ảnh quá lớn (tối đa 5MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentProduct(prev => ({ ...prev, image: reader.result as string }));
        showNotification('Đã tải ảnh lên', 'success');
      };
      reader.onerror = () => {
        showNotification('Lỗi khi đọc file ảnh', 'error');
      };
      reader.readAsDataURL(file);
    }
  };

  const openModal = (product: Partial<Product> = {}) => {
    // Convert array features to string for textarea editing if necessary
    const processedProduct = {
      ...product,
      features: Array.isArray(product.features) ? product.features.join('\n') : product.features
    };
    setCurrentProduct(processedProduct as any);
    setIsModalOpen(true);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800';
    e.currentTarget.classList.remove('mix-blend-multiply');
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý sản phẩm</h1>
          <p className="text-gray-500 mt-1">Quản lý kho hàng, giá cả và số lượng sản phẩm.</p>
        </div>
        <button
          onClick={() => openModal({})}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> 
          <span className="font-medium">Thêm sản phẩm</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-bounce ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-6 h-6"/> : <AlertCircle className="w-6 h-6"/>}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setProductToDelete(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
            <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 font-medium text-white hover:bg-red-700 transition shadow-lg shadow-red-500/30"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-blue-500/10 transition outline-none"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-primary transition select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Thông tin sản phẩm
                    <ArrowUpDown className={`w-3 h-3 ${sortConfig?.key === 'name' ? 'text-primary' : 'text-gray-400'}`} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thương hiệu</th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-primary transition select-none"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center gap-1">
                    Giá
                    <ArrowUpDown className={`w-3 h-3 ${sortConfig?.key === 'price' ? 'text-primary' : 'text-gray-400'}`} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-primary transition select-none"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center gap-1">
                    Tình trạng kho
                    <ArrowUpDown className={`w-3 h-3 ${sortConfig?.key === 'stock' ? 'text-primary' : 'text-gray-400'}`} />
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2 text-gray-500">
                       <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                       Đang tải sản phẩm...
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    Không tìm thấy sản phẩm. Hãy thêm sản phẩm mới!
                  </td>
                </tr>
              ) : (
                currentItems.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group">
                          <img 
                            className="h-full w-full object-cover" 
                            src={product.image} 
                            alt="" 
                            onError={handleImageError}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.category}</div>
                          {product.discountAmount && product.discountAmount > 0 && (
                            <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-medium mt-1 inline-block border border-red-100">
                                Giảm thêm {formatCurrency(product.discountAmount)} (TT)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700">
                        {product.brand}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-xs text-gray-400 line-through">{formatCurrency(product.originalPrice)}</div>
                      )}
                      <div className="font-bold text-gray-900">{formatCurrency(product.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.stock > 0 ? (
                         <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                            <span className="text-sm text-green-700 font-medium">{product.stock} trong kho</span>
                         </div>
                      ) : (
                         <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                            <span className="text-sm text-red-700 font-medium">Hết hàng</span>
                         </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openModal(product)} className="text-gray-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded-full">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => initiateDelete(product.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded-full">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredProducts.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
             <div className="text-sm text-gray-500">
               Hiển thị <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> đến <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, filteredProducts.length)}</span> trong tổng số <span className="font-medium text-gray-900">{filteredProducts.length}</span> sản phẩm
             </div>
             
             <div className="flex items-center space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border ${currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-white hover:shadow-sm'}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        currentPage === i + 1 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-white border border-transparent hover:border-gray-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border ${currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-white hover:shadow-sm'}`}
                >
                   <ChevronRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Modal - Styled with Tailwind Backdrop Blur */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>

            {/* Modal Panel */}
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg max-h-[90vh] flex flex-col">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 flex-grow overflow-y-auto">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900">{currentProduct.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition rounded-full p-1 hover:bg-gray-100">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                   <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ảnh sản phẩm</label>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                         <input
                          type="text"
                          placeholder="https://example.com/image.jpg"
                          value={currentProduct.image || ''}
                          onChange={e => setCurrentProduct({ ...currentProduct, image: e.target.value })}
                          className="w-full pl-10 rounded-lg border-gray-300 border px-4 py-2.5 text-gray-900 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                        />
                        <ImageIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                      </div>
                      <label className="cursor-pointer bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg px-4 py-2.5 transition flex items-center gap-2 shadow-sm whitespace-nowrap">
                        <Upload className="w-5 h-5" />
                        <span className="hidden sm:inline text-sm font-medium">Tải lên</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                     <p className="text-xs text-gray-500 mt-1">Nhập URL hoặc tải ảnh từ thiết bị (sẽ được chuyển đổi thành Base64)</p>
                     
                     {currentProduct.image && (
                       <div className="mt-4 w-full rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex justify-center items-center p-2">
                         <img 
                           src={currentProduct.image} 
                           alt="Preview" 
                           className="max-w-full h-auto max-h-[400px] object-contain shadow-sm rounded-lg" 
                           onError={handleImageError}
                         />
                       </div>
                     )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tên sản phẩm</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: iPhone 15 Pro"
                      value={currentProduct.name || ''}
                      onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                      className="w-full rounded-lg border-gray-300 border px-4 py-2.5 text-gray-900 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Thương hiệu</label>
                      <select
                        required
                        value={currentProduct.brand || ''}
                        onChange={e => setCurrentProduct({ ...currentProduct, brand: e.target.value })}
                        className="w-full rounded-lg border-gray-300 border px-4 py-2.5 text-gray-900 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition bg-white"
                      >
                        <option value="">Chọn thương hiệu</option>
                        <option value="Apple">Apple</option>
                        <option value="Samsung">Samsung</option>
                        <option value="Google">Google</option>
                        <option value="Xiaomi">Xiaomi</option>
                        <option value="Sony">Sony</option>
                        <option value="Oppo">Oppo</option>
                        <option value="Vivo">Vivo</option>
                        <option value="Realme">Realme</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Số lượng tồn kho</label>
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="0"
                        value={currentProduct.stock || ''}
                        onChange={e => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value) })}
                        className="w-full rounded-lg border-gray-300 border px-4 py-2.5 text-gray-900 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Price Configuration */}
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                         <Zap className="w-4 h-4" /> Cấu hình giá
                     </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-xs font-semibold text-blue-700 mb-1">Giá gốc (Niêm yết)</label>
                        <input
                            type="number"
                            min="0"
                            step="1000"
                            placeholder="0"
                            value={currentProduct.originalPrice || ''}
                            onChange={e => setCurrentProduct({ ...currentProduct, originalPrice: parseFloat(e.target.value) })}
                            className="w-full rounded-lg border-blue-200 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                        />
                        </div>
                        <div>
                        <label className="block text-xs font-bold text-blue-700 mb-1">Giá bán (Khuyến mãi)</label>
                        <input
                            type="number"
                            min="0"
                            step="1000"
                            required
                            placeholder="0"
                            value={currentProduct.price || ''}
                            onChange={e => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })}
                            className="w-full rounded-lg border-blue-200 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition font-bold text-blue-700"
                        />
                        </div>
                    </div>
                  </div>
                  
                  {/* Promotion Configuration */}
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                     <h4 className="text-sm font-bold text-yellow-800 mb-3 flex items-center gap-2">
                         <Zap className="w-4 h-4" /> Ưu đãi thanh toán thêm
                     </h4>
                     <div className="grid grid-cols-2 gap-4 mb-3">
                         <div>
                            <label className="block text-xs font-semibold text-yellow-700 mb-1">Giảm thêm (VND)</label>
                            <input
                                type="number"
                                min="0"
                                step="1000"
                                placeholder="0"
                                value={currentProduct.discountAmount || ''}
                                onChange={e => setCurrentProduct({ ...currentProduct, discountAmount: parseFloat(e.target.value) })}
                                className="w-full rounded-lg border-yellow-200 border px-3 py-2 text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition"
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-semibold text-yellow-700 mb-1">Điều kiện áp dụng</label>
                            <select
                                value={currentProduct.discountCondition || 'all'}
                                onChange={e => setCurrentProduct({ ...currentProduct, discountCondition: e.target.value as any })}
                                className="w-full rounded-lg border-yellow-200 border px-3 py-2 text-sm bg-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition"
                            >
                                <option value="all">Tất cả hình thức</option>
                                <option value="banking">Chuyển khoản (Banking)</option>
                                <option value="cod">Tiền mặt (COD)</option>
                            </select>
                         </div>
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-yellow-700 mb-1">Mô tả ưu đãi (Hiển thị cho khách)</label>
                        <input
                            type="text"
                            placeholder="Ví dụ: Giảm 2 triệu khi thanh toán chuyển khoản"
                            value={currentProduct.promotion || ''}
                            onChange={e => setCurrentProduct({ ...currentProduct, promotion: e.target.value })}
                            className="w-full rounded-lg border-yellow-200 border px-3 py-2 text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition"
                        />
                     </div>
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Mô tả sản phẩm
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Mô tả chi tiết về sản phẩm..."
                      value={currentProduct.description || ''}
                      onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                      className="w-full rounded-lg border-gray-300 border px-4 py-2.5 text-gray-900 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition resize-y"
                    />
                  </div>

                  {/* Features Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                      <List className="w-4 h-4" /> Tính năng nổi bật (Mỗi dòng một tính năng)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ví dụ:&#10;Chip A17 Pro&#10;Camera 48MP"
                      value={(currentProduct.features as unknown as string) || ''}
                      onChange={e => setCurrentProduct({ ...currentProduct, features: e.target.value as unknown as string[] })}
                      className="w-full rounded-lg border-gray-300 border px-4 py-2.5 text-gray-900 focus:border-primary focus:ring-4 focus:ring-blue-500/10 outline-none transition resize-y font-mono text-sm"
                    />
                  </div>

                  <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 flex justify-end gap-3 mt-4 sticky bottom-0 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition"
                    >
                      {currentProduct.id ? 'Lưu thay đổi' : 'Tạo mới'}
                    </button>
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

export default AdminProducts;