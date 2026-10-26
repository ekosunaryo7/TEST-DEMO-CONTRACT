import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  ExternalLink, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  FileSpreadsheet, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Terminal,
  Zap,
  HelpCircle
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE, ARCHITECTURE_STEPS } from '../services/googleAppsScriptCode';

interface AppsScriptGuideViewProps {
  spreadsheetUrl: string;
  spreadsheetId: string;
  onOpenTriggerSimulator: () => void;
}

export const AppsScriptGuideView: React.FC<AppsScriptGuideViewProps> = ({
  spreadsheetUrl,
  spreadsheetId,
  onOpenTriggerSimulator,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'architecture' | 'tutorial'>('code');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Apps Script & Sheets Integration Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Struktur Kode & Alur Kerja Integrasi Google Apps Script
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Solusi lengkap untuk spreadsheet database utama Anda (<span className="text-blue-300 font-mono text-xs">{spreadsheetId}</span>). Dilengkapi fitur inisialisasi sheet otomatis, engine pengecekan sisa masa berlaku, dan cron trigger harian jam 08:00 WIB.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={handleCopyCode}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kode Berhasil Disalin!' : 'Salin Seluruh Code.gs'}</span>
            </button>

            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700 font-semibold text-xs px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all"
            >
              <span>Buka Google Sheets</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex space-x-2 mt-8 border-t border-indigo-900/80 pt-4">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            1. Kode Lengkap (Code.gs)
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            2. Diagram Alur Kerja (Workflow)
          </button>
          <button
            onClick={() => setActiveTab('tutorial')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tutorial'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            3. Panduan Pasang Langkah Demi Langkah
          </button>
        </div>
      </div>

      {/* TAB 1: CODE.GS */}
      {activeTab === 'code' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-slate-300 text-xs border-b border-slate-800">
            <div className="flex items-center space-x-2 font-mono">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-white">Code.gs</span>
              <span className="text-slate-500">| Google Apps Script Engine</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onOpenTriggerSimulator}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Simulasi Trigger & Email</span>
              </button>
              <button
                onClick={handleCopyCode}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="p-6 font-mono text-xs text-slate-800 bg-slate-50 overflow-x-auto max-h-[600px] leading-relaxed select-all">
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: WORKFLOW & ARCHITECTURE */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Arsitektur Alur Kerja Integrasi Sistem</span>
            </h2>
            <p className="text-xs text-slate-500 mb-8">
              Bagaimana data mengalir dari formulir pencatatan manual hingga ke pengiriman notifikasi email otomatis dan update status berkala.
            </p>

            {/* Architecture Steps Graphic */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1 */}
              <div className="border border-blue-200 bg-blue-50/50 rounded-2xl p-5 relative">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-3 shadow-sm">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Input Data Kontrak</h3>
                <p className="text-xs text-slate-600">
                  PIC operasional menginput data vendor, tanggal masa berlaku, nominal, kontak PIC, dan lampiran kontrak melalui form web atau sheet.
                </p>
              </div>

              {/* Step 2 */}
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-5 relative">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-3 shadow-sm">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Database Google Sheets</h3>
                <p className="text-xs text-slate-600">
                  Data disimpan di Google Sheets ID <span className="font-mono font-semibold">18RpeSE...</span> pada sheet <code className="font-bold">Contracts</code> dengan header terstandar.
                </p>
              </div>

              {/* Step 3 */}
              <div className="border border-purple-200 bg-purple-50/50 rounded-2xl p-5 relative">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs mb-3 shadow-sm">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Time-Driven Trigger</h3>
                <p className="text-xs text-slate-600">
                  Google Apps Script menjalankan fungsi <code className="font-mono text-purple-700 font-semibold">checkAndSendContractExpiryReminders()</code> setiap hari pk 08:00 WIB secara otomatis di cloud Google.
                </p>
              </div>

              {/* Step 4 */}
              <div className="border border-amber-200 bg-amber-50/50 rounded-2xl p-5 relative">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-xs mb-3 shadow-sm">
                  4
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Email HTML & Log Audit</h3>
                <p className="text-xs text-slate-600">
                  Email peringatan terkirim ke PIC Vendor & CC Manajer Operasional sesuai interval (H-60, H-30, H-14, H-7, H-3, H-0). Riwayat tercatat di <code className="font-bold">Email_Logs</code>.
                </p>
              </div>
            </div>

            {/* Detailed Logic Breakdown */}
            <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Logika Pengecekan Hari (Math Logic)</span>
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  Apps Script menghitung selisih waktu secara matematis:
                </p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px]">
                  diffTime = expireDate.getTime() - today.getTime();<br />
                  daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Jika <code className="text-blue-600">daysLeft</code> bernilai 60, 30, 14, 7, 3, 1, atau 0, maka pengiriman email langsung dipicu.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Pengiriman Email Menggunakan Kuota Google</span>
                </h4>
                <p className="text-xs text-slate-600 mb-2">
                  Menggunakan method resmi <code className="font-mono text-emerald-700 font-semibold">MailApp.sendEmail()</code> yang sudah terintegrasi gratis di setiap akun Google Workspace / Gmail (kuota 100-1500 email/hari).
                </p>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                  <li>Tidak memerlukan server SMTP luar pihak ketiga.</li>
                  <li>Dukungan template email HTML responsive elegan.</li>
                  <li>Otomatis CC ke email manajer operasional dan departemen terkait.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STEP BY STEP TUTORIAL */}
      {activeTab === 'tutorial' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Panduan Pasang Langkah Demi Langkah (Step-by-Step)</span>
            </h2>

            <div className="space-y-6">
              {ARCHITECTURE_STEPS.map((s) => (
                <div key={s.step} className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
                    {s.step}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{s.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pro-Tips Box */}
            <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-2xl">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Tips Penting Saat Memberikan Izin (Authorization)</span>
              </h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                Saat pertama kali menjalankan <code className="font-mono font-bold">setupDatabaseSheets()</code> atau <code className="font-mono font-bold">createDailyTimeTrigger()</code>, Google akan menampilkan pop-up <em>"Authorization Required"</em>. Klik <strong>Review Permissions</strong> &gt; Pilih akun Google Anda &gt; Klik <strong>Advanced (Lanjutan)</strong> &gt; Klik <strong>Go to Project (unsafe/tidak aman)</strong> &gt; Klik <strong>Allow (Izinkan)</strong>. Ini merupakan prosedur standar Google untuk script pribadi yang mengakses Spreadsheet dan mengirimkan email atas nama Anda.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
