import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Search, 
  Edit3, 
  Trash2, 
  Send,
  AlertCircle
} from 'lucide-react';
import { AppUser, UserRole, DepartmentConfig } from '../types';

interface ManageUserViewProps {
  users: AppUser[];
  departments: DepartmentConfig[];
  onAddUser: (user: Omit<AppUser, 'id' | 'createdAt'>) => void;
  onUpdateUser: (id: string, updates: Partial<AppUser>) => void;
  onDeleteUser: (id: string) => void;
  onSendTestEmail: (email: string, userName: string) => void;
}

export const ManageUserView: React.FC<ManageUserViewProps> = ({
  users,
  departments,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSendTestEmail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('department_pic');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [error, setError] = useState('');

  const openAddModal = () => {
    setEditingUserId(null);
    setName('');
    setEmail('');
    setRole('department_pic');
    setDepartment('All');
    setStatus('active');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: AppUser) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setDepartment(user.department);
    setStatus(user.status);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama lengkap wajib diisi');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Email valid wajib diisi');
      return;
    }

    if (editingUserId) {
      onUpdateUser(editingUserId, {
        name: name.trim(),
        email: email.trim(),
        role,
        department,
        status,
      });
    } else {
      onAddUser({
        name: name.trim(),
        email: email.trim(),
        role,
        department,
        status,
      });
    }

    setIsModalOpen(false);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-purple-200">
            👑 Super Admin
          </span>
        );
      case 'operational_manager':
        return (
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200">
            👔 Operational Manager
          </span>
        );
      case 'department_pic':
        return (
          <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
            👤 Dept PIC
          </span>
        );
      case 'auditor':
        return (
          <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200">
            🔍 Viewer / Auditor
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Manage User & Hak Akses Email
            </h1>
            <p className="text-sm text-slate-500">
              Kelola akun operasional, PIC departemen, dan role penerima email laporan monitoring kontrak.
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
          >
            <option value="all">Semua Role</option>
            <option value="super_admin">Super Admin</option>
            <option value="operational_manager">Operational Manager</option>
            <option value="department_pic">Department PIC</option>
            <option value="auditor">Auditor / Viewer</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Nama Pengguna</th>
                <th className="py-3.5 px-4">Alamat Email</th>
                <th className="py-3.5 px-4">Role Akses</th>
                <th className="py-3.5 px-4">Departemen</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada user yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                          {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-400">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-xs">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-xs font-medium">
                      {user.department}
                    </td>
                    <td className="py-4 px-4">
                      {user.status === 'active' ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-slate-400 text-xs font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Nonaktif</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onSendTestEmail(user.email, user.name)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Kirim Tes Email Notifikasi"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {user.id !== 'usr-1' && (
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus user ${user.name}?`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>{editingUserId ? 'Edit Akun Pengguna' : 'Tambah Akun User Baru'}</span>
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Sarah Oktaviani"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Email Akun
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah.ops@company.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Role Hak Akses
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
                >
                  <option value="super_admin">Super Admin (Kelola Semua & Google Apps Script)</option>
                  <option value="operational_manager">Operational Manager (Overview & Approval)</option>
                  <option value="department_pic">Department PIC (Input Kontrak Departemen)</option>
                  <option value="auditor">Viewer / Auditor (Laporan Read-Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Akses Departemen
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
                >
                  <option value="All">Semua Departemen (Lintas Divisi)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.departmentName}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Status Akun
                </label>
                <div className="flex items-center space-x-4 pt-1">
                  <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={status === 'active'}
                      onChange={() => setStatus('active')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Aktif</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={status === 'inactive'}
                      onChange={() => setStatus('inactive')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Nonaktif</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  {editingUserId ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
