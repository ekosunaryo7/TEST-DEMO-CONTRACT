import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  BellRing, 
  Mail, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  FileSpreadsheet, 
  ExternalLink, 
  Sparkles,
  Info,
  Edit2
} from 'lucide-react';
import { DepartmentConfig, NotificationIntervalConfig, SheetIntegrationConfig } from '../types';

interface SettingsViewProps {
  departments: DepartmentConfig[];
  onSaveDepartments: (depts: DepartmentConfig[]) => void;
  notificationSettings: NotificationIntervalConfig;
  onSaveNotificationSettings: (settings: NotificationIntervalConfig) => void;
  sheetConfig: SheetIntegrationConfig;
  onSaveSheetConfig: (config: SheetIntegrationConfig) => void;
  onOpenAppsScriptTab: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  departments,
  onSaveDepartments,
  notificationSettings,
  onSaveNotificationSettings,
  sheetConfig,
  onSaveSheetConfig,
  onOpenAppsScriptTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'departments' | 'notifications' | 'spreadsheet'>('departments');

  // Department State
  const [deptList, setDeptList] = useState<DepartmentConfig[]>(departments);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [newSenderName, setNewSenderName] = useState('');
  const [newSenderEmail, setNewSenderEmail] = useState('');
  const [newManagerEmail, setNewManagerEmail] = useState('ekosunaryo7@gmail.com');
  const [newCcEmails, setNewCcEmails] = useState('');

  // Notification Interval State
  const [intervals, setIntervals] = useState<number[]>(notificationSettings.intervals);
  const [customIntervalInput, setCustomIntervalInput] = useState('');
  const [sendTimeHour, setSendTimeHour] = useState(notificationSettings.sendTimeHour);
  const [enableCcManager, setEnableCcManager] = useState(notificationSettings.enableCcManager);
  const [emailSubjectTemplate, setEmailSubjectTemplate] = useState(notificationSettings.emailSubjectTemplate);
  const [isSavedNotification, setIsSavedNotification] = useState(false);

  // Spreadsheet config state
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(sheetConfig.spreadsheetUrl);
  const [spreadsheetId, setSpreadsheetId] = useState(sheetConfig.spreadsheetId);
  const [webAppUrl, setWebAppUrl] = useState(sheetConfig.webAppUrl);
  const [isSavedSheet, setIsSavedSheet] = useState(false);

  // Department Handlers
  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newSenderEmail.trim()) return;

    const newDept: DepartmentConfig = {
      id: `dept-${Date.now().toString(36)}`,
      departmentName: newDeptName.trim(),
      senderName: newSenderName.trim() || `${newDeptName} Operations`,
      senderEmail: newSenderEmail.trim(),
      managerEmail: newManagerEmail.trim() || 'ekosunaryo7@gmail.com',
      ccEmails: newCcEmails ? newCcEmails.split(',').map(s => s.trim()) : [],
      color: '#3B82F6',
    };

    const updated = [...deptList, newDept];
    setDeptList(updated);
    onSaveDepartments(updated);

    // Reset form
    setNewDeptName('');
    setNewSenderName('');
    setNewSenderEmail('');
    setNewCcEmails('');
  };

  const handleDeleteDepartment = (id: string) => {
    if (deptList.length <= 1) {
      alert('Minimal harus ada satu departemen terdaftar.');
      return;
    }
    const updated = deptList.filter(d => d.id !== id);
    setDeptList(updated);
    onSaveDepartments(updated);
  };

  // Interval Handlers
  const handleToggleInterval = (day: number) => {
    let updated: number[];
    if (intervals.includes(day)) {
      updated = intervals.filter(d => d !== day);
    } else {
      updated = [...intervals, day].sort((a, b) => b - a);
    }
    setIntervals(updated);
  };

  const handleAddCustomInterval = () => {
    const val = parseInt(customIntervalInput, 10);
    if (!isNaN(val) && val >= 0 && !intervals.includes(val)) {
      const updated = [...intervals, val].sort((a, b) => b - a);
      setIntervals(updated);
      setCustomIntervalInput('');
    }
  };

  const handleSaveNotifications = () => {
    const updated: NotificationIntervalConfig = {
      ...notificationSettings,
      intervals,
      sendTimeHour,
      enableCcManager,
      emailSubjectTemplate,
    };
    onSaveNotificationSettings(updated);
    setIsSavedNotification(true);
    setTimeout(() => setIsSavedNotification(false), 3000);
  };

  const handleSaveSheetConfig = () => {
    const updated: SheetIntegrationConfig = {
      ...sheetConfig,
      spreadsheetUrl,
      spreadsheetId,
      webAppUrl,
      isConnected: true,
      lastSyncedAt: new Date().toISOString(),
    };
    onSaveSheetConfig(updated);
    setIsSavedSheet(true);
    setTimeout(() => setIsSavedSheet(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Pengaturan Sistem & Integrasi
            </h1>
            <p className="text-sm text-slate-500">
              Konfigurasi sender email per departemen, interval hari pengingat notifikasi, dan integrasi Google Sheets.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-3 mb-6">
        <button
          onClick={() => setActiveSubTab('departments')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeSubTab === 'departments'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Department Setup (Email Sender)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeSubTab === 'notifications'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Setting Interval Notifikasi</span>
        </button>

        <button
          onClick={() => setActiveSubTab('spreadsheet')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeSubTab === 'spreadsheet'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Database Spreadsheet Utama</span>
        </button>
      </div>

      {/* SUBTAB 1: DEPARTMENTS */}
      {activeSubTab === 'departments' && (
        <div className="space-y-6">
          {/* List Departemen Terdaftar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Daftar Sender Email per Departemen</span>
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                {deptList.length} Departemen Aktif
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deptList.map((dept) => (
                <div
                  key={dept.id}
                  className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow relative bg-slate-50/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{dept.departmentName}</h3>
                      <p className="text-xs text-blue-600 font-medium mt-0.5">
                        Sender Display: {dept.senderName}
                      </p>
                    </div>
                    {deptList.length > 1 && (
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                        title="Hapus Departemen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-400">Sender Email:</span>
                      <span className="font-mono text-slate-800">{dept.senderEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 ml-5">Manager CC:</span>
                      <span className="font-mono text-slate-800">{dept.managerEmail}</span>
                    </div>
                    {dept.ccEmails && dept.ccEmails.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 ml-5">Other CC:</span>
                        <span className="font-mono text-slate-600 truncate">{dept.ccEmails.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Tambah Departemen Baru */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Tambah Setup Departemen Baru</span>
            </h2>

            <form onSubmit={handleAddDepartment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Departemen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="Contoh: Marketing & Creative"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Tampilan Pengirim (Sender Display Name)
                </label>
                <input
                  type="text"
                  value={newSenderName}
                  onChange={(e) => setNewSenderName(e.target.value)}
                  placeholder="Contoh: Marketing Vendor Support"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Email Pengirim (Sender Email) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={newSenderEmail}
                  onChange={(e) => setNewSenderEmail(e.target.value)}
                  placeholder="marketing-vendor@company.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Email Manager Operasional (Otomatis Di-CC)
                </label>
                <input
                  type="email"
                  value={newManagerEmail}
                  onChange={(e) => setNewManagerEmail(e.target.value)}
                  placeholder="ekosunaryo7@gmail.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Alamat Email CC Tambahan (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={newCcEmails}
                  onChange={(e) => setNewCcEmails(e.target.value)}
                  placeholder="procurement@company.com, legal@company.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Simpan Departemen Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 2: NOTIFICATIONS INTERVAL */}
      {activeSubTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <BellRing className="w-5 h-5 text-blue-600" />
              <span>Interval Peringatan Hari Sebelum Expired (H-X)</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Sistem Google Apps Script akan secara otomatis memeriksa seluruh data kontrak di Google Sheets setiap pagi dan mengirimkan email jika sisa hari cocok dengan interval di bawah ini.
            </p>

            {/* Quick Presets */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                Pilih Interval Hari Aktif (Klik untuk mengaktifkan / menonaktifkan)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {[90, 60, 45, 30, 21, 14, 7, 3, 1, 0].map((day) => {
                  const isSelected = intervals.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleInterval(day)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                        isSelected
                          ? day <= 7
                            ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/20'
                            : day <= 30
                            ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                            : 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>H-{day} {day === 0 ? '(Hari H)' : 'Hari'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Interval */}
            <div className="mb-6 flex items-center space-x-2 max-w-sm">
              <input
                type="number"
                min="0"
                value={customIntervalInput}
                onChange={(e) => setCustomIntervalInput(e.target.value)}
                placeholder="Tambah hari kustom (misal: 15)..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={handleAddCustomInterval}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl whitespace-nowrap cursor-pointer"
              >
                + Tambah
              </button>
            </div>

            {/* Pengaturan Jam Pengiriman */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Jadwal Pengiriman Trigger Harian</span>
                </label>
                <select
                  value={sendTimeHour}
                  onChange={(e) => setSendTimeHour(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white cursor-pointer"
                >
                  <option value={7}>Pukul 07:00 WIB (Pagi Awal)</option>
                  <option value={8}>Pukul 08:00 WIB (Jam Kerja Masuk - Rekomendasi)</option>
                  <option value={9}>Pukul 09:00 WIB</option>
                  <option value={10}>Pukul 10:00 WIB</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Diatur otomatis pada Apps Script `ScriptApp.newTrigger().timeBased().atHour(8)`.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Kebijakan CC Manager Operasional
                </label>
                <label className="flex items-center space-x-3 text-xs text-slate-700 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={enableCcManager}
                    onChange={(e) => setEnableCcManager(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium">
                    Selalu CC email Manager ({departments[0]?.managerEmail || 'ekosunaryo7@gmail.com'}) di setiap notifikasi kontrak
                  </span>
                </label>
              </div>

              {/* Template Subject Email */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Format Subject Email Notifikasi
                </label>
                <input
                  type="text"
                  value={emailSubjectTemplate}
                  onChange={(e) => setEmailSubjectTemplate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Variabel tersedia: <code className="text-blue-600">{`{vendor_name}`}</code>, <code className="text-blue-600">{`{contract_no}`}</code>, <code className="text-blue-600">{`{days_left}`}</code>
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 mt-6">
              {isSavedNotification && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>Pengaturan interval berhasil disimpan!</span>
                </span>
              )}
              <button
                type="button"
                onClick={handleSaveNotifications}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-sm cursor-pointer transition-all"
              >
                Simpan Konfigurasi Notifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SPREADSHEET DATABASE */}
      {activeSubTab === 'spreadsheet' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>Koneksi Google Sheets Database</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Database utama yang digunakan untuk menyimpan seluruh master data kontrak vendor, riwayat user, pengaturan departemen, dan log pengiriman email.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Link Spreadsheet Database
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={spreadsheetUrl}
                    onChange={(e) => setSpreadsheetUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 whitespace-nowrap shrink-0"
                  >
                    <span>Buka Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Spreadsheet ID
                  </label>
                  <input
                    type="text"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Google Apps Script Web App URL (Opsional / Live Sync)
                  </label>
                  <input
                    type="text"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Status Box */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 mt-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 animate-pulse" />
                <div className="text-xs text-emerald-800">
                  <p className="font-bold">Status Database: Terkoneksi ke Google Sheets</p>
                  <p className="mt-0.5 text-emerald-700">
                    ID Sheet aktif: <code className="font-mono bg-emerald-100/80 px-1 py-0.5 rounded">{spreadsheetId}</code>. Anda dapat menyalin kode Google Apps Script untuk membuat header otomatis atau memasang trigger notifikasi email di tab Apps Script Code.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onOpenAppsScriptTab}
                  className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Lihat Kode Google Apps Script Siap Pasang &rarr;</span>
                </button>

                <div className="flex items-center space-x-2">
                  {isSavedSheet && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                      <Check className="w-4 h-4" />
                      <span>Tersimpan!</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveSheetConfig}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Simpan Konfigurasi Sheets
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
