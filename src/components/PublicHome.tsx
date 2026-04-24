import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ArrowRight, Star, Clock, MapPin, Instagram, Phone, MousePointer2, Sparkles, Heart, Leaf, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicHome() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white selection:bg-[#728C69] selection:text-white">
      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-10 right-10 text-white hover:text-[#A4C3A2] transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={40} />
            </motion.button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              className="max-w-full max-h-full rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Navbar - Transparent/Glass */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#728C69] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#728C69]/20">
              <Leaf size={20} />
            </div>
            <span className="text-white font-black text-xl tracking-tighter">KALA <span className="text-[#A4C3A2]">KOPI</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-white/80 text-sm font-bold">
            <Link to="/menu" className="hover:text-white transition-colors">Menu</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login Staf</Link>
          </div>
          <Link to="/menu" className="btn bg-[#728C69] hover:bg-[#5F7556] text-white px-6 py-2 rounded-full text-xs font-black shadow-lg shadow-[#728C69]/20 transition-all">
            PESAN SEKARANG
          </Link>
        </div>
      </nav>

      {/* Hero Section - The Wow Factor */}
      <section className="relative min-h-screen flex items-center justify-start overflow-hidden pt-20">
        {/* Animated Background Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
            src="/ChatGPT Image 24 Apr 2026, 13.41.29.png" 
            className="w-full h-full object-cover"
            alt="Premium Matcha Experience"
          />
        </div>
        
        <div className="container mx-auto px-6 md:px-12 relative z-20 text-left">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
              <Sparkles size={16} className="text-[#A4C3A2]" />
              <span className="uppercase tracking-[0.3em] text-[10px] font-bold text-white/90">Premium Authentic Matcha</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tighter">
              KALA KOPI
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-12 max-w-lg leading-relaxed font-light">
              Keselarasan rasa antara <span className="font-semibold text-[#A4C3A2]">Artisan Kyoto Matcha</span> dan kopi pilihan Nusantara. 
              Mulai dari <span className="font-bold text-white border-b-2 border-[#728C69]">10K</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start justify-start gap-6">
              <Link to="/menu" className="group relative px-10 py-5 bg-[#728C69] text-white rounded-full font-bold overflow-hidden transition-all hover:pr-14 hover:shadow-2xl hover:shadow-[#728C69]/40">
                <span className="relative z-10 flex items-center gap-2">
                  Lihat Menu Matcha
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#5F7556] to-[#728C69] transition-transform translate-y-full group-hover:translate-y-0" />
              </Link>
            </div>
            
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-20 text-white/50 flex flex-col items-start gap-2"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest italic">Rasakan Kesegarannya</span>
              <div className="w-12 h-0.5 bg-gradient-to-r from-[#A4C3A2] to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* The Brand Philosophy - Matcha & White */}
      <section className="py-32 bg-[#FDFCFB]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="/ceede92c-1d44-4fd1-a37a-a4f34b59cc36.png" 
                  className="w-full h-full object-cover"
                  alt="Matcha Preparation"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-[#728C69] p-8 rounded-[2rem] text-white shadow-2xl hidden md:block max-w-[240px]">
                <Heart className="mb-4 text-[#A4C3A2]" size={32} />
                <p className="font-bold text-lg leading-tight">Authentic Taste, Soulful Service.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-0.5 bg-[#728C69]" />
                <span className="text-[#728C69] font-black tracking-widest text-xs">CEREMONIAL GRADE</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-[#1A1A1A] leading-tight">
                Kesempurnaan <br /> Hijau <span className="text-[#728C69]">Matcha</span>.
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                Kami membawa rahasia kesehatan dan ketenangan dari Kyoto langsung ke gelas Anda. Dipadukan dengan keahlian Barista **KALA KOPI**, menghasilkan minuman yang tidak hanya cantik dipandang, tapi juga berkesan di lidah.
              </p>
              
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div className="space-y-2">
                  <h4 className="font-black text-3xl text-[#728C69]">Kyoto</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Asal Bahan Baku</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-3xl text-[#728C69]">Hand-Whisked</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Proses Autentik</p>
                </div>
              </div>

              <div className="pt-8">
                <img 
                  src="/ceede92c-1d44-4fd1-a37a-a4f34b59cc36.png" 
                  className="w-full h-32 object-cover rounded-3xl"
                  alt="Coffee & Matcha detail"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Full Width Visual Section */}
      <section className="relative h-[60vh] md:h-[80vh] overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src="/ChatGPT Image 24 Apr 2026, 13.40.21.png" 
            className="w-full h-full object-cover"
            alt="Pure Matcha Aesthetic"
          />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <h3 className="text-white text-3xl md:text-5xl font-black tracking-[0.2em] uppercase opacity-50">Pure Bliss</h3>
          </motion.div>
        </div>
      </section>

      {/* Signature Items Showcase - The Matcha Collection */}
      <section className="py-32 bg-[#F5F8F4] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#728C69]/5 rounded-full blur-[100px] -mr-48 -mt-48" />
        
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <div className="inline-block bg-white px-4 py-1 rounded-full text-[#728C69] text-[10px] font-black border border-[#728C69]/20 mb-2">
              OUR FAVORITES
            </div>
            <h2 className="text-4xl font-black text-[#1A1A1A]">Pilihan Terbaik Hari Ini</h2>
            <p className="text-gray-500">Perpaduan visual yang indah dan rasa yang tak terlupakan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { 
                name: 'Pure Matcha', 
                price: '10K', 
                tag: 'HEALTHY',
                image: '/ChatGPT Image 24 Apr 2026, 13.41.29.png' 
              },
              { 
                name: 'Matcha Latte', 
                price: '13K', 
                tag: 'BEST SELLER',
                image: '/ChatGPT Image 24 Apr 2026, 13.40.46.png' 
              },
              { 
                name: 'Strawberry Matcha', 
                price: '18K', 
                tag: 'SEASONAL',
                image: '/ceede92c-1d44-4fd1-a37a-a4f34b59cc36.png' 
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#728C69]/10 transition-all duration-500"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1 }}
                  className="relative h-64 overflow-hidden"
                >
                  <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.name} />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#728C69] text-[9px] font-black px-3 py-1 rounded-full border border-[#728C69]/10">
                    {item.tag}
                  </div>
                </motion.div>
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-4 group-hover:text-[#728C69] transition-colors">{item.name}</h3>
                  <div className="flex justify-between items-center bg-[#F5F8F4] p-4 rounded-2xl">
                    <span className="text-[#333] font-black text-xl">Rp {item.price}</span>
                    <Link to="/menu" className="w-10 h-10 rounded-full bg-[#728C69] text-white flex items-center justify-center hover:scale-110 transition-transform">
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section - Signature Grid */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:row justify-between items-end mb-20 gap-8"
          >
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter text-[#2D332B]">Pilihan Terbaik Hari Ini</h2>
              <p className="text-[#8C7B6E] text-lg font-light">Setiap minggunya kami mengkurasi menu spesial untuk Anda nikmati. Temukan harmoni rasa yang belum pernah ada.</p>
            </div>
            <Link to="/menu" className="flex items-center gap-2 text-[#728C69] font-bold hover:gap-4 transition-all pb-2 border-b-2 border-[#A4C3A2]/20">
              Jelajahi Menu Lengkap <ArrowRight size={20} />
            </Link>
          </motion.div>

          <div className="columns-2 md:columns-4 gap-4 space-y-4">
            <div className="break-inside-avoid">
              <motion.img 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                src="/ChatGPT Image 24 Apr 2026, 13.41.29.png" 
                className="w-full mb-4 object-cover rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-zoom-in hover:scale-[1.02]" 
                alt="Matcha 1" 
                onClick={() => setSelectedImage("/ChatGPT Image 24 Apr 2026, 13.41.29.png")}
              />
            </div>
            <div className="break-inside-avoid">
              <motion.img 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                src="/ChatGPT Image 24 Apr 2026, 13.40.46.png" 
                className="w-full mb-4 object-cover rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-zoom-in hover:scale-[1.02]" 
                alt="Matcha 2" 
                onClick={() => setSelectedImage("/ChatGPT Image 24 Apr 2026, 13.40.46.png")}
              />
            </div>
            <div className="break-inside-avoid">
              <motion.img 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                src="/ChatGPT Image 24 Apr 2026, 13.39.25.png" 
                className="w-full mb-4 object-cover rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-zoom-in hover:scale-[1.02]" 
                alt="Matcha 3" 
                onClick={() => setSelectedImage("/ChatGPT Image 24 Apr 2026, 13.39.25.png")}
              />
            </div>
            <div className="break-inside-avoid">
              <motion.img 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                src="/ceede92c-1d44-4fd1-a37a-a4f34b59cc36.png" 
                className="w-full mb-4 object-cover rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-zoom-in hover:scale-[1.02]" 
                alt="Matcha 4" 
                onClick={() => setSelectedImage("/ceede92c-1d44-4fd1-a37a-a4f34b59cc36.png")}
              />
            </div>
            <div className="break-inside-avoid">
              <motion.img 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                src="/cd7a2391-99e4-43b5-9215-efd047eb8265.png" 
                className="w-full mb-4 object-cover rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-zoom-in hover:scale-[1.02]" 
                alt="Matcha 5" 
                onClick={() => setSelectedImage("/cd7a2391-99e4-43b5-9215-efd047eb8265.png")}
              />
            </div>
            <div className="break-inside-avoid">
              <motion.img 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                src="/ChatGPT Image 24 Apr 2026, 13.41.29.png" 
                className="w-full mb-4 object-cover rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-zoom-in hover:scale-[1.02]" 
                alt="Matcha 6" 
                onClick={() => setSelectedImage("/ChatGPT Image 24 Apr 2026, 13.41.29.png")}
              />
            </div>
            <div className="break-inside-avoid">
              <motion.img 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                src="/ChatGPT Image 24 Apr 2026, 13.40.46.png" 
                className="w-full mb-4 object-cover rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-zoom-in hover:scale-[1.02]" 
                alt="Matcha 7" 
                onClick={() => setSelectedImage("/ChatGPT Image 24 Apr 2026, 13.40.46.png")}
              />
            </div>
            <div className="break-inside-avoid">
              <motion.img 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                src="/ChatGPT Image 24 Apr 2026, 13.39.25.png" 
                className="w-full mb-4 object-cover rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-zoom-in hover:scale-[1.02]" 
                alt="Matcha 8" 
                onClick={() => setSelectedImage("/ChatGPT Image 24 Apr 2026, 13.39.25.png")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Matcha Dark */}
      <footer className="bg-[#2D332B] text-white pt-32 pb-16 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-20 text-center lg:text-left">
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-4xl font-black tracking-tighter">KALA <span className="text-[#A4C3A2]">KOPI</span></h2>
              <p className="text-white/50 max-w-md mx-auto lg:mx-0 leading-relaxed font-light text-lg">
                Melampaui sekadar rasa, menciptakan momen dalam setiap tegukan hijau. Bergabunglah dengan perjalanan rasa kami.
              </p>
              <div className="flex justify-center lg:justify-start gap-4">
                <a href="https://instagram.com/tokokopikala" className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#728C69] transition-all">
                  <Instagram size={24} />
                </a>
                <a href="https://wa.me/6281997217298" className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#728C69] transition-all">
                  <Phone size={24} />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-sm uppercase tracking-[0.3em] text-[#A4C3A2]">Lokasi</h4>
              <div className="flex flex-col items-center lg:items-start gap-3 text-white/60">
                <MapPin size={24} className="text-[#728C69]" />
                <p className="text-sm">
                  Jl. Cigadung Raya No. 123, <br />
                  Bandung, Jawa Barat 40191
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-sm uppercase tracking-[0.3em] text-[#A4C3A2]">Buka Setiap Hari</h4>
              <div className="space-y-2 text-white/60">
                <p className="text-sm">08:00 — 22:00 (Weekdays)</p>
                <p className="text-sm">09:00 — 23:00 (Weekends)</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:row justify-between items-center gap-4 text-white/20 text-[10px] font-bold uppercase tracking-widest">
            <p>© 2026 KALA KOPI & KALA MATCHA</p>
            <div className="flex gap-8">
              <Link to="/login" className="hover:text-[#A4C3A2]">Portal Login</Link>
              <span className="text-[#728C69]">Kyoto x Bandung</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
