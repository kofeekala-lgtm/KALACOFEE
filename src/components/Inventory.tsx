import React, { useState, useEffect } from 'react';
import { api, Ingredient, StockMovement, Product, RecipeItem, Unit } from '../lib/api';
import { Package, AlertTriangle, Edit2, Save, X, Plus, Trash2, History, ArrowUpRight, ArrowDownRight, ClipboardList, Utensils, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Inventory() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<{ stock: number; min_stock: number; supplier?: string }>({ stock: 0, min_stock: 0, supplier: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<RecipeItem[]>([]);
  
  const [isRestockMode, setIsRestockMode] = useState(false);
  const [restockValues, setRestockValues] = useState<{ [id: number]: number }>({});
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Coffee Beans',
    stock: 0,
    min_stock: 100,
    unit: 'g',
    supplier: ''
  });

  const [adjustmentData, setAdjustmentData] = useState({
    quantity: 0,
    type: 'IN' as 'IN' | 'OUT',
    reason: 'Koreksi Stok'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [ingredientsData, movementsData, productsData, unitsData] = await Promise.all([
        api.getIngredients(),
        api.getStockMovements(),
        api.getProducts(),
        api.getUnits()
      ]);
      setIngredients(ingredientsData);
      setMovements(movementsData);
      setProducts(productsData);
      setUnits(unitsData);
    };
    fetchData();
  }, []);

  const loadIngredients = () => {
    api.getIngredients().then(setIngredients);
  };

  const loadMovements = () => {
    api.getStockMovements().then(setMovements);
  };

  const handleEdit = (item: Ingredient) => {
    setEditingId(item.id);
    setEditValue({ stock: item.stock, min_stock: item.min_stock, supplier: item.supplier || '' });
  };

  const handleSave = async (id: number) => {
    await api.updateIngredient(id, editValue);
    setEditingId(null);
    loadIngredients();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus bahan ini?')) {
      await api.deleteIngredient(id);
      loadIngredients();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addIngredient(formData);
    setIsModalOpen(false);
    setFormData({ name: '', category: 'Coffee Beans', stock: 0, min_stock: 100, unit: units.length > 0 ? units[0].name : 'g', supplier: '' });
    loadIngredients();
  };

  const handleBulkRestock = async () => {
    if (Object.keys(restockValues).length === 0) {
      setIsRestockMode(false);
      return;
    }

    const promises = Object.entries(restockValues).map(([id, qty]) => {
      if (qty <= 0) return Promise.resolve();
      return api.adjustStock(parseInt(id), qty, 'IN', 'Restok Masal (Daftar Belanja)');
    });

    await Promise.all(promises);
    setRestockValues({});
    setIsRestockMode(false);
    loadIngredients();
    loadMovements();
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient) return;
    
    await api.adjustStock(
      selectedIngredient.id, 
      adjustmentData.quantity, 
      adjustmentData.type, 
      adjustmentData.reason
    );
    setIsAdjustModalOpen(false);
    setAdjustmentData({ quantity: 0, type: 'IN', reason: 'Koreksi Stok' });
    setSelectedIngredient(null);
    loadIngredients();
    loadMovements();
  };

  const handleOpenRecipe = async (product: Product) => {
    setSelectedProduct(product);
    const recipe = await api.getRecipe(product.id);
    setCurrentRecipe(recipe);
    setIsRecipeModalOpen(true);
  };

  const handleSaveRecipe = async () => {
    if (!selectedProduct) return;
    await api.updateRecipe(selectedProduct.id, currentRecipe.map(r => ({
      ingredient_id: r.ingredient_id,
      qty: r.qty
    })));
    setIsRecipeModalOpen(false);
  };

  const filteredIngredients = ingredients.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (i.category?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (i.supplier?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesLowStock = filterLowStock ? i.stock < i.min_stock : true;
    return matchesSearch && matchesLowStock;
  });

  const lowStockItems = ingredients.filter(i => i.stock < i.min_stock);
  const outOfStockItems = ingredients.filter(i => i.stock <= 0);

  // Group by category
  const categories = Array.from(new Set(ingredients.map(i => i.category || 'Lainnya')));

  return (
    <div className="space-y-4 md:space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-[#1E293B] tracking-tight mb-2">Gudang & Inventaris</h2>
          <p className="text-[#64748B] font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Pantau stok bahan baku secara real-time.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsRecipeModalOpen(true)} 
            className="px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#475569] rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Utensils size={18} />
            Kelola Resep (BOM)
          </button>
          <button 
            onClick={() => setIsHistoryModalOpen(true)} 
            className="px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#475569] rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <History size={18} />
            Riwayat
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="px-5 py-2.5 bg-[#1E293B] text-white rounded-2xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10"
          >
            <Plus size={18} />
            Bahan Baru
          </button>
        </div>
      </header>

      {/* Critical Alerts */}
      <AnimatePresence>
        {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {outOfStockItems.length > 0 && (
              <div className="bg-red-50 border border-red-100 p-3 md:p-5 rounded-3xl flex items-center gap-4">
                <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/20">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-red-900">Stok Habis!</h4>
                  <p className="text-xs text-red-700 font-medium">{outOfStockItems.length} bahan benar-benar habis. Segera belanja!</p>
                </div>
                <button 
                  onClick={() => { setFilterLowStock(true); setSearchQuery(''); }}
                  className="ml-auto px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
                >
                  Lihat Detail
                </button>
              </div>
            )}
            {lowStockItems.length > 0 && outOfStockItems.length === 0 && (
              <div className="bg-orange-50 border border-orange-100 p-5 rounded-3xl flex items-center gap-4">
                <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/20">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-orange-900">Peringatan Stok Rendah</h4>
                  <p className="text-xs text-orange-700 font-medium">{lowStockItems.length} bahan di bawah batas minimum.</p>
                </div>
                <button 
                  onClick={() => { setFilterLowStock(true); setSearchQuery(''); }}
                  className="ml-auto px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition-colors"
                >
                  Lihat
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-4 md:p-6 rounded-3xl border border-[#F1F5F9] shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl group-hover:bg-slate-100 transition-colors">
              <Package size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-0.5">Total Bahan</p>
              <p className="text-2xl font-black text-[#1E293B] leading-none">{ingredients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-3xl border border-[#F1F5F9] shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:bg-red-100 transition-colors font-bold">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-0.5">Stok Kritis</p>
              <p className="text-2xl font-black text-red-600 leading-none">{lowStockItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-3xl border border-[#F1F5F9] shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-100 transition-colors">
              <ClipboardList size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-0.5">Transaksi Stok</p>
              <p className="text-2xl font-black text-blue-600 leading-none">{movements.length}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsRestockMode(!isRestockMode)}
          className={`p-6 rounded-3xl border transition-all text-left group ${
            isRestockMode ? 'bg-[#1E293B] border-black text-white' : 'bg-white border-[#F1F5F9] hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl transition-colors ${
              isRestockMode ? 'bg-white/10 text-white' : 'bg-green-50 text-green-600'
            }`}>
              <Plus size={22} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isRestockMode ? 'text-white/60' : 'text-[#94A3B8]'}`}>Mode Belanja</p>
              <p className="text-sm font-black leading-none">{isRestockMode ? 'Selesaikan Input (ESC)' : 'Mulai Input Stok'}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Main Inventory Section */}
      <div className="bg-white rounded-[2.5rem] border border-[#F1F5F9] shadow-xl overflow-hidden relative">
        {/* Controls Header */}
        <div className="p-4 md:p-8 border-b border-[#F1F5F9] bg-[#F8FAFC]/50 backdrop-blur-sm sticky top-0 z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-[#1E293B]">
              {isRestockMode ? '📋 Input Stok Masal (Mode Belanja)' : 'Tingkat Stok Real-time'}
            </h3>
            {filterLowStock && (
              <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5">
                <AlertTriangle size={10} />
                Hanya Stok Rendah
              </span>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {!isRestockMode && (
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#1E293B] transition-colors" size={16} />
                <input 
                  type="text"
                  placeholder="Cari bahan atau kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-80 pl-11 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-2xl focus:ring-4 focus:ring-slate-100 focus:border-[#1E293B] outline-none transition-all text-sm font-medium"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setFilterLowStock(!filterLowStock)}
                className={`p-3 rounded-2xl transition-all border ${
                  filterLowStock 
                    ? 'bg-red-600 border-red-700 text-white shadow-lg shadow-red-600/20' 
                    : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
                }`}
                title="Hanya Stok Rendah"
              >
                <AlertTriangle size={20} />
              </button>
              
              {isRestockMode && (
                <button 
                  onClick={handleBulkRestock}
                  className="px-6 py-3 bg-[#1E293B] text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
                >
                  <Save size={18} />
                  Simpan Semua Stok
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#94A3B8] text-[10px] uppercase font-black tracking-[0.2em] border-b border-[#F1F5F9]">
                <th className="px-8 py-5">Bahan Baku</th>
                <th className="px-8 py-5">Info Supplier</th>
                <th className="px-8 py-5 text-right">Stok Saat Ini</th>
                {!isRestockMode && <th className="px-8 py-5 text-right">Stok Minimum</th>}
                {isRestockMode && <th className="px-8 py-5 text-right bg-slate-50">Tambah (+)</th>}
                {!isRestockMode && <th className="px-8 py-5">Status</th>}
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {categories.map(cat => {
                const catItems = filteredIngredients.filter(i => (i.category || 'Lainnya') === cat);
                if (catItems.length === 0) return null;

                return (
                  <React.Fragment key={cat}>
                    <tr className="bg-[#F8FAFC]/30">
                      <td colSpan={7} className="px-8 py-3 text-[10px] font-black text-[#64748B] uppercase tracking-widest bg-slate-50/50 border-y border-[#F1F5F9]">
                        📂 {cat}
                      </td>
                    </tr>
                    {catItems.map(item => (
                      <tr key={item.id} className={`group hover:bg-slate-50/50 transition-all ${item.stock < item.min_stock ? 'bg-red-50/20' : ''}`}>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                              item.stock <= 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {item.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-[#1E293B] text-sm">{item.name}</p>
                              <p className="text-[10px] text-[#94A3B8] font-bold uppercase">{item.unit}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          {editingId === item.id ? (
                            <input 
                              type="text" 
                              className="w-full px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium outline-none focus:border-[#1E293B]" 
                              value={editValue.supplier}
                              onChange={e => setEditValue({ ...editValue, supplier: e.target.value })}
                            />
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-[#475569]">{item.supplier || 'Internal'}</span>
                              <span className="text-[10px] text-[#94A3B8]">Vendor Utama</span>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          {editingId === item.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <input 
                                type="number" 
                                className="w-24 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold text-right outline-none focus:border-[#1E293B]" 
                                value={editValue.stock}
                                onChange={e => setEditValue({ ...editValue, stock: parseInt(e.target.value) })}
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span className={`text-sm font-black mono ${
                                item.stock <= 0 ? 'text-red-600 animate-pulse' : 
                                item.stock < item.min_stock ? 'text-orange-600' : 'text-[#1E293B]'
                              }`}>
                                {item.stock.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-[#94A3B8] font-bold uppercase">{item.unit}</span>
                            </div>
                          )}
                        </td>
                        {!isRestockMode && (
                          <td className="px-8 py-5 text-right">
                            {editingId === item.id ? (
                              <input 
                                type="number" 
                                className="w-24 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold text-right outline-none focus:border-[#1E293B]" 
                                value={editValue.min_stock}
                                onChange={e => setEditValue({ ...editValue, min_stock: parseInt(e.target.value) })}
                              />
                            ) : (
                              <span className="text-xs font-bold text-[#64748B]">{item.min_stock.toLocaleString()}</span>
                            )}
                          </td>
                        )}
                        {isRestockMode && (
                          <td className="px-8 py-5 text-right bg-slate-50/50">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[10px] font-bold text-green-600">+</span>
                              <input 
                                type="number" 
                                placeholder="0"
                                className="w-20 px-3 py-1.5 bg-white border-2 border-green-100 rounded-xl text-xs font-black text-right text-green-700 outline-none focus:border-green-500 shadow-sm transition-all"
                                value={restockValues[item.id] || ''}
                                onChange={e => setRestockValues({ ...restockValues, [item.id]: Math.abs(parseInt(e.target.value) || 0) })}
                              />
                            </div>
                          </td>
                        )}
                        {!isRestockMode && (
                          <td className="px-8 py-5">
                            {item.stock <= 0 ? (
                              <span className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-lg shadow-red-600/20">
                                Habis
                              </span>
                            ) : item.stock < item.min_stock ? (
                              <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                Rendah
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-wider border border-green-100">
                                Aman
                              </span>
                            )}
                          </td>
                        )}
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {editingId === item.id ? (
                              <>
                                <button onClick={() => handleSave(item.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-xl" title="Simpan">
                                  <Save size={16} />
                                </button>
                                <button onClick={() => setEditingId(null)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Batal">
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    setSelectedIngredient(item);
                                    setIsAdjustModalOpen(true);
                                  }} 
                                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-xl"
                                  title="Sesuaikan"
                                >
                                  <ClipboardList size={16} />
                                </button>
                                <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl" title="Edit">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Hapus">
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Ingredient Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#E8E1D9] flex items-center justify-between">
                <h3 className="text-xl font-bold">Tambah Bahan Baru</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#F5F1ED] rounded-lg">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Nama Bahan</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Kategori</label>
                    <select 
                      className="form-input"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Coffee Beans">Coffee Beans</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Syrup & Sauce">Syrup & Sauce</option>
                      <option value="Powder">Powder</option>
                      <option value="Packaging">Packaging</option>
                      <option value="Topping">Topping</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Supplier</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Nama Supplier (Opsional)"
                    value={formData.supplier}
                    onChange={e => setFormData({...formData, supplier: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Stok Awal</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Stok Minimum</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.min_stock}
                      onChange={e => setFormData({...formData, min_stock: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Satuan</label>
                    <select 
                      className="form-input"
                      value={formData.unit}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                    >
                      {units.map(u => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                      {units.length === 0 && (
                        <>
                          <option value="g">Gram (g)</option>
                          <option value="ml">Mililiter (ml)</option>
                          <option value="pcs">Buah (pcs)</option>
                          <option value="kg">Kilogram (kg)</option>
                          <option value="L">Liter (L)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn btn-outline">Batal</button>
                  <button type="submit" className="flex-1 btn btn-primary">Simpan Bahan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Adjust Stock Modal */}
      <AnimatePresence>
        {isAdjustModalOpen && selectedIngredient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#E8E1D9] flex items-center justify-between bg-orange-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Sesuaikan Stok</h3>
                    <p className="text-xs text-[#8C7B6E]">{selectedIngredient.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsAdjustModalOpen(false)} className="p-2 hover:bg-orange-100/50 rounded-lg">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
                <div className="p-4 bg-[#FDFCFB] rounded-2xl border border-[#E8E1D9] flex justify-between items-center">
                  <span className="text-sm text-[#8C7B6E]">Stok Saat Ini</span>
                  <span className="font-bold text-lg">{selectedIngredient.stock.toLocaleString()} {selectedIngredient.unit}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Tipe</label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setAdjustmentData({ ...adjustmentData, type: 'IN' })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          adjustmentData.type === 'IN' 
                            ? 'bg-green-50 border-green-200 text-green-600' 
                            : 'bg-white border-[#E8E1D9] text-[#8C7B6E]'
                        }`}
                      >
                        MASUK (+)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAdjustmentData({ ...adjustmentData, type: 'OUT' })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          adjustmentData.type === 'OUT' 
                            ? 'bg-red-50 border-red-200 text-red-600' 
                            : 'bg-white border-[#E8E1D9] text-[#8C7B6E]'
                        }`}
                      >
                        KELUAR (-)
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Jumlah</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="0"
                      value={adjustmentData.quantity}
                      onChange={e => setAdjustmentData({...adjustmentData, quantity: Math.abs(parseInt(e.target.value) || 0)})}
                      required
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#F5F1ED] rounded-xl text-center">
                  <p className="text-[10px] text-[#8C7B6E] uppercase tracking-wider font-bold">Estimasi Stok Baru</p>
                  <p className="text-lg font-bold text-[#6F4E37]">
                    {adjustmentData.type === 'IN' 
                      ? (selectedIngredient.stock + adjustmentData.quantity).toLocaleString()
                      : (selectedIngredient.stock - adjustmentData.quantity).toLocaleString()
                    } {selectedIngredient.unit}
                  </p>
                </div>

                <div>
                  <label className="form-label">Alasan</label>
                  <select 
                    className="form-input"
                    value={adjustmentData.reason}
                    onChange={e => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                    required
                  >
                    <option value="Koreksi Stok">Koreksi Stok</option>
                    <option value="Tumpahan">Tumpahan</option>
                    <option value="Limbah">Limbah</option>
                    <option value="Barang Rusak">Barang Rusak</option>
                    <option value="Stok Ulang">Stok Ulang</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="flex-1 btn btn-outline">Batal</button>
                  <button type="submit" className="flex-1 btn btn-primary bg-orange-600 hover:bg-orange-700 shadow-orange-600/20">
                    Terapkan Penyesuaian
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#E8E1D9] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F5F1ED] text-[#6F4E37] rounded-xl">
                    <History size={20} />
                  </div>
                  <h3 className="text-xl font-bold">Riwayat Pergerakan Stok</h3>
                </div>
                <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 hover:bg-[#F5F1ED] rounded-lg">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {movements.length === 0 ? (
                  <div className="text-center py-12 text-[#8C7B6E]">
                    <History size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Belum ada pergerakan stok yang tercatat.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {movements.slice().reverse().map(move => (
                      <div key={move.id} className="p-4 bg-[#FDFCFB] rounded-2xl border border-[#E8E1D9] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl ${move.type === 'IN' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {move.type === 'IN' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                          </div>
                          <div>
                            <p className="font-bold text-[#6F4E37]">{move.ingredient_name}</p>
                            <p className="text-xs text-[#8C7B6E] leading-relaxed">
                              {move.reason}
                              {move.reference && <span className="block text-[10px] font-bold text-blue-600 uppercase mt-0.5">{move.reference}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${move.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                            {move.type === 'IN' ? '+' : '-'}{move.quantity.toLocaleString()}
                          </div>
                          <p className="text-[10px] text-[#8C7B6E]">{new Date(move.created_at).toLocaleDateString()} {new Date(move.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-[#FDFCFB] border-t border-[#E8E1D9]">
                <button onClick={() => setIsHistoryModalOpen(false)} className="w-full btn btn-outline">Tutup Riwayat</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recipe Management Modal */}
      <AnimatePresence>
        {isRecipeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-[#E8E1D9] flex items-center justify-between bg-orange-50/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                    <Utensils size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Manajemen Resep (BOM)</h3>
                    <p className="text-xs text-[#8C7B6E]">Tentukan bahan baku untuk setiap menu</p>
                  </div>
                </div>
                <button onClick={() => setIsRecipeModalOpen(false)} className="p-2 hover:bg-orange-100/50 rounded-lg">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Product List */}
                <div className="w-full md:w-1/3 border-r border-[#E8E1D9] flex flex-col">
                  <div className="p-4 border-b border-[#E8E1D9]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7B6E]" size={14} />
                      <input 
                        type="text" 
                        placeholder="Cari menu..." 
                        className="w-full pl-9 pr-4 py-2 text-xs bg-[#FDFCFB] border border-[#E8E1D9] rounded-xl outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {products.map(product => (
                      <button
                        key={product.id}
                        onClick={() => handleOpenRecipe(product)}
                        className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                          selectedProduct?.id === product.id 
                            ? 'bg-[#6F4E37] text-white shadow-lg shadow-[#6F4E37]/20' 
                            : 'hover:bg-[#F5F1ED] text-[#6F4E37]'
                        }`}
                      >
                        <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/10" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{product.name}</p>
                          <p className={`text-[10px] ${selectedProduct?.id === product.id ? 'text-white/60' : 'text-[#8C7B6E]'}`}>
                            Rp {product.price.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipe Editor */}
                <div className="flex-1 flex flex-col bg-[#FDFCFB]">
                  {selectedProduct ? (
                    <>
                      <div className="p-6 border-b border-[#E8E1D9] bg-white">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-[#6F4E37]">Resep: {selectedProduct.name}</h4>
                          <button 
                            onClick={() => {
                              setCurrentRecipe([...currentRecipe, { ingredient_id: ingredients[0].id, ingredient_name: ingredients[0].name, qty: 0, unit: ingredients[0].unit }]);
                            }}
                            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                          >
                            <Plus size={14} /> Tambah Bahan
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {currentRecipe.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-[#E8E1D9] rounded-2xl">
                              <p className="text-sm text-[#8C7B6E]">Belum ada bahan yang ditambahkan.</p>
                            </div>
                          ) : (
                            currentRecipe.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <select 
                                  className="flex-1 p-2 text-sm bg-white border border-[#E8E1D9] rounded-xl outline-none"
                                  value={item.ingredient_id}
                                  onChange={e => {
                                    const ing = ingredients.find(i => i.id === parseInt(e.target.value));
                                    const newRecipe = [...currentRecipe];
                                    newRecipe[idx] = { ...newRecipe[idx], ingredient_id: ing!.id, ingredient_name: ing!.name, unit: ing!.unit };
                                    setCurrentRecipe(newRecipe);
                                  }}
                                >
                                  {ingredients.map(ing => (
                                    <option key={ing.id} value={ing.id}>{ing.name}</option>
                                  ))}
                                </select>
                                <div className="flex items-center gap-2 w-32">
                                  <input 
                                    type="number" 
                                    className="w-full p-2 text-sm bg-white border border-[#E8E1D9] rounded-xl outline-none text-center"
                                    value={item.qty}
                                    onChange={e => {
                                      const newRecipe = [...currentRecipe];
                                      newRecipe[idx].qty = parseFloat(e.target.value) || 0;
                                      setCurrentRecipe(newRecipe);
                                    }}
                                  />
                                  <span className="text-xs text-[#8C7B6E] w-8">{item.unit}</span>
                                </div>
                                <button 
                                  onClick={() => {
                                    const newRecipe = currentRecipe.filter((_, i) => i !== idx);
                                    setCurrentRecipe(newRecipe);
                                  }}
                                  className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="p-6 mt-auto">
                        <button 
                          onClick={handleSaveRecipe}
                          className="w-full btn btn-primary flex items-center justify-center gap-2"
                        >
                          <Save size={20} />
                          Simpan Resep
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#8C7B6E] p-12 text-center">
                      <Utensils size={64} className="mb-4 opacity-10" />
                      <p className="font-medium">Pilih menu di sebelah kiri untuk mengelola resepnya.</p>
                      <p className="text-xs mt-2">Setiap bahan yang Anda masukkan di sini akan otomatis berkurang setiap kali menu ini terjual.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
