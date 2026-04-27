import React, { useState, useEffect } from 'react';
import { api, CafeProfile, Category, FinanceCategory, Unit, EmployeeRole, Employee, CustomizationTemplate } from '../lib/api';
import { Store, MapPin, Phone, Mail, Instagram, Clock, CreditCard, Edit2, Save, X, Plus, Trash2, Settings, Database, Key, ShieldCheck, Lock } from 'lucide-react';

import { motion } from 'framer-motion';

export default function CafeProfilePage({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'master' | 'security'>('profile');

  const [profile, setProfile] = useState<CafeProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<CafeProfile | null>(null);

  // Master Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [financeCategories, setFinanceCategories] = useState<FinanceCategory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [roles, setRoles] = useState<EmployeeRole[]>([]);
  const [customizationTemplates, setCustomizationTemplates] = useState<any[]>([]);

  // Forms for Master Data
  const [newCategory, setNewCategory] = useState('');
  const [newFinanceCategory, setNewFinanceCategory] = useState({ name: '', type: 'INCOME' as 'INCOME' | 'EXPENSE' });
  const [newUnit, setNewUnit] = useState('');
  const [newRole, setNewRole] = useState({ name: '', base_salary: 0 });
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    is_required: false,
    min_selection: 0,
    max_selection: 1,
    options: [] as any[]
  });
  // Password Reset States
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
    loadMasterData();
  }, []);

  const loadProfile = async () => {
    const data = await api.getCafeProfile();
    setProfile(data);
    setEditedProfile(data);
  };

  const loadMasterData = async () => {
    const [cData, fcData, uData, rData, ctData] = await Promise.all([
      api.getCategories(),
      api.getFinanceCategories(),
      api.getUnits(),
      api.getEmployeeRoles(),
      api.getCustomizationTemplates()
    ]);
    setCategories(cData);
    setFinanceCategories(fcData);
    setUnits(uData);
    setRoles(rData);
    setCustomizationTemplates(ctData);
  };

  const handleSaveProfile = async () => {
    if (editedProfile) {
      const updated = await api.updateCafeProfile(editedProfile);
      setProfile(updated);
      setIsEditing(false);
    }
  };

  // --- Master Data Handlers ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory) return;
    await api.addCategory(newCategory);
    setNewCategory('');
    loadMasterData();
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Hapus kategori produk ini?')) {
      await api.deleteCategory(id);
      loadMasterData();
    }
  };

  const handleAddFinanceCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFinanceCategory.name) return;
    await api.addFinanceCategory(newFinanceCategory);
    setNewFinanceCategory({ name: '', type: 'INCOME' });
    loadMasterData();
  };

  const handleDeleteFinanceCategory = async (id: number) => {
    if (confirm('Hapus kategori keuangan ini?')) {
      await api.deleteFinanceCategory(id);
      loadMasterData();
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit) return;
    await api.addUnit(newUnit);
    setNewUnit('');
    loadMasterData();
  };

  const handleDeleteUnit = async (id: number) => {
    if (confirm('Hapus satuan ini?')) {
      await api.deleteUnit(id);
      loadMasterData();
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name) return;
    await api.addEmployeeRole(newRole);
    setNewRole({ name: '', base_salary: 0 });
    loadMasterData();
  };

  const handleDeleteRole = async (id: number) => {
    if (confirm('Hapus jabatan ini?')) {
      await api.deleteEmployeeRole(id);
      loadMasterData();
    }
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.name) return;
    await api.addCustomizationTemplate(newTemplate);
    setNewTemplate({
      name: '',
      is_required: false,
      min_selection: 0,
      max_selection: 1,
      options: []
    });
    loadMasterData();
  };

  const handleDeleteTemplate = async (id: number) => {
    if (confirm('Hapus grup kustomisasi ini?')) {
      await api.deleteCustomizationTemplate(id);
      loadMasterData();
    }
  };

  const handleAddTemplateOption = () => {
    setNewTemplate({
      ...newTemplate,
      options: [...newTemplate.options, { name: '', price: 0, is_available: true }]
    });
  };

  const handleUpdateTemplateOption = (index: number, updates: any) => {
    const newOptions = [...newTemplate.options];
    newOptions[index] = { ...newOptions[index], ...updates };
    setNewTemplate({ ...newTemplate, options: newOptions });
  };

  const handleRemoveTemplateOption = (index: number) => {
    const newOptions = newTemplate.options.filter((_, i) => i !== index);
    setNewTemplate({ ...newTemplate, options: newOptions });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!user || !user.id) {
      setPasswordStatus({ type: 'error', message: 'Informasi pengguna tidak valid. Silakan login kembali.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Konfirmasi kata sandi tidak cocok.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Kata sandi minimal 6 karakter.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      if (user.id === 0) {
         setPasswordStatus({ type: 'error', message: 'Akun Master Admin tidak dapat diubah dari sini.' });
      } else {
        await api.updateEmployee(user.id, { password: passwordForm.newPassword });
        setPasswordStatus({ type: 'success', message: 'Kata sandi berhasil diperbarui!' });
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      }
    } catch (err: any) {
      setPasswordStatus({ type: 'error', message: 'Gagal memperbarui kata sandi: ' + (err.message || 'Error unknown') });
    } finally {
      setIsUpdatingPassword(false);
    }
  };


  if (!profile || !editedProfile) return <div className="p-8 text-center">Memuat...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Pengaturan</h2>
          <p className="text-[#8C7B6E]">Kelola profil kafe dan data master aplikasi.</p>
        </div>
        {activeTab === 'profile' && (
          <button
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            className={`btn ${isEditing ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
          >
            {isEditing ? (
              <>
                <Save size={18} />
                Simpan Perubahan
              </>
            ) : (
              <>
                <Edit2 size={18} />
                Edit Profil
              </>
            )}
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl w-fit shadow-sm border border-[#E8E1D9]">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-[#6F4E37] text-white shadow-md' : 'text-[#8C7B6E] hover:text-[#6F4E37]'}`}
        >
          <Store size={18} />
          Profil Kafe
        </button>
        <button 
          onClick={() => setActiveTab('master')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'master' ? 'bg-[#6F4E37] text-white shadow-md' : 'text-[#8C7B6E] hover:text-[#6F4E37]'}`}
        >
          <Database size={18} />
          Master Data
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-[#6F4E37] text-white shadow-md' : 'text-[#8C7B6E] hover:text-[#6F4E37]'}`}
        >
          <Lock size={18} />
          Keamanan
        </button>
      </div>


      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
          {/* Basic Info */}
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-3xl border border-[#E8E1D9] shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-[#6F4E37] border-b border-[#E8E1D9] pb-4">
                <Store size={24} />
                <h3 className="font-bold text-lg">Informasi Umum</h3>
              </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8C7B6E] uppercase tracking-wider">Nama Kafe</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={e => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#E8E1D9] focus:border-[#6F4E37] outline-none"
                  />
                ) : (
                  <p className="text-lg font-bold text-[#6F4E37]">{profile.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8C7B6E] uppercase tracking-wider">Alamat</label>
                {isEditing ? (
                  <textarea
                    value={editedProfile.address}
                    onChange={e => setEditedProfile({ ...editedProfile, address: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#E8E1D9] focus:border-[#6F4E37] outline-none min-h-[100px]"
                  />
                ) : (
                  <div className="flex gap-2 text-[#6F4E37]">
                    <MapPin size={18} className="shrink-0 mt-1" />
                    <p className="font-medium">{profile.address}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8C7B6E] uppercase tracking-wider">Nomor Telepon</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.phone}
                      onChange={e => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#E8E1D9] focus:border-[#6F4E37] outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-[#6F4E37]">
                      <Phone size={18} />
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8C7B6E] uppercase tracking-wider">Alamat Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={e => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#E8E1D9] focus:border-[#6F4E37] outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-[#6F4E37]">
                      <Mail size={18} />
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8C7B6E] uppercase tracking-wider">Instagram</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.instagram}
                    onChange={e => setEditedProfile({ ...editedProfile, instagram: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#E8E1D9] focus:border-[#6F4E37] outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-[#6F4E37]">
                    <Instagram size={18} />
                    <p className="font-medium">{profile.instagram}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Bank Accounts */}
          <section className="bg-white p-6 rounded-3xl border border-[#E8E1D9] shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-[#6F4E37] border-b border-[#E8E1D9] pb-4">
              <CreditCard size={24} />
              <h3 className="font-bold text-lg">Rekening Bank</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(editedProfile.bank_accounts || []).map((acc, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#E8E1D9] bg-[#FDFCFB] relative group">
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newAccs = editedProfile.bank_accounts.filter((_, i) => i !== idx);
                        setEditedProfile({ ...editedProfile, bank_accounts: newAccs });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <div className="space-y-3">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          placeholder="Nama Bank"
                          value={acc.bank_name}
                          onChange={e => {
                            const newAccs = [...editedProfile.bank_accounts];
                            newAccs[idx].bank_name = e.target.value;
                            setEditedProfile({ ...editedProfile, bank_accounts: newAccs });
                          }}
                          className="w-full p-2 text-sm rounded-lg border border-[#E8E1D9] outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Nomor Rekening"
                          value={acc.account_number}
                          onChange={e => {
                            const newAccs = [...editedProfile.bank_accounts];
                            newAccs[idx].account_number = e.target.value;
                            setEditedProfile({ ...editedProfile, bank_accounts: newAccs });
                          }}
                          className="w-full p-2 text-sm rounded-lg border border-[#E8E1D9] outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Pemilik Rekening"
                          value={acc.account_holder}
                          onChange={e => {
                            const newAccs = [...editedProfile.bank_accounts];
                            newAccs[idx].account_holder = e.target.value;
                            setEditedProfile({ ...editedProfile, bank_accounts: newAccs });
                          }}
                          className="w-full p-2 text-sm rounded-lg border border-[#E8E1D9] outline-none"
                        />
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{acc.bank_name}</span>
                        </div>
                        <p className="text-lg font-bold text-[#6F4E37] tracking-wider">{acc.account_number}</p>
                        <p className="text-xs text-[#8C7B6E] font-medium uppercase">{acc.account_holder}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={() => {
                    setEditedProfile({
                      ...editedProfile,
                      bank_accounts: [...editedProfile.bank_accounts, { bank_name: '', account_number: '', account_holder: '' }]
                    });
                  }}
                  className="p-4 rounded-2xl border border-dashed border-[#E8E1D9] flex flex-col items-center justify-center text-[#8C7B6E] hover:border-[#6F4E37] hover:text-[#6F4E37] transition-all"
                >
                  <CreditCard size={24} className="mb-2" />
                  <span className="text-sm font-bold">Tambah Rekening Bank</span>
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-3xl border border-[#E8E1D9] shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-[#6F4E37] border-b border-[#E8E1D9] pb-4">
              <Clock size={24} />
              <h3 className="font-bold text-lg">Jam Operasional</h3>
            </div>

            <div className="space-y-4">
              {(editedProfile.opening_hours || []).map((oh, idx) => (
                <div key={idx} className="space-y-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={oh.day}
                        onChange={e => {
                          const newOH = [...editedProfile.opening_hours];
                          newOH[idx].day = e.target.value;
                          setEditedProfile({ ...editedProfile, opening_hours: newOH });
                        }}
                        className="flex-1 p-2 text-sm rounded-lg border border-[#E8E1D9] outline-none"
                      />
                      <input
                        type="text"
                        value={oh.hours}
                        onChange={e => {
                          const newOH = [...editedProfile.opening_hours];
                          newOH[idx].hours = e.target.value;
                          setEditedProfile({ ...editedProfile, opening_hours: newOH });
                        }}
                        className="flex-1 p-2 text-sm rounded-lg border border-[#E8E1D9] outline-none"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#8C7B6E] font-medium">{oh.day}</span>
                      <span className="font-bold text-[#6F4E37]">{oh.hours}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="bg-[#6F4E37] p-6 rounded-3xl text-white space-y-4 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <h4 className="font-bold text-lg relative z-10">Tips Cepat</h4>
            <p className="text-sm text-white/80 relative z-10 leading-relaxed">
              Pastikan profil Anda selalu diperbarui agar pelanggan dapat dengan mudah menemukan dan menghubungi Anda. Detail bank digunakan untuk verifikasi transfer manual.
            </p>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'master' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
          {/* Kategori Produk */}
          <section className="bg-white p-6 rounded-3xl border border-[#E8E1D9] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-4">
              <h3 className="font-bold text-lg text-[#3C2A21]">Kategori Produk</h3>
            </div>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Tambah kategori baru..." 
                className="flex-1 p-2 text-sm rounded-lg border border-[#E8E1D9] focus:border-[#6F4E37] outline-none"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
              />
              <button type="submit" className="bg-[#6F4E37] text-white p-2 rounded-lg hover:bg-[#3C2A21] transition-colors">
                <Plus size={20} />
              </button>
            </form>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-[#FDFCFB] border border-[#E8E1D9] rounded-xl">
                  <span className="font-medium text-[#3C2A21]">{c.name}</span>
                  <button onClick={() => handleDeleteCategory(c.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Kategori Keuangan */}
          <section className="bg-white p-6 rounded-3xl border border-[#E8E1D9] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-4">
              <h3 className="font-bold text-lg text-[#3C2A21]">Kategori Keuangan</h3>
            </div>
            <form onSubmit={handleAddFinanceCategory} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nama kategori..." 
                className="flex-1 p-2 text-sm rounded-lg border border-[#E8E1D9] focus:border-[#6F4E37] outline-none"
                value={newFinanceCategory.name}
                onChange={e => setNewFinanceCategory({...newFinanceCategory, name: e.target.value})}
              />
              <select 
                className="p-2 text-sm rounded-lg border border-[#E8E1D9] focus:border-[#6F4E37] outline-none"
                value={newFinanceCategory.type}
                onChange={e => setNewFinanceCategory({...newFinanceCategory, type: e.target.value as 'INCOME' | 'EXPENSE'})}
              >
                <option value="INCOME">Pemasukan</option>
                <option value="EXPENSE">Pengeluaran</option>
              </select>
              <button type="submit" className="bg-[#6F4E37] text-white p-2 rounded-lg hover:bg-[#3C2A21] transition-colors">
                <Plus size={20} />
              </button>
            </form>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {financeCategories.map(fc => (
                <div key={fc.id} className="flex items-center justify-between p-3 bg-[#FDFCFB] border border-[#E8E1D9] rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${fc.type === 'INCOME' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {fc.type === 'INCOME' ? 'Masuk' : 'Keluar'}
                    </span>
                    <span className="font-medium text-[#3C2A21]">{fc.name}</span>
                  </div>
                  <button onClick={() => handleDeleteFinanceCategory(fc.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Satuan Bahan */}
          <section className="bg-white p-6 rounded-3xl border border-[#E8E1D9] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-4">
              <h3 className="font-bold text-lg text-[#3C2A21]">Satuan Bahan Baku</h3>
            </div>
            <form onSubmit={handleAddUnit} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Contoh: Gram, Liter, Pcs..." 
                className="flex-1 p-2 text-sm rounded-lg border border-[#E8E1D9] focus:border-[#6F4E37] outline-none"
                value={newUnit}
                onChange={e => setNewUnit(e.target.value)}
              />
              <button type="submit" className="bg-[#6F4E37] text-white p-2 rounded-lg hover:bg-[#3C2A21] transition-colors">
                <Plus size={20} />
              </button>
            </form>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {units.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-[#FDFCFB] border border-[#E8E1D9] rounded-xl">
                  <span className="font-medium text-[#3C2A21]">{u.name}</span>
                  <button onClick={() => handleDeleteUnit(u.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Jabatan Karyawan */}
          <section className="bg-white p-6 rounded-3xl border border-[#E8E1D9] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-4">
              <h3 className="font-bold text-lg text-[#3C2A21]">Jabatan Karyawan</h3>
            </div>
            <form onSubmit={handleAddRole} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nama Jabatan..." 
                className="flex-1 p-2 text-sm rounded-lg border border-[#E8E1D9] focus:border-[#6F4E37] outline-none"
                value={newRole.name}
                onChange={e => setNewRole({...newRole, name: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="Gaji Pokok..." 
                className="w-32 p-2 text-sm rounded-lg border border-[#E8E1D9] focus:border-[#6F4E37] outline-none"
                value={newRole.base_salary || ''}
                onChange={e => setNewRole({...newRole, base_salary: Number(e.target.value)})}
              />
              <button type="submit" className="bg-[#6F4E37] text-white p-2 rounded-lg hover:bg-[#3C2A21] transition-colors">
                <Plus size={20} />
              </button>
            </form>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {roles.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-[#FDFCFB] border border-[#E8E1D9] rounded-xl">
                  <div className="flex flex-col">
                    <span className="font-medium text-[#3C2A21]">{r.name}</span>
                    <span className="text-xs text-[#8C7B6E]">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(r.base_salary)}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteRole(r.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Grup Kustomisasi */}
          <section className="bg-white p-6 rounded-3xl border border-[#E8E1D9] shadow-sm space-y-6 md:col-span-2">
            <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-4">
              <h3 className="font-bold text-lg text-[#3C2A21]">Grup Kustomisasi (Template)</h3>
            </div>
            
            {/* Form Tambah Template */}
            <form onSubmit={handleAddTemplate} className="space-y-4 bg-[#FDFCFB] p-4 rounded-2xl border border-[#E8E1D9]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#8C7B6E] mb-1 block">Nama Grup</label>
                  <input 
                    type="text" 
                    className="w-full p-2 text-sm rounded-lg border border-[#E8E1D9] focus:border-[#6F4E37] outline-none"
                    value={newTemplate.name}
                    onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="misal Ukuran, Topping"
                  />
                </div>
                <div className="flex items-end gap-3 pb-2">
                  <input 
                    type="checkbox" 
                    id="req-template"
                    className="w-4 h-4 rounded border-[#E8E1D9] text-[#6F4E37]"
                    checked={newTemplate.is_required}
                    onChange={e => setNewTemplate({...newTemplate, is_required: e.target.checked})}
                  />
                  <label htmlFor="req-template" className="text-xs font-bold cursor-pointer">Wajib Dipilih</label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#8C7B6E] mb-1 block">Pilihan Min</label>
                  <input 
                    type="number" 
                    className="w-full p-2 text-sm rounded-lg border border-[#E8E1D9] focus:border-[#6F4E37] outline-none"
                    value={newTemplate.min_selection}
                    onChange={e => setNewTemplate({...newTemplate, min_selection: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#8C7B6E] mb-1 block">Pilihan Maks</label>
                  <input 
                    type="number" 
                    className="w-full p-2 text-sm rounded-lg border border-[#E8E1D9] focus:border-[#6F4E37] outline-none"
                    value={newTemplate.max_selection}
                    onChange={e => setNewTemplate({...newTemplate, max_selection: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase text-[#8C7B6E]">Pilihan</label>
                  <button type="button" onClick={handleAddTemplateOption} className="text-xs text-[#6F4E37] font-bold flex items-center gap-1 hover:underline">
                    <Plus size={12} /> Tambah Pilihan
                  </button>
                </div>
                {(newTemplate.options || []).map((opt, oIdx) => (
                  <div key={oIdx} className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Nama Pilihan" 
                      className="flex-1 p-2 text-xs rounded-lg border border-[#E8E1D9] focus:border-[#6F4E37] outline-none"
                      value={opt.name}
                      onChange={e => handleUpdateTemplateOption(oIdx, { name: e.target.value })}
                    />
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7B6E]">Rp</span>
                      <input 
                        type="number" 
                        className="w-full pl-8 p-2 text-xs rounded-lg border border-[#E8E1D9] focus:border-[#6F4E37] outline-none"
                        value={opt.price}
                        onChange={e => handleUpdateTemplateOption(oIdx, { price: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <button type="button" onClick={() => handleRemoveTemplateOption(oIdx)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-[#6F4E37] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#3C2A21] transition-colors">
                  Simpan Template
                </button>
              </div>
            </form>

            {/* List Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customizationTemplates.map(t => (
                <div key={t.id} className="p-4 bg-[#FDFCFB] border border-[#E8E1D9] rounded-xl space-y-3 relative group">
                  <button 
                    onClick={() => handleDeleteTemplate(t.id)} 
                    className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div>
                    <h4 className="font-bold text-[#3C2A21]">{t.name}</h4>
                    <p className="text-xs text-[#8C7B6E]">
                      {t.is_required ? 'Wajib' : 'Opsional'} • Min: {t.min_selection} • Maks: {t.max_selection}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(t.options || []).map((opt: any, idx: number) => (
                      <span key={idx} className="text-[10px] px-2 py-1 bg-white border border-[#E8E1D9] rounded-md text-[#8C7B6E]">
                        {opt.name} {opt.price > 0 && `(+Rp${opt.price})`}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="max-w-2xl mx-auto animate-fadeIn">
          <section className="bg-white p-8 rounded-3xl border border-[#E8E1D9] shadow-sm space-y-8">
            <div className="flex items-center gap-4 text-[#6F4E37] border-b border-[#E8E1D9] pb-6">
              <div className="w-12 h-12 bg-[#6F4E37]/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="font-bold text-xl">Reset Kata Sandi</h3>
                <p className="text-sm text-[#8C7B6E]">Perbarui kata sandi akun Anda secara berkala.</p>
              </div>
            </div>

            {passwordStatus && (
              <div className={`p-4 rounded-2xl border text-sm animate-fadeIn ${
                passwordStatus.type === 'success' 
                  ? 'bg-green-50 border-green-100 text-green-700' 
                  : 'bg-red-50 border-red-100 text-red-700'
              }`}>
                {passwordStatus.message}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#3C2A21]">Kata Sandi Baru</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BCB1A6]" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-12 p-3.5 rounded-2xl border border-[#E8E1D9] focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/5 outline-none transition-all"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#3C2A21]">Konfirmasi Kata Sandi Baru</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BCB1A6]" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="Ulangi kata sandi baru"
                    className="w-full pl-12 p-3.5 rounded-2xl border border-[#E8E1D9] focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/5 outline-none transition-all"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full btn btn-primary py-4 text-base font-bold shadow-lg shadow-[#6F4E37]/20 disabled:opacity-50"
              >
                {isUpdatingPassword ? 'Memperbarui...' : 'Simpan Kata Sandi Baru'}
              </button>
            </form>

            <div className="bg-[#FDFCFB] p-5 rounded-2xl border border-[#E8E1D9] space-y-2">
              <h4 className="text-xs font-bold text-[#8C7B6E] uppercase tracking-wider">Tips Keamanan</h4>
              <ul className="text-xs text-[#8C7B6E] space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol.</li>
                <li>Jangan gunakan kata sandi yang mudah ditebak (seperti tanggal lahir).</li>
                <li>Jangan gunakan kata sandi yang sama dengan akun media sosial Anda.</li>
              </ul>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
