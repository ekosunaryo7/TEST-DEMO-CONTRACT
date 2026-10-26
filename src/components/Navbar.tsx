import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  Users, 
  Settings as SettingsIcon, 
  Code2, 
  ExternalLink, 
  CheckCircle2, 
  Bell, 
  FileSpreadsheet,
  ShieldAlert
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'form' | 'users' | 'settings' | 'apps-script';
  setActiveTab: (tab: 'dashboard' | 'form' | 'users' | 'settings' | 'apps-script') => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  spreadsheetUrl: string;
  criticalCount: number;
  onOpenTriggerModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  spreadsheetUrl,
  criticalCount,
  onOpenTriggerModal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">VendorContract</span>
                <span className="text-xs bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Google Sheets & Apps Script Lifecycle Engine
              </p>
            </div>
          </div>

          {/* Quick Stats & Spreadsheet link */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 text-xs bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-all"
              title="Buka Database Spreadsheet Asli"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium">Sheets DB Terhubung</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
            </a>

            {criticalCount > 0 && (
              <div className="flex items-center space-x-1.5 text-xs bg-rose-500/20 border border-rose-500/30 text-rose-300 px-3 py-1.5 rounded-lg animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-semibold">{criticalCount} Kontrak Kritis</span>
              </div>
            )}

            <button
              onClick={onOpenTriggerModal}
              className="flex items-center space-x-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-3.5 py-1.5 rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Simulasi Notifikasi</span>
            </button>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 hidden lg:inline">Peran:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="super_admin">👑 Super Admin</option>
              <option value="operational_manager">👔 Ops Manager</option>
              <option value="department_pic">👤 Dept PIC</option>
              <option value="auditor">🔍 Viewer / Auditor</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>1. Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('form')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'form'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FilePlus2 className="w-4 h-4" />
            <span>2. Form Input Kontrak</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>3. Manage User</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>4. Setting & Departemen</span>
          </button>

          <button
            onClick={() => setActiveTab('apps-script')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'apps-script'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/30'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>⚡ Google Apps Script Code</span>
          </button>
        </div>
      </div>
    </header>
  );
};
