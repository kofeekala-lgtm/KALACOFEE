import { useState, useEffect } from 'react';
import { api, DailyReport } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Trophy, Calendar, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Reports() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; count: number; revenue: number }[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [allProductSales, setAllProductSales] = useState<{ name: string; count: number; revenue: number; avg_price: number }[]>([]);

  useEffect(() => {
    setIsMounted(true);
    api.getDailyReport().then(setReports);
    api.getTopSellingProducts().then(setTopProducts);
    api.getAllProductSales().then(setAllProductSales);
  }, []);

  const filteredReports = reports.filter(r => {
    if (!startDate && !endDate) return true;
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;
    return true;
  });

  const totalSales = filteredReports.reduce((sum, r) => sum + r.total_sales, 0);
  const totalOrders = filteredReports.reduce((sum, r) => sum + r.order_count, 0);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-4 md:space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">Analisis Penjualan</h2>
          <p className="text-sm md:text-base text-[#8C7B6E]">Pantau performa dan tren kedai kopi Anda.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-[#E8E1D9] shadow-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F1ED] rounded-xl">
            <Calendar size={16} className="text-[#6F4E37]" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-xs font-bold focus:ring-0 p-0"
            />
            <span className="text-[#8C7B6E] text-xs">sampai</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-xs font-bold focus:ring-0 p-0"
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={clearFilters}
              className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
              title="Hapus Filter"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-[#E8E1D9] shadow-sm">
          <div className="p-3 bg-[#F5F1ED] text-[#6F4E37] rounded-xl w-fit mb-4">
            <DollarSign size={24} />
          </div>
          <p className="text-[#8C7B6E] text-sm font-medium">Total Pendapatan</p>
          <p className="text-2xl font-bold text-[#6F4E37]">Rp {totalSales.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl border border-[#E8E1D9] shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4">
            <ShoppingBag size={24} />
          </div>
          <p className="text-[#8C7B6E] text-sm font-medium">Total Pesanan</p>
          <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl border border-[#E8E1D9] shadow-sm">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl w-fit mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-[#8C7B6E] text-sm font-medium">Rata-rata Nilai Pesanan</p>
          <p className="text-2xl font-bold text-green-600">
            Rp {totalOrders > 0 ? Math.round(totalSales / totalOrders).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-[#E8E1D9] shadow-sm">
          <h3 className="font-bold text-lg mb-6">Tren Pendapatan</h3>
          <div className="w-full h-64 md:h-80 relative">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredReports}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6F4E37" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6F4E37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E1D9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#8C7B6E', fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#8C7B6E', fontSize: 10 }}
                    tickFormatter={(val) => `Rp ${val/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E8E1D9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Area type="monotone" dataKey="total_sales" stroke="#6F4E37" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl border border-[#E8E1D9] shadow-sm">
          <h3 className="font-bold text-lg mb-6">Volume Pesanan</h3>
          <div className="h-64 md:h-80 flex items-center justify-center relative w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredReports}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E1D9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#8C7B6E', fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#8C7B6E', fontSize: 10 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F5F1ED' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E8E1D9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="order_count" fill="#8C7B6E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-[#E8E1D9]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
            <Trophy size={20} />
          </div>
          <h3 className="font-bold text-lg">Produk Terlaris</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-4 bg-[#FDFCFB] rounded-xl border border-[#E8E1D9]">
                <div className="flex items-center gap-4">
                  <span className="w-6 h-6 flex items-center justify-center bg-[#6F4E37] text-white text-xs font-bold rounded-full">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold">{product.name}</p>
                    <p className="text-xs text-[#8C7B6E]">{product.count} pesanan</p>
                  </div>
                </div>
                <p className="font-bold text-[#6F4E37]">Rp {product.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="w-full h-64 relative">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {topProducts.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#6F4E37', '#8C7B6E', '#A69080', '#C4B5A9', '#E8E1D9'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E8E1D9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* All Products Sales Table */}
      <div className="bg-white rounded-2xl border border-[#E8E1D9] shadow-sm overflow-hidden mb-12">
        <div className="p-4 md:p-6 border-b border-[#E8E1D9] flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">Rincian Penjualan Semua Menu</h3>
            <p className="text-xs text-[#8C7B6E]">Statistik kumulatif penjualan per item menu</p>
          </div>
          <div className="text-xs font-bold px-3 py-1 bg-[#F5F1ED] text-[#6F4E37] rounded-full">
            Total {allProductSales.length} Menu
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FDFCFB] text-[#8C7B6E] text-[10px] uppercase font-bold tracking-widest border-b border-[#E8E1D9]">
                <th className="px-6 py-4">Menu</th>
                <th className="px-6 py-4">Harga Rata-rata</th>
                <th className="px-6 py-4">Total Terjual</th>
                <th className="px-6 py-4">Total Pendapatan</th>
                <th className="px-6 py-4">Kontribusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D9]">
              {allProductSales.map((item, idx) => {
                const contribution = (item.revenue / (totalSales || 1)) * 100;
                return (
                  <tr key={idx} className="hover:bg-[#FDFCFB] transition-colors group">
                    <td className="px-6 py-4 font-bold text-[#1A1A1A] group-hover:text-[#6F4E37] transition-colors">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#8C7B6E]">
                      Rp {item.avg_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#1A1A1A]">{item.count}</span>
                      <span className="text-[10px] text-[#8C7B6E] ml-1">Unit</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#6F4E37]">
                      Rp {item.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-[#F5F1ED] rounded-full overflow-hidden min-w-[60px]">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${contribution}%` }}
                            className="h-full bg-[#6F4E37] rounded-full"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#1A1A1A]">{contribution.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
