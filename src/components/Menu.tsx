import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, Product, Category, CustomizationOption, CustomizationGroup, CafeProfile } from '../lib/api';
import { ShoppingCart, Plus, Minus, X, ChevronDown, ChevronUp, Check, User, Instagram, Facebook, Twitter, Phone, Mail, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Menu() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [cart, setCart] = useState<{
    id: string; // Unique ID for cart item (product_id + customization hash)
    product: Product;
    quantity: number;
    customizations: { groupName: string; selectedOptions: CustomizationOption[] }[];
    notes: string;
  }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [groupName: string]: CustomizationOption[] }>({});
  const [notes, setNotes] = useState('');
  const [customQuantity, setCustomQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'Transfer Bank' | 'Tunai'>('Transfer Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [profile, setProfile] = useState<CafeProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Optimasi: Gunakan Promise.all untuk fetch paralel
        const [productsData, categoriesData, profileData] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getCafeProfile()
        ]);

        setProducts(productsData);
        setCategories(categoriesData);

        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const Skeleton = () => (
    <div className="animate-skeleton rounded-2xl h-full min-h-[300px]"></div>
  );

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleAddToCartClick = (product: Product) => {
    if (product.customization_groups && product.customization_groups.length > 0) {
      setCustomizingProduct(product);
      // Initialize default selections for required groups
      const initialSelections: { [groupName: string]: CustomizationOption[] } = {};
      product.customization_groups.forEach(group => {
        const options = group.options || [];
        if (group.is_required && options.length > 0) {
          initialSelections[group.name] = [options.find(o => o.is_available) || options[0]];
        } else {
          initialSelections[group.name] = [];
        }
      });
      setSelectedOptions(initialSelections);
      setNotes('');
      setCustomQuantity(1);
    } else {
      addToCart(product, [], '', 1);
    }
  };

  const addToCart = (
    product: Product,
    customizations: { groupName: string; selectedOptions: CustomizationOption[] }[],
    itemNotes: string,
    quantity: number
  ) => {
    const customizationHash = JSON.stringify(customizations) + itemNotes;
    const cartItemId = `${product.id}-${customizationHash}`;

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { id: cartItemId, product, quantity, customizations, notes: itemNotes }];
    });

    if (customizingProduct) {
      setCustomizingProduct(null);
    }
  };

  const confirmCustomization = () => {
    if (!customizingProduct) return;

    // Check if all required groups have selections
    const missingRequired = customizingProduct.customization_groups?.some(group =>
      group.is_required && (!selectedOptions[group.name] || selectedOptions[group.name].length < group.min_selection)
    );

    if (missingRequired) {
      alert('Mohon pilih opsi wajib');
      return;
    }

    const customizations: { groupName: string; selectedOptions: CustomizationOption[] }[] = (Object.entries(selectedOptions) as [string, CustomizationOption[]][])
      .map(([groupName, options]) => ({
        groupName,
        selectedOptions: options
      }))
      .filter(c => c.selectedOptions.length > 0);

    addToCart(customizingProduct, customizations, notes, customQuantity);
  };

  const toggleOption = (group: CustomizationGroup, option: CustomizationOption) => {
    if (!option.is_available) return;

    setSelectedOptions(prev => {
      const current = prev[group.name] || [];
      const isSelected = current.some(o => o.name === option.name);

      if (isSelected) {
        return { ...prev, [group.name]: current.filter(o => o.name !== option.name) };
      } else {
        if (group.max_selection === 1) {
          return { ...prev, [group.name]: [option] };
        } else if (current.length < group.max_selection) {
          return { ...prev, [group.name]: [...current, option] };
        }
      }
      return prev;
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === cartItemId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const calculateItemPrice = (product: Product, customizations: { groupName: string; selectedOptions: CustomizationOption[] }[]) => {
    let extra = 0;
    customizations.forEach(c => {
      c.selectedOptions.forEach(o => {
        extra += o.price;
      });
    });
    return product.price + extra;
  };

  const total = cart.reduce((sum, item) => {
    const itemPrice = calculateItemPrice(item.product, item.customizations);
    return sum + (itemPrice * item.quantity);
  }, 0);

  const currentCustomPrice = customizingProduct
    ? (customizingProduct.price + (Object.values(selectedOptions).flat() as CustomizationOption[]).reduce((sum, o) => sum + o.price, 0)) * customQuantity
    : 0;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!customerName.trim()) {
      alert('Mohon masukkan nama Anda');
      return;
    }

    const items = cart.map(item => ({
      id: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: calculateItemPrice(item.product, item.customizations),
      customizations: item.customizations,
      notes: item.notes
    }));
    setIsProcessing(true);
    try {
      const order = await api.createOrder(items, total, paymentMethod, '', customerName);
      setCart([]);
      setIsCartOpen(false);
      navigate('/order-confirmation', { state: { order: { ...order, items } } });
    } catch (err: any) {
      alert('Gagal memproses pesanan: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative pb-20">
      <header className="mb-8 space-y-4">
        <nav className="flex items-center gap-2 text-xs text-[#8C7B6E] font-medium">
          <Link to="/" className="hover:text-[#6F4E37] transition-colors">Beranda</Link>
          <span className="text-[#E8E1D9]">/</span>
          <span className="cursor-default">Serang</span>
          <span className="text-[#E8E1D9]">/</span>
          <Link to="/menu" className="text-[#6F4E37] hover:underline font-bold transition-colors">
            {profile?.name || 'KALA KOPI'} {profile?.address}
          </Link>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold">{profile?.name || 'KALA KOPI'}</h2>
              <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Super Partner</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#8C7B6E]">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500 font-bold">★</span>
                <span className="font-bold text-[#1A1A1A]">4.9</span>
                <span className="text-xs">(Cek ulasan)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-[#1A1A1A]">18.52 km</span>
                <span className="text-xs">Jarak</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-[#1A1A1A]">$ $ $ $</span>
                <span className="text-xs">Kisaran harga</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section Description */}
        <div className="mt-6 p-6 md:p-10 rounded-[2rem] bg-gradient-to-br from-[#6F4E37] to-[#4A3222] text-white overflow-hidden relative group shadow-2xl shadow-[#6F4E37]/30">
          <div className="relative z-10 space-y-3 max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-5xl font-black tracking-tight"
            >
              Kopi & Matcha Terbaik, <br />Hanya di KALA KOPI.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/80 text-xs md:text-lg leading-relaxed font-medium"
            >
              Nikmati perpaduan sempurna biji kopi pilihan dan matcha premium mulai dari 10K.
              Temukan Best Seller kami, Matcha Latte, atau coba kesegaran baru dari Butterscotch Coffee.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                <Check size={14} className="text-orange-400" /> Biji Kopi Pilihan
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                <Check size={14} className="text-orange-400" /> Barista Berpengalaman
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                <Check size={14} className="text-orange-400" /> Suasana Nyaman
              </div>
            </motion.div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-10 w-48 h-48 bg-orange-500/10 rounded-full translate-y-1/2 blur-2xl pointer-events-none animate-pulse" />
        </div>
      </header>

      {/* Sticky Categories Navigation */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md py-4 -mx-4 px-4 mb-8 border-b border-[#E8E1D9]">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-7xl mx-auto">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap bg-white text-[#8C7B6E] border border-[#E8E1D9] hover:border-[#6F4E37]"
          >
            Semua Menu
          </button>
          {isLoading ? (
            // Skeleton buttons
            [1, 2, 3, 4, 5].map(i => (
              <div key={i} className="px-10 py-5 rounded-full animate-skeleton" />
            ))
          ) : (
            categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => scrollToSection(`category-${cat.id}`)}
                className="px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap bg-white text-[#8C7B6E] border border-[#E8E1D9] hover:border-[#6F4E37]"
              >
                {cat.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Product Sections */}
      <div className="space-y-12">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} />)}
          </div>
        ) : (
          categories.map(category => {
            const categoryProducts = products.filter(p => p.category_id === category.id);
            if (categoryProducts.length === 0) return null;

            return (
              <section key={category.id} id={`category-${category.id}`} className="scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-2xl font-bold text-[#6F4E37]">{category.name}</h3>
                  <div className="h-[1px] flex-1 bg-[#E8E1D9]"></div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {categoryProducts.map(product => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      key={product.id}
                      className="bg-white rounded-xl md:rounded-2xl border border-[#E8E1D9] overflow-hidden hover:shadow-xl transition-shadow group flex flex-col"
                    >
                      <div className="h-32 md:h-48 overflow-hidden relative bg-gray-50">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${!product.is_available ? 'grayscale opacity-50' : ''}`}
                          referrerPolicy="no-referrer"
                        />
                        {!product.is_available && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <span className="bg-red-500 text-white px-4 py-1 rounded-full font-bold text-sm shadow-lg">
                              Habis
                            </span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 backdrop-blur px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-xs md:sm font-bold text-[#6F4E37]">
                          Rp {product.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3 md:p-5">
                        <h3 className="text-sm md:text-lg mb-0.5 md:mb-1 font-bold line-clamp-1">{product.name}</h3>
                        <p className="text-[10px] md:text-sm text-[#8C7B6E] mb-2 line-clamp-2 min-h-[1.5rem] md:min-h-[2.5rem]">{product.description}</p>
                        {product.name.includes('Machiato') && (
                          <p className="text-[8px] md:text-[10px] text-[#6F4E37] font-bold mb-2 md:mb-3 uppercase tracking-wider">Customizable</p>
                        )}
                        <button
                          onClick={() => handleAddToCartClick(product)}
                          disabled={!product.is_available}
                          className={`w-full btn h-9 md:h-12 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-base ${!product.is_available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-outline border-[#6F4E37] text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white'}`}
                        >
                          <Plus size={14} className="md:w-[18px] md:h-[18px]" />
                          Tambah
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Product Customization Modal */}
      <AnimatePresence>
        {customizingProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomizingProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto md:max-w-xl w-full bg-white z-[80] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-[#E8E1D9] flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold">Sesuaikan menu</h3>
                <button onClick={() => setCustomizingProduct(null)} className="p-2 hover:bg-[#F5F1ED] rounded-lg">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{customizingProduct.name}</h2>
                  <p className="text-[#8C7B6E] mb-2">{customizingProduct.description}</p>
                  <p className="text-xl font-bold text-[#6F4E37]">Rp {customizingProduct.price.toLocaleString()}</p>
                </div>

                {customizingProduct.customization_groups?.map(group => (
                  <div key={group.name} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-lg">{group.name}</h4>
                        <p className="text-xs text-[#8C7B6E]">
                          {group.is_required ? 'Wajib' : 'Opsional'} • Pilih {group.min_selection === group.max_selection ? group.min_selection : `hingga ${group.max_selection}`}
                        </p>
                      </div>
                      <ChevronUp size={20} className="text-[#8C7B6E]" />
                    </div>
                    <div className="space-y-2">
                      {(group.options || []).map(option => {
                        const isSelected = selectedOptions[group.name]?.some(o => o.name === option.name);
                        return (
                          <button
                            key={option.name}
                            onClick={() => toggleOption(group, option)}
                            disabled={!option.is_available}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected
                                ? 'border-[#6F4E37] bg-[#FDFCFB]'
                                : 'border-[#E8E1D9] hover:border-[#6F4E37]'
                              } ${!option.is_available ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{option.name}</span>
                              {!option.is_available && <span className="text-xs font-bold text-red-500 uppercase">Habis</span>}
                            </div>
                            <div className="flex items-center gap-3">
                              {option.price > 0 && <span className="text-sm text-[#8C7B6E]">+{option.price.toLocaleString()}</span>}
                              <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#6F4E37] border-[#6F4E37] text-white' : 'border-[#E8E1D9]'
                                }`}>
                                {isSelected && <Check size={16} />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg">Catatan</h4>
                      <p className="text-xs text-[#8C7B6E]">Opsional</p>
                    </div>
                    <ChevronUp size={20} className="text-[#8C7B6E]" />
                  </div>
                  <div className="relative">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                      placeholder="Contoh: banyakin porsinya, ya"
                      className="w-full p-4 rounded-xl border border-[#E8E1D9] focus:border-[#6F4E37] outline-none min-h-[100px] resize-none"
                    />
                    <span className="absolute bottom-3 right-3 text-[10px] text-[#8C7B6E]">{notes.length}/200</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[#E8E1D9] bg-[#FDFCFB] space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Mau berapa?</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setCustomQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-full border border-[#E8E1D9] flex items-center justify-center hover:bg-white"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="font-bold text-lg w-4 text-center">{customQuantity}</span>
                    <button
                      onClick={() => setCustomQuantity(q => q + 1)}
                      className="w-10 h-10 rounded-full border border-[#E8E1D9] flex items-center justify-center hover:bg-white"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={confirmCustomization}
                  className="w-full bg-[#6F4E37] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#6F4E37]/20 hover:bg-[#5A3F2D] transition-colors flex items-center justify-between px-8"
                >
                  <span>Tambah ke keranjang</span>
                  <span>Rp {currentCustomPrice.toLocaleString()}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-24 right-8 bg-[#6F4E37] text-white p-4 rounded-full shadow-2xl z-40 hover:scale-110 transition-transform flex items-center gap-3"
        >
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <span className="font-bold hidden sm:inline">Rp {total.toLocaleString()}</span>
        </button>
      )}

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[60] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-[#E8E1D9] flex items-center justify-between">
                <h3 className="text-xl font-bold">Pesanan Anda</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-[#F5F1ED] rounded-lg">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="mb-6 space-y-4">
                  <div>
                    <p className="text-sm font-bold mb-3 flex items-center gap-2">
                      <User size={16} className="text-[#6F4E37]" />
                      Nama Pelanggan
                    </p>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Masukkan nama Anda"
                      className="w-full p-3 rounded-xl border border-[#E8E1D9] focus:border-[#6F4E37] outline-none font-medium"
                    />
                  </div>


                </div>

                {cart.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.product.image_url} className="w-20 h-20 rounded-xl object-cover" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <h4 className="font-bold">{item.product.name}</h4>
                      {item.customizations.map(c => (
                        <p key={c.groupName} className="text-[10px] text-[#8C7B6E]">
                          {c.groupName}: {c.selectedOptions.map(o => o.name).join(', ')}
                        </p>
                      ))}
                      {item.notes && <p className="text-[10px] italic text-[#8C7B6E] mt-1">"{item.notes}"</p>}
                      <p className="text-[#8C7B6E] text-sm my-1">Rp {calculateItemPrice(item.product, item.customizations).toLocaleString()}</p>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 border border-[#E8E1D9] rounded hover:bg-[#F5F1ED]">
                          <Minus size={16} />
                        </button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 border border-[#E8E1D9] rounded hover:bg-[#F5F1ED]">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right font-bold">
                      Rp {(calculateItemPrice(item.product, item.customizations) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-[#E8E1D9] bg-[#FDFCFB]">
                <div className="mb-6">
                  <p className="text-sm font-bold mb-3">Metode Pembayaran</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('Transfer Bank')}
                      className={`py-3 rounded-xl border font-medium transition-all ${paymentMethod === 'Transfer Bank'
                          ? 'bg-[#6F4E37] text-white border-[#6F4E37]'
                          : 'bg-white text-[#8C7B6E] border-[#E8E1D9] hover:border-[#6F4E37]'
                        }`}
                    >
                      Transfer Bank
                    </button>
                    <button
                      onClick={() => setPaymentMethod('Tunai')}
                      className={`py-3 rounded-xl border font-medium transition-all ${paymentMethod === 'Tunai'
                          ? 'bg-[#6F4E37] text-white border-[#6F4E37]'
                          : 'bg-white text-[#8C7B6E] border-[#E8E1D9] hover:border-[#6F4E37]'
                        }`}
                    >
                      Tunai
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-[#8C7B6E] font-medium">Total Pembayaran</span>
                  <span className="text-2xl font-bold text-[#6F4E37]">Rp {total.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#6F4E37] shadow-[#6F4E37]/20 hover:bg-[#5A3F2D]'
                    }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Memproses...
                    </div>
                  ) : (
                    'Konfirmasi Pesanan'
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer Section */}
      <footer className="mt-20 -mx-4 px-4 py-16 bg-[#1A1A1A] text-white rounded-t-[3rem] relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Branding */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#6F4E37] rounded-xl flex items-center justify-center text-white font-black text-xl">K</div>
                <h3 className="text-2xl font-bold tracking-tight">{profile?.name || 'KALA KOPI'}</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Menyajikan kehangatan dalam setiap cangkir. KALA KOPI & Catsu Matcha adalah tempat di mana kualitas kopi & matcha bertemu dengan kenyamanan tempat.
              </p>
              <div className="flex gap-4">
                <a href="https://instagram.com/tokokopikala" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#6F4E37] transition-all"><Instagram size={20} /></a>
                <a href="https://instagram.com/catsu.matcha" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#6F4E37] transition-all"><div className="w-5 h-5 flex items-center justify-center font-bold text-[10px]">C</div></a>
              </div>
            </div>

            {/* Hubungi Kami */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white underline decoration-[#6F4E37] decoration-2 underline-offset-8">Hubungi Kami</h4>
              <ul className="space-y-4">
                <li className="flex gap-3 text-gray-400 text-sm">
                  <MapPin size={20} className="text-[#6F4E37] shrink-0" />
                  <span>{profile?.address || 'Serang, Banten, Indonesia'}</span>
                </li>
                <li className="flex gap-3 text-gray-400 text-sm">
                  <Phone size={20} className="text-[#6F4E37] shrink-0" />
                  <span>0819 9721 7298</span>
                </li>
                <li className="flex gap-3 text-gray-400 text-sm">
                  <Mail size={20} className="text-[#6F4E37] shrink-0" />
                  <span>hello@tokokopikala.com</span>
                </li>
              </ul>
            </div>

            {/* Jam Operasional */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white underline decoration-[#6F4E37] decoration-2 underline-offset-8">Jam Operasional</h4>
              <ul className="space-y-3">
                {(profile?.opening_hours && profile.opening_hours.length > 0 ? profile.opening_hours : [
                  { day: 'Senin - Jumat', hours: '08:00 - 22:00' },
                  { day: 'Sabtu - Minggu', hours: '09:00 - 23:00' }
                ]).map((h, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-gray-400">{h.day}</span>
                    <span className="text-[#6F4E37] font-bold">{h.hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tautan Cepat */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white underline decoration-[#6F4E37] decoration-2 underline-offset-8">Tautan Cepat</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-[#6F4E37] transition-colors text-sm">Beranda</a></li>
                <li><a href="#menu" className="text-gray-400 hover:text-[#6F4E37] transition-colors text-sm">Daftar Menu</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#6F4E37] transition-colors text-sm">Tentang Kami</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#6F4E37] transition-colors text-sm">Kontak</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-[10px] md:text-sm">
              © {new Date().getFullYear()} {profile?.name || 'KALA KOPI'}. Seluruh hak cipta dilindungi.
            </p>
            <div className="flex items-center gap-2 text-gray-500 text-[10px] md:text-sm">
              <span>Didukung oleh</span>
              <span className="text-white font-bold tracking-tight">KALA POS v2.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
