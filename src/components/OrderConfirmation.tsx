import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Clock, ArrowLeft, Coffee, ShoppingBag, Printer } from 'lucide-react';
import { motion } from 'motion/react';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 bg-[#F5F1ED] rounded-full flex items-center justify-center text-[#6F4E37] mb-6">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Pesanan Tidak Ditemukan</h2>
        <p className="text-[#8C7B6E] mb-8">Sepertinya Anda belum melakukan pemesanan.</p>
        <Link to="/menu" className="btn btn-primary px-8">
          Ke Menu
        </Link>
      </div>
    );
  }

  // Estimated time: 15-20 minutes from now
  const estimatedTime = new Date(new Date(order.created_at).getTime() + 20 * 60000).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <motion.div 
        id="order-receipt"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-xl shadow-[#6F4E37]/5 border border-[#E8E1D9] overflow-hidden"
      >
        {/* Success Header */}
        <div className="bg-[#6F4E37] p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-4"
          >
            <CheckCircle size={40} className="text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold mb-2">Pesanan Dikonfirmasi!</h2>
          <p className="text-white/80">Terima kasih atas pembelian Anda. Kopi Anda sedang disiapkan.</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Order Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FDFCFB] p-4 rounded-2xl border border-[#E8E1D9]">
              <p className="text-xs text-[#8C7B6E] uppercase tracking-wider font-bold mb-1">Pelanggan</p>
              <p className="text-lg font-bold text-[#6F4E37] truncate">{order.customer_name || 'Tamu'}</p>
            </div>
            <div className="bg-[#FDFCFB] p-4 rounded-2xl border border-[#E8E1D9]">
              <p className="text-xs text-[#8C7B6E] uppercase tracking-wider font-bold mb-1">Nomor Pesanan</p>
              <p className="text-lg font-bold text-[#6F4E37]">#ORD-{order.id.toString().padStart(4, '0')}</p>
            </div>
            <div className="bg-[#FDFCFB] p-4 rounded-2xl border border-[#E8E1D9]">
              <p className="text-xs text-[#8C7B6E] uppercase tracking-wider font-bold mb-1">Meja</p>
              <p className="text-lg font-bold text-[#6F4E37]">{order.table_number || 'N/A'}</p>
            </div>
            <div className="bg-[#FDFCFB] p-4 rounded-2xl border border-[#E8E1D9]">
              <p className="text-xs text-[#8C7B6E] uppercase tracking-wider font-bold mb-1">Estimasi Selesai</p>
              <div className="flex items-center gap-2 text-lg font-bold text-[#6F4E37]">
                <Clock size={18} />
                {estimatedTime}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Coffee size={20} className="text-[#6F4E37]" />
              Ringkasan Pesanan
            </h3>
            <div className="bg-[#FDFCFB] rounded-2xl border border-[#E8E1D9] divide-y divide-[#E8E1D9]">
              <div className="p-4 space-y-4">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start py-4 first:pt-0 last:pb-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#6F4E37]/10 text-[#6F4E37] text-[10px] font-black px-2 py-0.5 rounded-full">
                          x{item.quantity}
                        </span>
                        <p className="text-[#6F4E37] font-bold text-base">
                          {item.name}
                        </p>
                      </div>
                      
                      {/* Add-ons / Customizations */}
                      <div className="space-y-1 ml-9">
                        {item.customizations?.map((c: any) => (
                          <div key={c.groupName} className="flex items-center gap-2">
                            <span className="text-[10px] text-[#8C7B6E] font-medium leading-none">
                              {c.groupName}:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {c.selectedOptions.map((o: any) => (
                                <span key={o.name} className="text-[9px] bg-[#F5F1ED] text-[#6F4E37] border border-[#E8E1D9] px-1.5 py-0.5 rounded-md font-bold">
                                  {o.name} {o.price > 0 && `(Rp ${o.price.toLocaleString()})`}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {item.notes && (
                        <div className="ml-9 mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-200 rounded-r-lg">
                          <p className="text-[10px] italic text-[#8C7B6E]">
                            "{item.notes}"
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#6F4E37]">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 flex justify-between items-center text-sm">
                <span className="text-[#8C7B6E]">Metode Pembayaran</span>
                <span className="font-bold text-[#6F4E37]">{order.payment_method}</span>
              </div>

              <div className="p-4 flex justify-between items-center bg-[#F5F1ED]/30">
                <span className="font-bold text-[#8C7B6E]">Total Dibayar</span>
                <span className="text-xl font-bold text-[#6F4E37]">Rp {order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="text-center space-y-4 pt-4 no-print">
            <p className="text-sm text-[#8C7B6E]">
              Kami akan memberi tahu Anda jika pesanan Anda sudah siap diambil di kasir.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => navigate('/menu')}
                className="flex-1 btn btn-outline py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                Kembali ke Menu
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-1 btn btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#6F4E37]/20"
              >
                <Printer size={18} />
                Cetak Struk
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 text-center no-print">
        <button 
          onClick={() => navigate('/')}
          className="text-[#8C7B6E] hover:text-[#6F4E37] flex items-center gap-2 mx-auto transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
