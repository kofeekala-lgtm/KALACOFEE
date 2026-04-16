import { Link } from 'react-router-dom';
import { Coffee, ArrowRight, Star, Clock, MapPin, Instagram, Phone, MousePointer2, Sparkles, Heart, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicHome() {
  return (
    <div className="min-h-screen bg-white selection:bg-[#728C69] selection:text-white">
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
            src="https://images.unsplash.com/photo-1546811751-6df188989a3a?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover"
            alt="Premium Matcha Experience"
          />
        </div>
        
        <div className="container mx-auto px-6 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 mb-8 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
              <Sparkles size={16} className="text-[#A4C3A2]" />
              <span className="uppercase tracking-[0.4em] text-[10px] font-black text-white/90">Premium Authentic Matcha</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-white mb-8 leading-tight tracking-tighter">
              KALA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A4C3A2] to-[#728C69]">KOPI</span>
              <br />
              <span className="text-2xl md:text-4xl font-light text-white/70 italic">& Catsu Matcha Experience</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Keselarasan rasa antara <span className="font-bold text-[#A4C3A2]">Ceremonial Matcha Nippon</span> dan kopi pilihan Nusantara. 
              Mulai dari <span className="font-black text-white px-2 py-0.5 bg-[#728C69] rounded-md">10K</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
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
              className="mt-20 text-white/50 flex flex-col items-center gap-2"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest italic">Rasakan Kesegarannya</span>
              <div className="w-0.5 h-12 bg-gradient-to-b from-[#A4C3A2] to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* The Brand Philosophy - Matcha & White */}
      <section className="py-32 relative overflow-hidden bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1563911191283-d77fdad717f9?auto=format&fit=crop&q=80&w=1000" 
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
                  src="https://images.unsplash.com/photo-1544787210-28272dc9bc65?auto=format&fit=crop&q=80&w=600" 
                  className="w-full h-32 object-cover rounded-3xl"
                  alt="Coffee & Matcha detail"
                />
              </div>
            </motion.div>
          </div>
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
                image: 'https://images.unsplash.com/photo-1563200113-14639906d4e5?auto=format&fit=crop&q=80&w=800' 
              },
              { 
                name: 'Matcha Latte', 
                price: '13K', 
                tag: 'BEST SELLER',
                image: 'https://images.unsplash.com/photo-1546811751-6df188989a3a?auto=format&fit=crop&q=80&w=800' 
              },
              { 
                name: 'Strawberry Matcha', 
                price: '18K', 
                tag: 'SEASONAL',
                image: 'https://images.unsplash.com/photo-1541173155373-ba22910d161c?auto=format&fit=crop&q=80&w=800' 
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
                <div className="relative h-64 overflow-hidden">
                  <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.name} />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#728C69] text-[9px] font-black px-3 py-1 rounded-full border border-[#728C69]/10">
                    {item.tag}
                  </div>
                </div>
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

      {/* Gallery Section - More Images */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600" className="w-full h-64 object-cover rounded-[2rem]" alt="Cafe Vibe" />
              <img src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&q=80&w=600" className="w-full h-40 object-cover rounded-[2rem]" alt="Serving" />
            </div>
            <div className="space-y-4 pt-12">
              <img src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600" className="w-full h-40 object-cover rounded-[2rem]" alt="Coffee Bean" />
              <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600" className="w-full h-64 object-cover rounded-[2rem]" alt="Pouring" />
            </div>
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600" className="w-full h-64 object-cover rounded-[2rem]" alt="Matcha Drink" />
              <img src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&q=80&w=600" className="w-full h-40 object-cover rounded-[2rem]" alt="Cafe Interior" />
            </div>
            <div className="space-y-4 pt-12">
              <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600" className="w-full h-40 object-cover rounded-[2rem]" alt="Coffee Art" />
              <img src="https://images.unsplash.com/photo-1582733315328-d46ed995e6cf?auto=format&fit=crop&q=80&w=600" className="w-full h-64 object-cover rounded-[2rem]" alt="Latte" />
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
            <p>© 2026 KALA KOPI & CATSU MATCHA</p>
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
