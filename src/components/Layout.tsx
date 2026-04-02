import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Coffee, LayoutDashboard, Package, BarChart3, LogOut, Store, MapPin, Wallet, Users, ChevronRight, Home } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getAuthorizedNavItems, navigationConfig } from '../lib/navigation';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Breadcrumbs component to show current location in the app
 */
const Breadcrumbs = ({ pathname }: { pathname: string }) => {
  const currentItem = navigationConfig.find(item => item.path === pathname);
  
  if (!currentItem && pathname === '/') return null;

  return (
    <nav className="flex items-center gap-2 mb-6 animate-fadeIn no-print">
      <Link to="/" className="text-[#8C7B6E] hover:text-[#6F4E37] transition-colors">
        <Home size={16} />
      </Link>
      
      <ChevronRight size={14} className="text-[#BCB1A6]" />
      
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded-md",
          currentItem ? "bg-[#F5F1ED] text-[#8C7B6E]" : "bg-[#6F4E37] text-white"
        )}>
          {pathname.startsWith('/admin') ? 'Dashboard' : 'App'}
        </span>
      </div>

      {currentItem && (
        <>
          <ChevronRight size={14} className="text-[#BCB1A6]" />
          <span className="text-sm font-bold text-[#3C2A21]">
            {currentItem.label}
          </span>
        </>
      )}
    </nav>
  );
};

export default function Layout({ user, onLogout }: { user: any, onLogout: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = getAuthorizedNavItems(user?.role_name || '');

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D241E]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E8E1D9] p-6 hidden md:flex flex-col">
        <Link to="/admin" className="flex items-center gap-3 mb-10 px-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-[#6F4E37] rounded-xl flex items-center justify-center text-white">
            <Coffee size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Bean & Brew</h1>
        </Link>

        <div className="mb-8 px-2 py-3 bg-[#FDFCFB] rounded-2xl border border-[#E8E1D9]">
          <p className="text-[10px] font-bold uppercase text-[#8C7B6E] tracking-wider mb-1">Pengguna</p>
          <p className="text-sm font-bold text-[#3C2A21] truncate">{user?.name}</p>
          <p className="text-[10px] text-[#8C7B6E]">{user?.role_name}</p>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "nav-link",
                  isActive && "active"
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button 
          onClick={handleLogout}
          className="nav-link text-red-600 hover:bg-red-50 hover:text-red-700 mt-auto border-t border-gray-50 pt-4"
        >
          <LogOut size={20} />
          <span className="font-medium">Keluar</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8 min-h-screen pb-24 md:pb-8">
        <Breadcrumbs pathname={location.pathname} />
        <div className="animate-fadeIn">
          <Outlet />
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-[#E8E1D9] flex justify-around items-center p-3 md:hidden z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "mobile-nav-item",
                isActive && "active"
              )}
            >
              <div className="icon-container">
                <Icon size={22} />
              </div>
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
        <button onClick={handleLogout} className="mobile-nav-item text-red-500">
          <div className="icon-container">
            <LogOut size={22} />
          </div>
          <span className="text-[10px] font-bold">Keluar</span>
        </button>
      </nav>
    </div>
  );
}
