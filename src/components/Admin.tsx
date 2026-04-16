import { useState, useEffect } from 'react';
import { api, Order } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Clock, CheckCircle2, Trash2, Calendar, X, Search, Eye, Receipt, User, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ErrorBoundary from './ErrorBoundary';

export default function Admin() {
  return (
    <ErrorBoundary>
      <AdminContent />
    </ErrorBoundary>
  );
}

function AdminContent() {
  const today = new Date().toISOString().split('T')[0];
  const [orders, setOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  const fetchOrders = () => {
    api.getRecentOrders(startDate, endDate).then(setOrders);
  };

  useEffect(() => {
    fetchOrders();
  }, [startDate, endDate]);

  useEffect(() => {

    // Setup Realtime Subscription
    const channel = supabase
      .channel('orders-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteOrder = async (id: number) => {
    if (confirm('Hapus pesanan ini?')) {
      await api.deleteOrder(id);
      fetchOrders();
    }
  };

  const handleUpdateStatus = async (id: number, status: 'Menunggu' | 'Selesai') => {
    await api.updateOrderStatus(id, status);
    fetchOrders();
  };

  const filteredOrders = orders.filter(order => {
    // Date Filter
    if (startDate || endDate) {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;
    }

    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesId = order.id.toString().includes(query);
      const matchesItems = order.items_summary.toLowerCase().includes(query);
      const matchesPayment = order.payment_method.toLowerCase().includes(query);
      const matchesCustomer = order.customer_name?.toLowerCase().includes(query);
      if (!matchesId && !matchesItems && !matchesPayment && !matchesCustomer) return false;
    }

    return true;
  });

  const pendingOrders = filteredOrders.filter(o => o.status === 'Menunggu');
  const completedOrders = filteredOrders.filter(o => o.status === 'Selesai');

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const OrderTable = ({ title, orders, type }: { title: string, orders: Order[], type: 'pending' | 'completed' }) => (
    <div className="bg-white rounded-2xl border border-[#E8E1D9] overflow-hidden shadow-sm">
      <div className="p-4 md:p-6 border-b border-[#E8E1D9] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-base md:text-lg">{title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            type === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
          }`}>
            {orders.length}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#8C7B6E]">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Pembaruan Langsung
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FDFCFB] text-[#8C7B6E] text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-bold border-b border-[#E8E1D9]">ID Pesanan</th>
              <th className="px-6 py-4 font-bold border-b border-[#E8E1D9]">Pelanggan</th>
              <th className="px-6 py-4 font-bold border-b border-[#E8E1D9]">Item</th>
              <th className="px-6 py-4 font-bold border-b border-[#E8E1D9]">Waktu</th>
              <th className="px-6 py-4 font-bold border-b border-[#E8E1D9]">Pembayaran</th>
              <th className="px-6 py-4 font-bold border-b border-[#E8E1D9]">Total</th>
              <th className="px-6 py-4 font-bold text-right border-b border-[#E8E1D9]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E1D9]">
            {(orders || []).map(order => (
              <tr key={order.id} className="hover:bg-[#FDFCFB] transition-colors group">
                <td className="px-6 py-4 font-bold text-[#6F4E37]">#{order.id}</td>
                <td className="px-6 py-4 font-bold text-[#1A1A1A]">{order.customer_name || 'Tamu'}</td>

                <td className="px-6 py-4">
                  <p className="text-sm font-medium max-w-xs truncate" title={order.items_summary}>
                    {order.items_summary}
                  </p>
                </td>
                <td className="px-6 py-4 text-[#8C7B6E] text-sm">
                  <div className="flex items-center gap-1 font-medium">
                    <Clock size={12} />
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${
                    order.payment_method === 'Tunai' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {order.payment_method}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold">Rp {order.total_amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {order.status === 'Menunggu' ? (
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'Selesai')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl text-xs font-bold transition-all border border-green-100"
                      >
                        <CheckCircle2 size={14} />
                        Selesai
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'Menunggu')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl text-xs font-bold transition-all border border-orange-100"
                      >
                        <Clock size={14} />
                        Buka Kembali
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-[#6F4E37] hover:bg-[#F5F1ED] rounded-lg transition-colors"
                      title="Lihat Detail"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteOrder(order.id)} 
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Pesanan"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-[#8C7B6E]">
                  <div className="flex flex-col items-center gap-4">
                    <Search size={24} className="opacity-20" />
                    <p className="text-sm">Tidak ada pesanan {type === 'pending' ? 'menunggu' : 'selesai'} ditemukan.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const StatsCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: 'blue' | 'orange' | 'green' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      orange: 'bg-orange-50 text-orange-600 border-orange-100',
      green: 'bg-green-50 text-green-600 border-green-100'
    };
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-3xl border border-[#E8E1D9] shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
      >
        <div className={`p-4 rounded-2xl border ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-[#8C7B6E] uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-black text-[#1A1A1A]">{value}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">Dasbor Kasir</h2>
          <p className="text-[#8C7B6E]">Kelola pesanan masuk dan transaksi pelanggan.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7B6E]" size={18} />
            <input 
              type="text"
              placeholder="Cari ID, item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E1D9] rounded-2xl focus:ring-2 focus:ring-[#6F4E37] focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-[#E8E1D9] shadow-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F1ED] rounded-xl">
              <Calendar size={16} className="text-[#6F4E37]" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold focus:ring-0 p-0"
              />
              <span className="text-[#8C7B6E] text-xs">ke</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold focus:ring-0 p-0"
              />
            </div>
            {(startDate || endDate || searchQuery) && (
              <button 
                onClick={clearFilters}
                className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                title="Hapus Filter"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatsCard 
          title="Total Pesanan" 
          value={filteredOrders.length} 
          icon={<Receipt size={24} />}
          color="blue"
        />
        <StatsCard 
          title="Pesanan Menunggu" 
          value={pendingOrders.length} 
          icon={<Clock size={24} />}
          color="orange"
        />
        <StatsCard 
          title="Total Pendapatan" 
          value={`Rp ${filteredOrders.reduce((sum, o) => sum + o.total_amount, 0).toLocaleString()}`} 
          icon={<CheckCircle2 size={24} />}
          color="green"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#E8E1D9]">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-3 text-sm font-bold transition-all relative ${
            activeTab === 'dashboard' ? 'text-[#6F4E37]' : 'text-[#8C7B6E] hover:text-[#6F4E37]'
          }`}
        >
          Dasbor Aktif
          {activeTab === 'dashboard' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6F4E37]" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 text-sm font-bold transition-all relative ${
            activeTab === 'history' ? 'text-[#6F4E37]' : 'text-[#8C7B6E] hover:text-[#6F4E37]'
          }`}
        >
          Riwayat Pesanan
          {activeTab === 'history' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6F4E37]" />
          )}
        </button>
      </div>

      <div className="space-y-12">
        {activeTab === 'dashboard' ? (
          <>
            <OrderTable title="Pesanan Menunggu" orders={pendingOrders} type="pending" />
            <OrderTable title="Pesanan Selesai" orders={completedOrders} type="completed" />
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8E1D9] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#E8E1D9] flex justify-between items-center">
              <h3 className="font-bold text-base md:text-lg">Riwayat Pesanan Lengkap</h3>
              <div className="text-xs text-[#8C7B6E]">
                Menampilkan total {filteredOrders.length} pesanan
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDFCFB] text-[#8C7B6E] text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold border-b border-[#E8E1D9]">ID Pesanan</th>
                    <th className="px-6 py-4 font-bold border-b border-[#E8E1D9]">Ringkasan Item</th>
                    <th className="px-6 py-4 font-bold border-b border-[#E8E1D9]">Total Harga</th>
                    <th className="px-6 py-4 font-bold border-b border-[#E8E1D9]">Metode Pembayaran</th>
                    <th className="px-6 py-4 font-bold border-b border-[#E8E1D9]">Tanggal</th>
                    <th className="px-6 py-4 font-bold border-b border-[#E8E1D9]">Status</th>
                    <th className="px-6 py-4 font-bold text-right border-b border-[#E8E1D9]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E1D9]">
                  {(filteredOrders || []).map(order => (
                    <tr key={order.id} className="hover:bg-[#FDFCFB] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#6F4E37]">#{order.id}</td>
                      <td className="px-6 py-4 text-sm max-w-xs truncate">{order.items_summary}</td>
                      <td className="px-6 py-4 font-bold text-sm">Rp {order.total_amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#F5F1ED] text-[#6F4E37] uppercase border border-[#E8E1D9]">
                          {order.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#8C7B6E]">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status === 'Selesai' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-[#6F4E37] hover:bg-[#F5F1ED] rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center text-[#8C7B6E]">
                        <Search size={32} className="mx-auto mb-4 opacity-20" />
                        <p>Tidak ada pesanan ditemukan dalam riwayat.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-[#E8E1D9] flex justify-between items-center bg-[#FDFCFB]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F5F1ED] text-[#6F4E37] rounded-xl">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Detail Pesanan</h3>
                    <p className="text-xs text-[#8C7B6E]">#{selectedOrder.id} • {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-[#F5F1ED] rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                {/* Items List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#8C7B6E] uppercase tracking-wider">Ringkasan Item</h4>
                  <div className="space-y-3">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between gap-4 p-3 bg-[#FDFCFB] rounded-2xl border border-[#E8E1D9]">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#6F4E37]">{item.quantity}x</span>
                            <p className="font-bold text-sm">{item.name}</p>
                          </div>
                          {item.customizations && item.customizations.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(item.customizations || []).map((c, cIdx) => (
                                <span key={cIdx} className="text-[10px] bg-white border border-[#E8E1D9] px-1.5 py-0.5 rounded text-[#8C7B6E]">
                                  {c.groupName}: {(c.selectedOptions || []).map(o => o.name).join(', ')}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.notes && (
                            <p className="mt-1 text-[10px] text-[#8C7B6E] italic">Catatan: {item.notes}</p>
                          )}
                        </div>
                        <p className="font-bold text-sm">Rp {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Grid */}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F5F1ED] rounded-2xl">
                    <div className="flex items-center gap-2 text-[#8C7B6E] mb-1">
                      <CreditCard size={14} />
                      <span className="text-[10px] font-bold uppercase">Pembayaran</span>
                    </div>
                    <p className="font-bold text-[#6F4E37]">{selectedOrder.payment_method}</p>
                  </div>
                  <div className="p-4 bg-[#F5F1ED] rounded-2xl">
                    <div className="flex items-center gap-2 text-[#8C7B6E] mb-1">
                      <User size={14} />
                      <span className="text-[10px] font-bold uppercase">Pelanggan</span>
                    </div>
                    <p className="font-bold text-[#6F4E37]">{selectedOrder.customer_name || 'Tamu'}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#FDFCFB] border-t border-[#E8E1D9] flex items-center justify-between">
                <div className="flex gap-2">
                  {selectedOrder.status === 'Menunggu' ? (
                    <button 
                      onClick={() => { handleUpdateStatus(selectedOrder.id, 'Selesai'); setSelectedOrder(null); }}
                      className="px-6 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 flex items-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Tandai Selesai
                    </button>
                  ) : (
                    <button 
                      onClick={() => { handleUpdateStatus(selectedOrder.id, 'Menunggu'); setSelectedOrder(null); }}
                      className="px-6 py-3 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2"
                    >
                      <Clock size={18} />
                      Tandai Menunggu
                    </button>
                  )}
                  <button 
                    onClick={() => window.print()} 
                    className="px-6 py-3 bg-[#6F4E37] text-white rounded-2xl font-bold hover:bg-[#5D4037] transition-all shadow-lg shadow-[#6F4E37]/20 flex items-center gap-2"
                  >
                    <Receipt size={18} />
                    Cetak Struk
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
