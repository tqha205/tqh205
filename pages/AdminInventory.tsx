
import React, { useEffect, useState } from 'react';
import { api, formatCurrency } from '../services/realApi';
import { Product, Supplier, StockReceiptDetail, InventoryLog } from '../types';
import { 
  Plus, Trash2, ClipboardList, ShoppingCart, 
  CheckCircle2, AlertCircle, ScanBarcode, X, Search, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminInventory: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'history'>('import');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [exportReason, setExportReason] = useState('Xuất bán lẻ');
  
  const [receiptItems, setReceiptItems] = useState<StockReceiptDetail[]>([]);
  const [imeiEditingItem, setImeiEditingItem] = useState<string | null>(null);
  const [tempImeis, setTempImeis] = useState<string[]>([]);
  const [imeiInput, setImeiInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, s, l] = await Promise.all([
        api.getProducts(),
        api.getSuppliers(),
        api.getInventoryLogs().catch(() => []) // Handle if logs table not ready
      ]);
      setProducts(p);
      setSuppliers(s);
      setLogs(l);
    } catch (err) {
      console.error("Database connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (product: Product) => {
    if (receiptItems.some(i => i.productId === product.id)) return;
    setReceiptItems([...receiptItems, { 
        productId: product.id, 
        productName: product.name, 
        quantity: 1, 
        unitPrice: product.originalPrice || product.price,
        imeis: []
    }]);
  };

  const updateQuantity = (id: string, qty: number) => {
    setReceiptItems(receiptItems.map(i => i.productId === id ? { ...i, quantity: Math.max(1, qty) } : i));
  };

  const saveImeis = () => {
    if (imeiEditingItem) {
      setReceiptItems(receiptItems.map(i => i.productId === imeiEditingItem ? { ...i, imeis: tempImeis } : i));
      setImeiEditingItem(null);
    }
  };

  const handleSubmit = async () => {
    if (receiptItems.length === 0) return setNotification({ msg: 'Chưa có sản phẩm', type: 'error' });
    if (activeTab === 'import' && !selectedSupplier) return setNotification({ msg: 'Vui lòng chọn nhà cung cấp', type: 'error' });

    setLoading(true);
    try {
      const userName = user?.name || 'Admin';
      const supplierName = suppliers.find(s => s.id === selectedSupplier)?.name || '';
      
      for (const item of receiptItems) {
          const reason = activeTab === 'import' ? `Nhập từ ${supplierName}` : exportReason;
          await api.adjustStock(item.productId, item.quantity, activeTab as any, reason, userName, supplierName, item.imeis);
      }

      setNotification({ msg: 'Giao dịch thành công!', type: 'success' });
      setReceiptItems([]);
      loadData();
      setTimeout(() => setActiveTab('history'), 1000);
    } catch (err: any) {
      setNotification({ msg: err.message, type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2"><ClipboardList className="text-primary" /> Quản lý Kho</h1>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {['import', 'export', 'history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === tab ? 'bg-white text-primary shadow' : 'text-gray-500'}`}>
              {tab === 'import' ? 'Nhập kho' : tab === 'export' ? 'Xuất kho' : 'Lịch sử'}
            </button>
          ))}
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in border ${notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold">{notification.msg}</span>
        </div>
      )}

      {activeTab === 'history' ? (
         <div className="space-y-4">
            {logs.length > 0 ? logs.map(log => (
                <div key={log.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                        <img src={log.productImage} className="w-12 h-12 rounded-lg object-cover border" />
                        <div>
                            <p className="font-bold text-gray-900">{log.productName}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(log.date).toLocaleString('vi-VN')}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-lg font-black ${log.type === 'import' ? 'text-blue-600' : 'text-red-600'}`}>
                            {log.type === 'import' ? '+' : '-'}{log.quantity}
                        </p>
                        <span className="text-[10px] font-bold uppercase text-gray-400">{log.reason}</span>
                    </div>
                </div>
            )) : (
                <div className="py-20 text-center text-gray-400">Chưa có lịch sử giao dịch</div>
            )}
         </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
             <div className="relative mb-6">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Tìm sản phẩm..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-xl outline-none" onChange={e => setSearchTerm(e.target.value)} />
             </div>
             <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                   <div key={p.id} onClick={() => addItem(p)} className="flex items-center justify-between p-3 border rounded-xl hover:bg-blue-50 cursor-pointer transition">
                      <div className="flex items-center gap-3">
                          <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                          <div><p className="text-sm font-bold">{p.name}</p><p className="text-[10px] text-gray-400">Tồn: {p.stock}</p></div>
                      </div>
                      <Plus className="w-4 h-4 text-gray-300" />
                   </div>
                ))}
             </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col">
              <div className="p-6 bg-gray-50/50 border-b flex gap-4">
                  {activeTab === 'import' ? (
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nhà cung cấp</label>
                        <select className="w-full p-2 border rounded-lg font-bold outline-none" value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}>
                            <option value="">-- Chọn NCC --</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                  ) : (
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Lý do xuất</label>
                        <select className="w-full p-2 border rounded-lg font-bold outline-none" value={exportReason} onChange={e => setExportReason(e.target.value)}>
                            <option>Xuất bán lẻ</option>
                            <option>Xuất trả hàng</option>
                            <option>Điều chuyển</option>
                        </select>
                    </div>
                  )}
              </div>

              <div className="p-6 min-h-[300px]">
                  {receiptItems.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="border-b text-left text-gray-400 text-xs font-bold">
                            <tr><th className="pb-3">Sản phẩm</th><th className="pb-3 text-center">SL</th><th className="pb-3 text-center">IMEI</th><th className="pb-3"></th></tr>
                        </thead>
                        <tbody className="divide-y">
                            {receiptItems.map(item => (
                                <tr key={item.productId}>
                                    <td className="py-4 font-bold">{item.productName}</td>
                                    <td className="py-4 text-center">
                                        <input type="number" className="w-12 border text-center rounded p-1" value={item.quantity} onChange={e => updateQuantity(item.productId, parseInt(e.target.value))} />
                                    </td>
                                    <td className="py-4 text-center">
                                        <button onClick={() => { setImeiEditingItem(item.productId); setTempImeis(item.imeis || []); }} className={`px-2 py-1 rounded text-xs font-bold border ${item.imeis?.length ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                            {item.imeis?.length || 0} mã
                                        </button>
                                    </td>
                                    <td className="py-4 text-right"><button onClick={() => setReceiptItems(receiptItems.filter(i => i.productId !== item.productId))} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  ) : (
                    <div className="py-20 text-center"><ShoppingCart className="w-12 h-12 mx-auto text-gray-200 mb-2" /><p className="text-gray-400 font-bold">Thêm sản phẩm để bắt đầu</p></div>
                  )}
              </div>

              <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
                  <div className="text-2xl font-black">{receiptItems.length} <span className="text-xs text-gray-400 font-normal">mặt hàng</span></div>
                  <button disabled={loading} onClick={handleSubmit} className="px-8 py-3 bg-primary rounded-xl font-bold hover:bg-blue-600 transition disabled:opacity-50">
                    {loading ? 'Đang lưu...' : 'Xác nhận giao dịch'}
                  </button>
              </div>
          </div>
        </div>
      )}

      {imeiEditingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ScanBarcode /> Nhập IMEI</h3>
                <div className="flex gap-2 mb-4">
                    <input type="text" placeholder="Nhập mã..." className="flex-1 p-2 border rounded-lg outline-none" value={imeiInput} onChange={e => setImeiInput(e.target.value)} onKeyDown={e => {
                        if (e.key === 'Enter' && imeiInput.trim()) { setTempImeis([...tempImeis, imeiInput.trim()]); setImeiInput(''); }
                    }} />
                    <button onClick={() => { if(imeiInput.trim()) { setTempImeis([...tempImeis, imeiInput.trim()]); setImeiInput(''); } }} className="bg-primary text-white px-4 rounded-lg font-bold">Thêm</button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 mb-6">
                    {tempImeis.map((imei, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border text-sm">
                            <span className="font-mono">{imei}</span>
                            <button onClick={() => setTempImeis(tempImeis.filter(i => i !== imei))} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setImeiEditingItem(null)} className="flex-1 py-2 rounded-lg bg-gray-100 font-bold">Hủy</button>
                    <button onClick={saveImeis} className="flex-1 py-2 rounded-lg bg-gray-900 text-white font-bold">Lưu {tempImeis.length} mã</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
