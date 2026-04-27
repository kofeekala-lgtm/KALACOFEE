import React, { useState, useEffect } from 'react';
import { api, FinancialTransaction, FinancialSummary, IngredientPurchase, Ingredient, FinanceCategory, CafeProfile } from '../lib/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';
import { 
  Wallet, 
  CreditCard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  History, 
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Finance() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [purchases, setPurchases] = useState<IngredientPurchase[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [financeCategories, setFinanceCategories] = useState<FinanceCategory[]>([]);
  const [profile, setProfile] = useState<CafeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'purchases' | 'reports'>('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [reportTransactions, setReportTransactions] = useState<FinancialTransaction[]>([]);

  // Laporan Umum states
  const [reportStartDate, setReportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [reportEndDate, setReportEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [formData, setFormData] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    category: 'Operasional' as any,
    amount: 0,
    payment_method: 'Tunai' as 'Tunai' | 'Transfer Bank',
    description: ''
  });

  const [purchaseData, setPurchaseData] = useState({
    ingredient_id: 0,
    qty: 0,
    price_per_unit: 0,
    supplier: ''
  });

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, sData, pData, iData, fcData, profData] = await Promise.all([
        api.getFinancialTransactions(100), // Batasi 100 transaksi terbaru untuk tabel utama
        api.getFinancialSummary(),
        api.getIngredientPurchases(),
        api.getIngredients(),
        api.getFinanceCategories(),
        api.getCafeProfile()
      ]);
      setTransactions(tData);
      setSummary(sData);
      setPurchases(pData);
      setIngredients(iData);
      setFinanceCategories(fcData);
      setProfile(profData);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addFinancialTransaction(formData);
      setIsModalOpen(false);
      setFormData({
        type: 'EXPENSE',
        category: 'Operasional',
        amount: 0,
        payment_method: 'Tunai',
        description: ''
      });
      loadData();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ingredient = ingredients.find(i => i.id === purchaseData.ingredient_id);
    if (!ingredient) return;

    try {
      await api.addIngredientPurchase({
        ingredient_id: purchaseData.ingredient_id,
        ingredient_name: ingredient.name,
        qty: purchaseData.qty,
        unit: ingredient.unit,
        price_per_unit: purchaseData.price_per_unit,
        total_price: purchaseData.qty * purchaseData.price_per_unit,
        supplier: purchaseData.supplier || ingredient.supplier || 'Unknown'
      });
      setIsPurchaseModalOpen(false);
      setPurchaseData({
        ingredient_id: 0,
        qty: 0,
        price_per_unit: 0,
        supplier: ''
      });
      loadData();
    } catch (error) {
      console.error('Error adding purchase:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
    
    let matchesDate = true;
    if (filterDate) {
      const transactionDate = new Date(t.created_at).toISOString().split('T')[0];
      matchesDate = transactionDate === filterDate;
    }

    return matchesSearch && matchesType && matchesCategory && matchesDate;
  });

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (filterDate) {
      const purchaseDate = new Date(p.created_at).toISOString().split('T')[0];
      matchesDate = purchaseDate === filterDate;
    }

    return matchesSearch && matchesDate;
  });

  // Fetch Report Data when dates change
  useEffect(() => {
    if (activeTab === 'reports') {
      api.getFinancialTransactions(9999, reportStartDate, reportEndDate).then(setReportTransactions);
    }
  }, [reportStartDate, reportEndDate, activeTab]);

  // Use reportTransactions instead of filtering the limited transactions list

  const reportIncome = reportTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
  const reportExpense = reportTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);
  const reportNetProfit = reportIncome - reportExpense;

  // Categories stats
  const incomeStats = reportTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const expenseStats = reportTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const topIncomeCategories = Object.entries(incomeStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topExpenseCategories = Object.entries(expenseStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Daily flow report
  const dailyReportMap = reportTransactions.reduce((acc, t) => {
    const date = new Date(t.created_at).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = { income: 0, expense: 0 };
    if (t.type === 'INCOME') acc[date].income += Number(t.amount);
    else acc[date].expense += Number(t.amount);
    return acc;
  }, {} as Record<string, { income: number, expense: number }>);

  const dailyReport = Object.entries(dailyReportMap)
    .sort(([a], [b]) => b.localeCompare(a));

  const handleCategoryClick = (categoryName: string, type: 'INCOME' | 'EXPENSE') => {
    // Tetap di tab laporan (reports)
    setFilterType(type);
    setFilterCategory(categoryName);
    // Scroll ke tabel rincian di bawah
    const tableElement = document.getElementById('rincian-transaksi-report');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const setQuickFilter = (period: 'today' | 'week' | 'month') => {
    const end = new Date();
    const start = new Date();
    if (period === 'today') {
      // Start is already today
    } else if (period === 'week') {
      start.setDate(end.getDate() - 7);
    } else if (period === 'month') {
      start.setMonth(end.getMonth() - 1);
    }
    setReportStartDate(start.toISOString().split('T')[0]);
    setReportEndDate(end.toISOString().split('T')[0]);
  };

  const chartData = [...dailyReport].reverse().map(([date, data]) => ({
    name: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    pemasukan: data.income,
    pengeluaran: data.expense,
    profit: data.income - data.expense
  }));

  const pieData = Object.entries(expenseStats).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#6F4E37', '#8C7B6E', '#3C2A21', '#D4A373', '#FAEDCD'];
  const PAYMENT_COLORS = ['#10B981', '#3B82F6'];

  const paymentStats = reportTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => {
      acc[t.payment_method] = (acc[t.payment_method] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const handleExport = (format: 'PDF' | 'CSV') => {
    alert(`Mempersiapkan laporan ${format}... \nLaporan periode ${reportStartDate} hingga ${reportEndDate} sedang dibuat.`);
    // Logika pengunduhan real bisa ditambahkan di sini menggunakan library seperti jspdf atau papaparse
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6F4E37]"></div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-8 max-w-7xl mx-auto space-y-4 md:space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-[#3C2A21]">Keuangan</h1>
          <p className="text-[#8C7B6E]">Kelola arus kas, bank, dan pengeluaran operasional</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsPurchaseModalOpen(true)}
            className="flex items-center gap-2 bg-[#8C7B6E] text-white px-4 py-2 rounded-xl hover:bg-[#6F4E37] transition-colors shadow-sm"
          >
            <ShoppingBag size={20} />
            <span>Beli Bahan</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#6F4E37] text-white px-4 py-2 rounded-xl hover:bg-[#3C2A21] transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Transaksi Baru</span>
          </button>
        </div>
      </div>

      {/* Laporan Umum */}
      <div className="space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#3C2A21]">Laporan Umum</h2>
            <p className="text-xs text-[#8C7B6E]">Ringkasan performa finansial bisnis Anda.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Filters */}
            <div className="flex bg-white p-1 rounded-xl border border-[#F5F2ED] shadow-sm">
              <button onClick={() => setQuickFilter('today')} className="px-3 py-1.5 text-xs font-bold text-[#6F4E37] hover:bg-[#FDFCFB] rounded-lg transition-colors">Hari Ini</button>
              <button onClick={() => setQuickFilter('week')} className="px-3 py-1.5 text-xs font-bold text-[#6F4E37] hover:bg-[#FDFCFB] rounded-lg transition-colors">7 Hari</button>
              <button onClick={() => setQuickFilter('month')} className="px-3 py-1.5 text-xs font-bold text-[#6F4E37] hover:bg-[#FDFCFB] rounded-lg transition-colors">30 Hari</button>
            </div>
            
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#F5F2ED] shadow-sm">
              <Calendar size={18} className="text-[#8C7B6E]" />
              <input 
                type="date" 
                className="bg-transparent border-none text-xs font-bold focus:ring-0 outline-none text-[#3C2A21]"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
              />
              <span className="text-[#8C7B6E]">-</span>
              <input 
                type="date" 
                className="bg-transparent border-none text-xs font-bold focus:ring-0 outline-none text-[#3C2A21]"
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Summary Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-[#F5F2ED] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <CreditCard size={48} className="text-[#6F4E37]" />
            </div>
            <div className="flex items-center gap-3 mb-2 md:mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <CreditCard size={18} />
              </div>
              <span className="text-xs md:sm font-medium text-[#8C7B6E]">Saldo Bank</span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-[#3C2A21]">
              {formatCurrency(summary?.bank_balance || 0)}
            </div>
            <div className="mt-2 text-xs text-blue-600 font-medium truncate">
              {profile?.bank_accounts && profile.bank_accounts.length > 0 
                ? profile.bank_accounts.map(acc => `${acc.bank_name}: ${acc.account_number}`).join(' | ')
                : 'BCA & Mandiri'}
            </div>
          </motion.div>

          {/* ... other cards remain similar, just ensuring they match color scheme ... */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-[#F5F2ED] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Wallet size={48} className="text-[#6F4E37]" />
            </div>
            <div className="flex items-center gap-3 mb-2 md:mb-4">
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <Wallet size={18} />
              </div>
              <span className="text-xs md:sm font-medium text-[#8C7B6E]">Saldo Tunai</span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-[#3C2A21]">
              {formatCurrency(summary?.cash_balance || 0)}
            </div>
            <div className="mt-2 text-xs text-green-600 font-medium">Kas di Kasir</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#6F4E37] p-4 md:p-6 rounded-3xl shadow-md border-none relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingUp size={48} className="text-white" />
            </div>
            <div className="flex items-center gap-3 mb-2 md:mb-4 text-white/80">
              <div className="p-2 bg-white/20 rounded-lg text-white">
                <ArrowUpCircle size={18} />
              </div>
              <span className="text-xs md:sm font-medium">Total Pemasukan</span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-white">
              {formatCurrency(reportIncome)}
            </div>
            <div className="mt-2 text-xs text-white/60">Margin: {reportIncome > 0 ? ((reportNetProfit / reportIncome) * 100).toFixed(1) : 0}%</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-[#F5F2ED] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingDown size={48} className="text-red-300" />
            </div>
            <div className="flex items-center gap-3 mb-2 md:mb-4">
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <ArrowDownCircle size={18} />
              </div>
              <span className="text-xs md:sm font-medium text-[#8C7B6E]">Total Pengeluaran</span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-red-600">
              {formatCurrency(reportExpense)}
            </div>
            <div className="mt-2 text-xs text-[#8C7B6E]">Laba Bersih: <span className={reportNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(reportNetProfit)}</span></div>
          </motion.div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#F5F2ED] overflow-hidden">
        <div className="p-4 border-b border-[#F5F2ED] flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex bg-[#FDFCFB] p-1 rounded-xl w-fit">
              <button 
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'transactions' ? 'bg-white text-[#6F4E37] shadow-sm' : 'text-[#8C7B6E] hover:text-[#6F4E37]'}`}
              >
                Transaksi
              </button>
              <button 
                onClick={() => setActiveTab('purchases')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'purchases' ? 'bg-white text-[#6F4E37] shadow-sm' : 'text-[#8C7B6E] hover:text-[#6F4E37]'}`}
              >
                Bahan Baku
              </button>
              <button 
                onClick={() => setActiveTab('reports')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-white text-[#6F4E37] shadow-sm' : 'text-[#8C7B6E] hover:text-[#6F4E37]'}`}
              >
                Visual Laporan
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7B6E]" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari..." 
                  className="w-48 pl-10 pr-4 py-2 bg-[#FDFCFB] border-none rounded-xl text-xs focus:ring-2 focus:ring-[#6F4E37] transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-[#6F4E37] text-white' : 'bg-[#FDFCFB] text-[#8C7B6E] hover:bg-[#F5F2ED]'}`}
              >
                <Filter size={18} />
              </button>
              <button 
                onClick={() => handleExport('PDF')}
                className="flex items-center gap-2 bg-[#FDFCFB] text-[#6F4E37] border border-[#F5F2ED] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#F5F1ED] transition-all"
              >
                <Download size={16} />
                Ekspor PDF
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-[#F5F2ED] grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#8C7B6E] mb-1">Filter Tanggal Spesifik</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 bg-[#FDFCFB] border border-[#F5F2ED] rounded-lg text-sm focus:ring-2 focus:ring-[#6F4E37] outline-none"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                  </div>
                  {activeTab === 'transactions' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#8C7B6E] mb-1">Tipe Transaksi</label>
                        <select 
                          className="w-full px-3 py-2 bg-[#FDFCFB] border border-[#F5F2ED] rounded-lg text-sm focus:ring-2 focus:ring-[#6F4E37] outline-none"
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                        >
                          <option value="ALL">Semua Tipe</option>
                          <option value="INCOME">Pemasukan</option>
                          <option value="EXPENSE">Pengeluaran</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#8C7B6E] mb-1">Kategori Keuangan</label>
                        <select 
                          className="w-full px-3 py-2 bg-[#FDFCFB] border border-[#F5F2ED] rounded-lg text-sm focus:ring-2 focus:ring-[#6F4E37] outline-none"
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                        >
                          <option value="ALL">Semua Kategori</option>
                          {financeCategories.filter(fc => filterType === 'ALL' || fc.type === filterType).map(fc => (
                            <option key={fc.id} value={fc.name}>{fc.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {activeTab === 'transactions' && (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FDFCFB] text-[#8C7B6E] text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Waktu</th>
                  <th className="px-6 py-4 font-bold">Kategori</th>
                  <th className="px-6 py-4 font-bold">Deskripsi</th>
                  <th className="px-6 py-4 font-bold">Sistem Pembayaran</th>
                  <th className="px-6 py-4 font-bold">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2ED]">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#FDFCFB] transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[#3C2A21]">
                        {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-[10px] text-[#8C7B6E] uppercase">
                        {new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        t.category === 'Penjualan' ? 'bg-green-100 text-green-700' : 
                        t.category === 'Pembelian Bahan' ? 'bg-orange-100 text-orange-700' :
                        'bg-[#F5F1ED] text-[#6F4E37]'
                      }`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#3C2A21] font-medium">{t.description}</div>
                      {t.reference_id && <div className="text-[10px] text-[#8C7B6E]">Order: {t.reference_id}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-[#8C7B6E] font-medium">
                        {t.payment_method === 'Tunai' ? <Wallet size={14} /> : <CreditCard size={14} />}
                        {t.payment_method}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                        {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {activeTab === 'purchases' && (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FDFCFB] text-[#8C7B6E] text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Tanggal</th>
                  <th className="px-6 py-4 font-bold">Bahan Baku</th>
                  <th className="px-6 py-4 font-bold">Penyedia (Supplier)</th>
                  <th className="px-6 py-4 font-bold">Kuantitas</th>
                  <th className="px-6 py-4 font-bold">Harga</th>
                  <th className="px-6 py-4 font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2ED]">
                {filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FDFCFB]">
                    <td className="px-6 py-4 text-sm font-medium text-[#3C2A21]">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-[#3C2A21]">{p.ingredient_name}</td>
                    <td className="px-6 py-4 text-sm text-[#8C7B6E]">{p.supplier}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-[#F5F2ED] rounded-lg text-xs font-bold">{p.qty} {p.unit}</span></td>
                    <td className="px-6 py-4 text-sm font-medium text-[#3C2A21]">{formatCurrency(p.price_per_unit)}</td>
                    <td className="px-6 py-4 font-bold text-[#6F4E37]">{formatCurrency(p.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'reports' && (
            <div className="p-3 md:p-8 space-y-4 md:space-y-10 bg-[#F8FAFC]">
              {/* Header Laporan */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#1E293B]">Laporan Keuangan Umum</h2>
                  <p className="text-sm text-[#64748B]">Periode: {new Date(reportStartDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - {new Date(reportEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleExport('CSV')}
                    className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
                  >
                    <Download size={18} />
                    Unduh CSV
                  </button>
                  <button 
                    onClick={() => handleExport('PDF')}
                    className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
                  >
                    <PieChartIcon size={18} />
                    Cetak PDF
                  </button>
                </div>
              </div>

              {/* Three Main Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pemasukan Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#DCFCE7] p-4 md:p-8 rounded-3xl relative overflow-hidden group border border-[#BBF7D0]"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/50 rounded-2xl text-[#166534]">
                      <ArrowUpCircle size={20} />
                    </div>
                    <span className="text-xs md:text-sm font-medium text-[#166534]/70">Total Pemasukan</span>
                  </div>
                  <div className="text-xl md:text-3xl font-bold text-[#166534] mb-1">
                    {formatCurrency(reportIncome)}
                  </div>
                  <p className="text-xs text-[#166534]/60">Pemasukan periode ini</p>
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                    <TrendingUp size={80} className="text-[#166534]" />
                  </div>
                </motion.div>

                {/* Pengeluaran Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-[#FEE2E2] p-4 md:p-8 rounded-3xl relative overflow-hidden group border border-[#FECACA]"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/50 rounded-2xl text-[#991B1B]">
                      <ArrowDownCircle size={20} />
                    </div>
                    <span className="text-xs md:text-sm font-medium text-[#991B1B]/70">Total Pengeluaran</span>
                  </div>
                  <div className="text-xl md:text-3xl font-bold text-[#991B1B] mb-1">
                    {formatCurrency(reportExpense)}
                  </div>
                  <p className="text-xs text-[#991B1B]/60">Pengeluaran periode ini</p>
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                    <TrendingDown size={80} className="text-[#991B1B]" />
                  </div>
                </motion.div>

                {/* Laba Bersih Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-[#DBEAFE] p-4 md:p-8 rounded-3xl relative overflow-hidden group border border-[#BFDBFE]"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/50 rounded-2xl text-[#1E40AF]">
                      <Wallet size={20} />
                    </div>
                    <span className="text-xs md:text-sm font-medium text-[#1E40AF]/70">Laba / Rugi Bersih</span>
                  </div>
                  <div className="text-xl md:text-3xl font-bold text-[#1E40AF] mb-1">
                    {formatCurrency(reportNetProfit)}
                  </div>
                  <p className="text-xs text-[#1E40AF]/60">Selisih pemasukan & pengeluaran</p>
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                    <CreditCard size={80} className="text-[#1E40AF]" />
                  </div>
                </motion.div>
              </div>

              {/* Cash Flow Trend Chart */}
              <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-[#F1F5F9]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-[#1E293B]">Tren Arus Kas (Daily Flow)</h3>
                    <p className="text-xs text-[#64748B]">Perbandingan Pemasukan vs Pengeluaran per hari</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Pemasukan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Pengeluaran</span>
                    </div>
                  </div>
                </div>
                <div className="h-64 md:h-80 w-full flex items-center justify-center">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94A3B8', fontSize: 10 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94A3B8', fontSize: 10 }}
                          tickFormatter={(val) => `Rp ${val/1000}k`}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="pemasukan" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                        <Area type="monotone" dataKey="pengeluaran" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Analisis Pemasukan */}
                <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-[#F1F5F9]">
                  <h3 className="text-lg font-bold text-[#1E293B] mb-8">Analisis Pemasukan</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative w-48 h-48 shrink-0 flex items-center justify-center" style={{ minWidth: 100, minHeight: 100 }}>
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(incomeStats).map(([name, value]) => ({ name, value }))}
                              innerRadius={65}
                              outerRadius={85}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {Object.entries(incomeStats).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={['#2563EB', '#60A5FA', '#93C5FD', '#BFDBFE'][index % 4]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs font-medium text-[#64748B]">Total</span>
                        <span className="text-xl font-bold text-[#1E293B]">{Object.keys(incomeStats).length}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      {Object.entries(incomeStats).map(([name, amount], idx) => {
                        const percentage = ((amount / reportIncome) * 100).toFixed(1);
                        return (
                          <motion.div 
                            key={name} 
                            whileHover={{ x: 5 }}
                            onClick={() => handleCategoryClick(name, 'INCOME')}
                            className="flex items-center justify-between group cursor-pointer p-1 hover:bg-blue-50/50 rounded-lg transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#2563EB', '#60A5FA', '#93C5FD', '#BFDBFE'][idx % 4] }}></div>
                              <span className="text-sm font-medium text-[#334155] truncate max-w-[150px] group-hover:text-[#2563EB]">{name}</span>
                            </div>
                            <span className="text-xs font-bold text-[#1E293B]">{percentage}%</span>
                          </motion.div>
                        );
                      })}
                      {Object.keys(incomeStats).length === 0 && <p className="text-center text-xs text-[#64748B]">Belum ada data</p>}
                    </div>
                  </div>
                </div>

                {/* Analisis Pengeluaran */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F1F5F9]">
                  <h3 className="text-lg font-bold text-[#1E293B] mb-8">Analisis Pengeluaran</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative w-48 h-48 shrink-0 flex items-center justify-center" style={{ minWidth: 100, minHeight: 100 }}>
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              innerRadius={65}
                              outerRadius={85}
                              paddingAngle={5}
                              dataKey="value"
                              onClick={(data) => handleCategoryClick(data.name, 'EXPENSE')}
                            >
                              {pieData.map((_, index) => (
                                <Cell key={`cell-${index}`} style={{ cursor: 'pointer' }} fill={['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'][index % 5]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs font-medium text-[#64748B]">Total</span>
                        <span className="text-xl font-bold text-[#1E293B]">{pieData.length}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      {pieData.map((d, idx) => {
                        const percentage = ((d.value / reportExpense) * 100).toFixed(1);
                        return (
                          <motion.div 
                            key={idx} 
                            whileHover={{ x: 5 }}
                            onClick={() => handleCategoryClick(d.name, 'EXPENSE')}
                            className="flex items-center justify-between group cursor-pointer p-1 hover:bg-red-50/50 rounded-lg transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'][idx % 5] }}></div>
                              <span className="text-sm font-medium text-[#334155] truncate max-w-[150px] group-hover:text-[#EF4444]">{d.name}</span>
                            </div>
                            <span className="text-xs font-bold text-[#1E293B]">{percentage}%</span>
                          </motion.div>
                        );
                      })}
                      {pieData.length === 0 && <p className="text-center text-xs text-[#64748B]">Belum ada data</p>}
                    </div>
                  </div>
                </div>

                {/* Analisis Pembayaran */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F1F5F9]">
                  <h3 className="text-lg font-bold text-[#1E293B] mb-8">Metode Pembayaran (Pendapatan)</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(paymentStats).map(([name, value]) => ({ name, value }))}
                              innerRadius={65}
                              outerRadius={85}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {Object.entries(paymentStats).map((_, index) => (
                                <Cell key={`pm-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs font-medium text-[#64748B]">Metode</span>
                        <span className="text-xl font-bold text-[#1E293B]">{Object.keys(paymentStats).length}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      {Object.entries(paymentStats).map(([name, amount], idx) => {
                        const percentage = ((amount / reportIncome) * 100).toFixed(1);
                        return (
                          <div key={name} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[idx % PAYMENT_COLORS.length] }}></div>
                              <span className="text-sm font-medium text-[#334155]">{name}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-[#1E293B]">{formatCurrency(amount)}</p>
                              <p className="text-[10px] text-[#64748B]">{percentage}% dari total</p>
                            </div>
                          </div>
                        );
                      })}
                      {Object.keys(paymentStats).length === 0 && <p className="text-center text-xs text-[#64748B]">Belum ada transaksi pendapatan</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rincian Semua Transaksi */}
              <div className="space-y-6" id="rincian-transaksi-report">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-[#1E293B]">Rincian Semua Transaksi</h3>
                    {filterCategory !== 'ALL' && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 animate-pulse">
                        <span className="text-[10px] font-bold uppercase">Filter Aktif: {filterCategory}</span>
                        <button 
                          onClick={() => { setFilterCategory('ALL'); setFilterType('ALL'); }}
                          className="hover:bg-blue-100 rounded-full p-0.5"
                        >
                           <Plus className="rotate-45" size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  {filterCategory !== 'ALL' && (
                    <button 
                      onClick={() => { setFilterCategory('ALL'); setFilterType('ALL'); }}
                      className="text-xs font-bold text-[#2563EB] hover:underline"
                    >
                      Lihat Semua Transaksi
                    </button>
                  )}
                </div>
                <div className="bg-white rounded-3xl shadow-sm border border-[#F1F5F9] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8FAFC]">
                      <tr className="text-[#64748B] text-[10px] uppercase font-bold tracking-widest border-b border-[#F1F5F9]">
                        <th className="px-6 py-5">ID Transaksi</th>
                        <th className="px-6 py-5">Tanggal</th>
                        <th className="px-6 py-5">Deskripsi</th>
                        <th className="px-6 py-4 font-bold">Kategori</th>
                        <th className="px-6 py-5 text-right">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {reportTransactions
                        .filter(t => (filterType === 'ALL' || t.type === filterType))
                        .filter(t => (filterCategory === 'ALL' || t.category === filterCategory))
                        .map((t) => (
                          <tr key={t.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                            <td className="px-6 py-4 text-[11px] font-mono text-[#94A3B8]">#{t.id}</td>
                            <td className="px-6 py-4 text-xs font-medium text-[#1E293B]">
                               {new Date(t.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-xs text-[#334155] font-bold uppercase">{t.description}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                t.type === 'INCOME' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                              }`}>
                                {t.category}
                              </span>
                            </td>
                            <td className={`px-6 py-4 text-xs font-bold text-right ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                              Rp {Number(t.amount).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      {reportTransactions.filter(t => (filterCategory === 'ALL' || t.category === filterCategory)).length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-2 text-[#64748B]">
                              <Search size={32} />
                              <p className="text-sm font-medium">Tidak ada transaksi untuk kategori ini</p>
                              <button onClick={() => { setFilterCategory('ALL'); setFilterType('ALL'); }} className="text-xs text-[#2563EB] font-bold mt-2">Atur Ulang Filter</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-[#F5F2ED] flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#3C2A21]">Transaksi Baru</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#8C7B6E] hover:text-[#6F4E37]">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <form onSubmit={handleTransactionSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Tipe</label>
                    <select 
                      className="form-input"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as any})}
                    >
                      <option value="INCOME">Pemasukan</option>
                      <option value="EXPENSE">Pengeluaran</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Kategori</label>
                    <select 
                      className="form-input"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      {financeCategories.filter(fc => fc.type === formData.type).map(fc => (
                        <option key={fc.id} value={fc.name}>{fc.name}</option>
                      ))}
                      {financeCategories.filter(fc => fc.type === formData.type).length === 0 && (
                        <option value="Lainnya">Lainnya</option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Metode Pembayaran</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, payment_method: 'Tunai'})}
                      className={`flex items-center justify-center gap-2 py-2 rounded-xl border-2 transition-all ${formData.payment_method === 'Tunai' ? 'border-[#6F4E37] bg-[#FDFCFB] text-[#6F4E37]' : 'border-[#F5F2ED] text-[#8C7B6E]'}`}
                    >
                      <Wallet size={18} />
                      <span>Tunai</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, payment_method: 'Transfer Bank'})}
                      className={`flex items-center justify-center gap-2 py-2 rounded-xl border-2 transition-all ${formData.payment_method === 'Transfer Bank' ? 'border-[#6F4E37] bg-[#FDFCFB] text-[#6F4E37]' : 'border-[#F5F2ED] text-[#8C7B6E]'}`}
                    >
                      <CreditCard size={18} />
                      <span>Transfer</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label">Jumlah (IDR)</label>
                  <input 
                    type="number" 
                    className="form-input text-lg font-bold" 
                    placeholder="0"
                    value={formData.amount || ''}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Deskripsi</label>
                  <textarea 
                    className="form-input h-24 resize-none" 
                    placeholder="Contoh: Bayar listrik bulan Maret"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#6F4E37] text-white py-3 rounded-xl font-bold hover:bg-[#3C2A21] transition-all shadow-md"
                >
                  Simpan Transaksi
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Purchase Modal */}
      <AnimatePresence>
        {isPurchaseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-[#F5F2ED] flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#3C2A21]">Beli Bahan Baku</h2>
                <button onClick={() => setIsPurchaseModalOpen(false)} className="text-[#8C7B6E] hover:text-[#6F4E37]">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <form onSubmit={handlePurchaseSubmit} className="p-6 space-y-4">
                <div>
                  <label className="form-label">Pilih Bahan</label>
                  <select 
                    className="form-input"
                    value={purchaseData.ingredient_id}
                    onChange={e => setPurchaseData({...purchaseData, ingredient_id: Number(e.target.value)})}
                    required
                  >
                    <option value="">Pilih Bahan...</option>
                    {ingredients.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Jumlah (Qty)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="0"
                      value={purchaseData.qty || ''}
                      onChange={e => setPurchaseData({...purchaseData, qty: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Harga per Satuan</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="0"
                      value={purchaseData.price_per_unit || ''}
                      onChange={e => setPurchaseData({...purchaseData, price_per_unit: Number(e.target.value)})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Supplier</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Nama Supplier"
                    value={purchaseData.supplier}
                    onChange={e => setPurchaseData({...purchaseData, supplier: e.target.value})}
                  />
                </div>

                <div className="p-4 bg-[#FDFCFB] rounded-2xl border border-[#F5F2ED]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8C7B6E]">Total Pembayaran:</span>
                    <span className="text-lg font-bold text-[#6F4E37]">
                      {formatCurrency(purchaseData.qty * purchaseData.price_per_unit)}
                    </span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#8C7B6E] text-white py-3 rounded-xl font-bold hover:bg-[#6F4E37] transition-all shadow-md"
                >
                  Konfirmasi Pembelian
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
