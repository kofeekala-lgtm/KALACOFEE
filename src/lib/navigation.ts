import { Coffee, LayoutDashboard, Package, BarChart3, Wallet, Users, Store, MapPin } from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: any;
  roles: string[];
}

export const navigationConfig: NavItem[] = [
  { 
    path: '/admin', 
    label: 'Kasir', 
    icon: LayoutDashboard, 
    roles: ['Admin', 'Kasir'] 
  },
  { 
    path: '/products', 
    label: 'Produk', 
    icon: Coffee, 
    roles: ['Admin'] 
  },
  { 
    path: '/inventory', 
    label: 'Inventaris', 
    icon: Package, 
    roles: ['Admin'] 
  },
  { 
    path: '/finance', 
    label: 'Keuangan', 
    icon: Wallet, 
    roles: ['Admin'] 
  },
  { 
    path: '/employees', 
    label: 'Karyawan', 
    icon: Users, 
    roles: ['Admin'] 
  },
  { 
    path: '/reports', 
    label: 'Laporan', 
    icon: BarChart3, 
    roles: ['Admin'] 
  },
  { 
    path: '/profile', 
    label: 'Profil', 
    icon: Store, 
    roles: ['Admin'] 
  },
  { 
    path: '/tables', 
    label: 'Meja', 
    icon: MapPin, 
    roles: ['Admin'] 
  },
];

export const getAuthorizedNavItems = (role: string) => {
  return navigationConfig.filter(item => item.roles.includes(role));
};

export const isAuthorized = (path: string, role: string) => {
  const item = navigationConfig.find(item => item.path === path);
  if (!item) return true; // Path not in config (could be public or 404)
  return item.roles.includes(role);
};
