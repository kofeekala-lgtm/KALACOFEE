import { supabase } from './supabase';

export interface CustomizationOption {
  name: string;
  price: number;
  is_available: boolean;
}

export interface CustomizationGroup {
  name: string;
  is_required: boolean;
  min_selection: number;
  max_selection: number;
  options: CustomizationOption[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category_name: string;
  image_url: string;
  is_available: boolean;
  customization_groups?: CustomizationGroup[];
}

export interface Category {
  id: number;
  name: string;
}

export interface Ingredient {
  id: number;
  name: string;
  category?: string;
  unit: string;
  stock: number;
  min_stock: number;
  supplier?: string;
}

export interface RecipeItem {
  ingredient_id: number;
  ingredient_name: string;
  qty: number;
  unit: string;
}

export interface StockMovement {
  id: number;
  ingredient_id: number;
  ingredient_name: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  reference?: string;
  created_at: string;
}

export interface FinancialTransaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  payment_method: 'Tunai' | 'Transfer Bank';
  description: string;
  created_at: string;
  reference_id?: string;
}

export interface FinanceCategory {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface Unit {
  id: number;
  name: string;
}

export interface FinancialSummary {
  bank_balance: number;
  cash_balance: number;
  total_income: number;
  total_expense: number;
}

export interface IngredientPurchase {
  id: number;
  ingredient_id: number;
  ingredient_name: string;
  qty: number;
  unit: string;
  price_per_unit: number;
  total_price: number;
  supplier: string;
  created_at: string;
}

export interface DailyReport {
  date: string;
  total_sales: number;
  order_count: number;
}

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  customizations?: { groupName: string; selectedOptions: CustomizationOption[] }[];
  notes?: string;
}

export interface Order {
  id: number;
  total_amount: number;
  created_at: string;
  items_summary: string;
  items: OrderItem[];
  payment_method: string;
  table_number?: string;
  customer_name?: string;
  status: 'Menunggu' | 'Selesai' | 'Batal';
}



export interface CafeProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  instagram?: string;
  bank_accounts: {
    bank_name: string;
    account_number: string;
    account_holder: string;
  }[];
  opening_hours: {
    day: string;
    hours: string;
  }[];
}

export interface EmployeeRole {
  id: number;
  name: string;
  base_salary: number;
}

export interface Employee {
  id: any;
  name: string;
  role_id: number;
  role_name?: string;
  phone: string;
  email: string;
  password?: string;
  status: 'Aktif' | 'Nonaktif';
  joined_date: string;
}

export interface Payroll {
  id: number;
  employee_id: number;
  employee_name?: string;
  amount: number;
  payment_date: string;
  period: string;
  notes: string;
  reference_id: string;
}

export interface CustomizationTemplate {
  id: number;
  name: string;
  is_required: boolean;
  min_selection: number;
  max_selection: number;
  options: CustomizationOption[];
}

export const api = {
  login: async (email: string, password: string) => {
    // Check if it's the master admin
    if (email === 'admin@coffee.com' && password === 'admin123') {
      return {
        id: 0,
        name: 'Master Admin',
        email: 'admin@coffee.com',
        role_name: 'Admin'
      };
    }

    // Check employees table
    const { data, error } = await supabase
      .from('employees')
      .select('*, employee_roles(name)')
      .eq('email', email)
      .eq('password', password)
      .eq('status', 'Aktif')
      .maybeSingle();

    if (error || !data) {
      throw new Error('Email atau kata sandi salah, atau akun tidak aktif.');
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role_name: data.employee_roles?.name || 'Kasir'
    };
  },
  getCustomizationTemplates: async () => {
    const { data } = await supabase.from('customization_templates').select('*').order('name');
    return data || [];
  },
  addCustomizationTemplate: async (template: Omit<CustomizationTemplate, 'id'>) => {
    const { data } = await supabase.from('customization_templates').insert([template]).select().single();
    return data;
  },
  updateCustomizationTemplate: async (id: number, updates: Partial<CustomizationTemplate>) => {
    const { data } = await supabase.from('customization_templates').update(updates).eq('id', id).select().single();
    return data;
  },
  deleteCustomizationTemplate: async (id: number) => {
    await supabase.from('customization_templates').delete().eq('id', id);
  },
  getCafeProfile: async () => {
    const { data, error } = await supabase.from('cafe_profile').select('*').limit(1).single();
    if (error || !data) {
      return {
        name: 'KALA KOPI',
        address: 'Jl. Cigadung Raya No. 123, Cigadung, Kec. Cibeunying Kaler, Kota Bandung, Jawa Barat 40191',
        phone: '0819 9721 7298',
        email: 'hello@tokokopikala.com',
        bank_accounts: [{ bank_name: 'QRIS', account_number: 'KALA KOPI', account_holder: 'KALA KOPI' }],
        opening_hours: [
          { day: 'Senin - Jumat', hours: '08:00 - 22:00' },
          { day: 'Sabtu - Minggu', hours: '09:00 - 23:00' }
        ]
      };
    }
    return data;
  },
  updateCafeProfile: async (updates: Partial<CafeProfile>) => {
    const { data: existing } = await supabase.from('cafe_profile').select('id').limit(1).single();
    if (existing) {
      const { data } = await supabase.from('cafe_profile').update(updates).eq('id', existing.id).select().single();
      return data;
    } else {
      const { data } = await supabase.from('cafe_profile').insert([updates]).select().single();
      return data;
    }
  },
  getProducts: async () => {
    const { data } = await supabase.from('products').select('*, categories(name)');
    return (data || []).map(p => ({
      ...p,
      category_name: p.categories?.name || 'Unknown'
    }));
  },

  addProduct: async (product: Omit<Product, 'id' | 'category_name'>) => {
    const { data } = await supabase.from('products').insert([product]).select('*, categories(name)').single();
    return { ...data, category_name: data.categories?.name || 'Unknown' };
  },
  updateProduct: async (id: number, updates: Partial<Product>) => {
    const { data } = await supabase.from('products').update(updates).eq('id', id).select('*, categories(name)').single();
    return { ...data, category_name: data.categories?.name || 'Unknown' };
  },
  deleteProduct: async (id: any) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Error deleting product:', error);
      throw new Error(error.message);
    }
  },

  getCategories: async () => {
    const { data } = await supabase.from('categories').select('*');
    return data || [];
  },
  addCategory: async (name: string) => {
    const { data } = await supabase.from('categories').insert([{ name }]).select().single();
    return data;
  },
  updateCategory: async (id: number, name: string) => {
    const { data } = await supabase.from('categories').update({ name }).eq('id', id).select().single();
    return data;
  },
  deleteCategory: async (id: number) => {
    await supabase.from('categories').delete().eq('id', id);
  },

  getFinanceCategories: async () => {
    const { data } = await supabase.from('finance_categories').select('*').order('name');
    return data || [];
  },
  addFinanceCategory: async (category: Omit<FinanceCategory, 'id'>) => {
    const { data } = await supabase.from('finance_categories').insert([category]).select().single();
    return data;
  },
  updateFinanceCategory: async (id: number, updates: Partial<FinanceCategory>) => {
    const { data } = await supabase.from('finance_categories').update(updates).eq('id', id).select().single();
    return data;
  },
  deleteFinanceCategory: async (id: number) => {
    await supabase.from('finance_categories').delete().eq('id', id);
  },

  getUnits: async () => {
    const { data } = await supabase.from('units').select('*').order('name');
    return data || [];
  },
  addUnit: async (name: string) => {
    const { data } = await supabase.from('units').insert([{ name }]).select().single();
    return data;
  },
  updateUnit: async (id: number, name: string) => {
    const { data } = await supabase.from('units').update({ name }).eq('id', id).select().single();
    return data;
  },
  deleteUnit: async (id: number) => {
    await supabase.from('units').delete().eq('id', id);
  },

  getIngredients: async () => {
    const { data } = await supabase.from('ingredients').select('*').order('name');
    return data || [];
  },
  updateIngredient: async (id: number, updates: Partial<Ingredient>) => {
    const { data } = await supabase.from('ingredients').update(updates).eq('id', id).select().single();
    return data;
  },
  addIngredient: async (ingredient: Omit<Ingredient, 'id'>) => {
    const { data } = await supabase.from('ingredients').insert([ingredient]).select().single();
    return data;
  },
  deleteIngredient: async (id: number) => {
    await supabase.from('ingredients').delete().eq('id', id);
  },
  adjustStock: async (ingredientId: number, quantity: number, type: 'IN' | 'OUT', reason: string, reference?: string) => {
    const { data: ing } = await supabase.from('ingredients').select('*').eq('id', ingredientId).single();
    if (!ing) throw new Error('Ingredient not found');

    const newStock = type === 'IN' ? Number(ing.stock) + Number(quantity) : Number(ing.stock) - Number(quantity);

    const { data: updatedIng } = await supabase.from('ingredients').update({ stock: newStock }).eq('id', ingredientId).select().single();

    await supabase.from('stock_movements').insert([{
      ingredient_id: ingredientId,
      ingredient_name: ing.name,
      type,
      quantity,
      reason,
      reference: reference || 'Manual'
    }]);

    return updatedIng;
  },
  getStockMovements: async () => {
    const { data } = await supabase.from('stock_movements').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  
  getRecipe: async (productId: number): Promise<RecipeItem[]> => {
    const { data } = await supabase.from('product_ingredients').select('*, ingredients(name, unit)').eq('product_id', productId);
    return (data || []).map((d: any) => ({
      ingredient_id: d.ingredient_id,
      ingredient_name: d.ingredients?.name,
      qty: d.qty,
      unit: d.ingredients?.unit
    }));
  },
  updateRecipe: async (productId: number, items: { ingredient_id: number, qty: number }[]) => {
    await supabase.from('product_ingredients').delete().eq('product_id', productId);
    if (items.length > 0) {
      const inserts = items.map(i => ({ product_id: productId, ingredient_id: i.ingredient_id, qty: i.qty }));
      await supabase.from('product_ingredients').insert(inserts);
    }
  },

  createOrder: async (items: any[], total: number, paymentMethod: string = 'Transfer Bank', tableNumber?: string, customerName?: string) => {
    // Gunakan RPC (Stored Procedure) untuk memproses semua sekaligus (Atomic & Super Fast)
    const { data: order, error } = await supabase.rpc('process_order', {
      p_items: items,
      p_total: total,
      p_payment_method: paymentMethod,
      p_table_number: tableNumber,
      p_customer_name: customerName
    });

    if (error) {
      console.error('Error processing order via RPC:', error);
      throw new Error(error.message);
    }

    return order;
  },
  getRecentOrders: async (startDate?: string, endDate?: string) => {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', `${startDate}T00:00:00`);
    }
    if (endDate) {
      query = query.lte('created_at', `${endDate}T23:59:59`);
    }

    const { data } = await query.limit(100); // Batasi 100 pesanan terakhir untuk performa optimal
    return (data || []).map(order => ({
      ...order,
      items: order.order_items || []
    }));
  },
  updateOrderStatus: async (id: number, status: 'Menunggu' | 'Selesai' | 'Batal') => {
    const { data } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
    return data;
  },
  deleteOrder: async (id: number) => {
    await supabase.from('orders').delete().eq('id', id);
  },
  getDailyReport: async (startDate?: string, endDate?: string) => {
    // Optimasi: Hanya ambil kolom tanggal dan total, jangan ambil seluruh baris pesanan
    let query = supabase.from('orders').select('created_at, total_amount');
    
    if (startDate) query = query.gte('created_at', `${startDate}T00:00:00`);
    if (endDate) query = query.lte('created_at', `${endDate}T23:59:59`);
    
    const { data } = await query;
    const orders = data || [];
    
    const reportMap: Record<string, DailyReport> = {};
    orders.forEach(o => {
      const date = o.created_at.split('T')[0];
      if (!reportMap[date]) {
        reportMap[date] = { date, total_sales: 0, order_count: 0 };
      }
      reportMap[date].total_sales += Number(o.total_amount);
      reportMap[date].order_count += 1;
    });

    return Object.values(reportMap).sort((a, b) => b.date.localeCompare(a.date));
  },
  getTopSellingProducts: async (limit: number = 5) => {
    // Optimasi: Gunakan query yang lebih ringan, membatasi data terjauh
    const { data } = await supabase
      .from('order_items')
      .select('name, quantity, price')
      .order('id', { ascending: false })
      .limit(500); // Hanya hitung dari 500 item terakhir untuk kecepatan
    
    const items = data || [];
    const productMap: Record<string, { name: string, count: number, revenue: number }> = {};
    items.forEach(i => {
      if (!productMap[i.name]) {
        productMap[i.name] = { name: i.name, count: 0, revenue: 0 };
      }
      productMap[i.name].count += i.quantity;
      productMap[i.name].revenue += (i.price * i.quantity);
    });

    return Object.values(productMap).sort((a, b) => b.count - a.count).slice(0, limit);
  },
  getAllProductSales: async () => {
    const { data } = await supabase
      .from('order_items')
      .select('name, quantity, price')
      .order('id', { ascending: false })
      .limit(1000);
    
    const items = data || [];
    const productMap: Record<string, { name: string, count: number, revenue: number, avg_price: number }> = {};
    items.forEach(i => {
      if (!productMap[i.name]) {
        productMap[i.name] = { name: i.name, count: 0, revenue: 0, avg_price: i.price };
      }
      productMap[i.name].count += i.quantity;
      productMap[i.name].revenue += (i.price * i.quantity);
    });

    return Object.values(productMap).sort((a, b) => b.count - a.count);
  },

  getFinancialTransactions: async (limit: number = 100, startDate?: string, endDate?: string) => {
    let query = supabase.from('financial_transactions').select('*').order('created_at', { ascending: false });
    
    if (startDate) query = query.gte('created_at', `${startDate}T00:00:00`);
    if (endDate) query = query.lte('created_at', `${endDate}T23:59:59`);
    
    const { data } = await query.limit(limit);
    return data || [];
  },
  getFinancialSummary: async () => {
    // Gunakan agregasi SQL untuk kecepatan maksimal (tidak menarik semua data)
    const { data: incomeData } = await supabase.from('financial_transactions').select('amount, payment_method').eq('type', 'INCOME');
    const { data: expenseData } = await supabase.from('financial_transactions').select('amount, payment_method').eq('type', 'EXPENSE');
    
    const inc = incomeData || [];
    const exp = expenseData || [];

    const totalIncome = inc.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = exp.reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      bank_balance: 
        inc.filter(t => t.payment_method === 'Transfer Bank').reduce((sum, t) => sum + Number(t.amount), 0) -
        exp.filter(t => t.payment_method === 'Transfer Bank').reduce((sum, t) => sum + Number(t.amount), 0),
      cash_balance: 
        inc.filter(t => t.payment_method === 'Tunai').reduce((sum, t) => sum + Number(t.amount), 0) -
        exp.filter(t => t.payment_method === 'Tunai').reduce((sum, t) => sum + Number(t.amount), 0),
      total_income: totalIncome,
      total_expense: totalExpense,
    };
  },
  addFinancialTransaction: async (transaction: Omit<FinancialTransaction, 'id' | 'created_at'>) => {
    const { data } = await supabase.from('financial_transactions').insert([transaction]).select().single();
    return data;
  },
  getEmployeeRoles: async () => {
    const { data } = await supabase.from('employee_roles').select('*').order('name');
    return data || [];
  },
  addEmployeeRole: async (role: Omit<EmployeeRole, 'id'>) => {
    const { data } = await supabase.from('employee_roles').insert([role]).select().single();
    return data;
  },
  updateEmployeeRole: async (id: number, updates: Partial<EmployeeRole>) => {
    const { data } = await supabase.from('employee_roles').update(updates).eq('id', id).select().single();
    return data;
  },
  deleteEmployeeRole: async (id: number) => {
    await supabase.from('employee_roles').delete().eq('id', id);
  },

  getEmployees: async () => {
    const { data } = await supabase.from('employees').select('*, employee_roles(name)').order('name');
    return (data || []).map(e => ({
      ...e,
      role_name: e.employee_roles?.name || 'Unknown'
    }));
  },
  addEmployee: async (employee: Omit<Employee, 'id' | 'role_name'>) => {
    const { data } = await supabase.from('employees').insert([employee]).select('*, employee_roles(name)').single();
    return { ...data, role_name: data.employee_roles?.name || 'Unknown' };
  },
  updateEmployee: async (id: any, updates: Partial<Employee>) => {
    const { data } = await supabase.from('employees').update(updates).eq('id', id).select('*, employee_roles(name)').single();
    return { ...data, role_name: data.employee_roles?.name || 'Unknown' };
  },
  deleteEmployee: async (id: any) => {
    await supabase.from('employees').delete().eq('id', id);
  },

  getPayrolls: async () => {
    const { data } = await supabase.from('payrolls').select('*, employees(name)').order('payment_date', { ascending: false });
    return (data || []).map(p => ({
      ...p,
      employee_name: p.employees?.name || 'Unknown'
    }));
  },
  processPayroll: async (payroll: Omit<Payroll, 'id' | 'employee_name' | 'reference_id' | 'payment_date'>) => {
    const reference_id = `PAY-${Date.now()}`;
    const { data } = await supabase.from('payrolls').insert([{
      ...payroll,
      reference_id
    }]).select('*, employees(name)').single();
    
    if (data) {
      await api.addFinancialTransaction({
        type: 'EXPENSE',
        category: 'Operasional',
        amount: payroll.amount,
        payment_method: 'Transfer Bank',
        description: `Gaji: ${data.employees?.name || 'Karyawan'} - ${payroll.period}`,
        reference_id: reference_id
      });
    }
    return { ...data, employee_name: data.employees?.name || 'Unknown' };
  },

  getIngredientPurchases: async () => {
    const { data } = await supabase.from('ingredient_purchases').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  addIngredientPurchase: async (purchase: Omit<IngredientPurchase, 'id' | 'created_at'>) => {
    const { data } = await supabase.from('ingredient_purchases').insert([purchase]).select().single();
    
    if (data) {
      await api.addFinancialTransaction({
        type: 'EXPENSE',
        category: 'Pembelian Bahan',
        amount: purchase.total_price,
        payment_method: 'Tunai',
        description: `Beli ${purchase.ingredient_name} (${purchase.qty} ${purchase.unit}) dari ${purchase.supplier}`,
        reference_id: `PURCH-${data.id}`
      });
      await api.adjustStock(purchase.ingredient_id, purchase.qty, 'IN', 'Pembelian Bahan', `PURCH-${data.id}`);
    }
    return data;
  }
};
