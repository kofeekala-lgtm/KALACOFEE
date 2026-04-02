import { Coffee, Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full animate-fadeIn">
        <div className="mb-8 relative inline-block">
          <div className="w-24 h-24 bg-[#6F4E37]/10 rounded-3xl flex items-center justify-center text-[#6F4E37] mx-auto animate-bounce">
            <Coffee size={48} />
          </div>
          <div className="absolute -top-2 -right-2 bg-white px-3 py-1 rounded-full border border-[#E8E1D9] shadow-sm transform rotate-12">
            <span className="text-xl font-bold text-[#6F4E37]">404</span>
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-[#2D241E] mb-4">
          Cangkir Kosong!
        </h1>
        <p className="text-[#8C7B6E] mb-10 leading-relaxed">
          Sepertinya halaman yang Anda cari sudah habis disruput atau memang tidak pernah ada. Mari kembali ke menu utama.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border border-[#E8E1D9] text-[#3C2A21] font-bold hover:bg-[#F5F1ED] transition-all"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#6F4E37] text-white font-bold hover:bg-[#5D402D] shadow-lg shadow-[#6F4E37]/20 transition-all transform hover:-translate-y-1"
          >
            <Home size={18} />
            Beranda
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-[#E8E1D9]">
          <p className="text-xs text-[#BCB1A6] italic uppercase tracking-widest">
            Bean & Brew &bull; Artisan Experience
          </p>
        </div>
      </div>
    </div>
  );
}
