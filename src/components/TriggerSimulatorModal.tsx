import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Mail, 
  Clock, 
  Building2, 
  ExternalLink,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Contract, DepartmentConfig, NotificationIntervalConfig, EmailLog } from '../types';
import { calculateContractStatus, formatRupiah } from '../services/contractService';

interface TriggerSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contracts: Contract[];
  departments: DepartmentConfig[];
  notificationSettings: NotificationIntervalConfig;
  onLogGenerated: (log: Omit<EmailLog, 'id' | 'timestamp'>) => void;
  spreadsheetId: string;
}

export const TriggerSimulatorModal: React.FC<TriggerSimulatorModalProps> = ({
  isOpen,
  onClose,
  contracts,
  departments,
  notificationSettings,
  onLogGenerated,
  spreadsheetId,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [simulatedEmails, setSimulatedEmails] = useState<
    Array<{
      contract: Contract;
      daysLeft: number;
      subject: string;
      to: string;
      cc: string;
    }>
  >([]);
  const [previewEmail, setPreviewEmail] = useState<{
    contract: Contract;
    daysLeft: number;
    subject: string;
    to: string;
    cc: string;
  } | null>(null);

  if (!isOpen) return null;

  const runSimulation = () => {
    setIsRunning(true);
    setLogs([]);
    setSimulatedEmails([]);
    setPreviewEmail(null);

    const logMessages: string[] = [];
    const emails: Array<{
      contract: Contract;
      daysLeft: number;
      subject: string;
      to: string;
      cc: string;
    }> = [];

    logMessages.push(`[08:00:00 WIB] [TRIGGER] Time-Driven Trigger dimulai (cron harian)...`);
    logMessages.push(`[08:00:01 WIB] Menghubungi Spreadsheet ID: ${spreadsheetId}`);
    logMessages.push(`[08:00:01 WIB] Membaca data tab 'Contracts'... Ditemukan ${contracts.length} baris.`);
    logMessages.push(`[08:00:02 WIB] Interval aktif: [${notificationSettings.intervals.join(', ')}] hari.`);

    setTimeout(() => {
      contracts.forEach((c) => {
        const { status, daysLeft } = calculateContractStatus(c.expiredDate);

        if (daysLeft < 0) {
          logMessages.push(
            `[SKIP] ${c.vendorName} (${c.contractNumber}) -> Expired (${Math.abs(daysLeft)} hari lalu). Status diupdate ke 'Kadaluarsa'.`
          );
        } else if (notificationSettings.intervals.includes(daysLeft)) {
          const dept = departments.find((d) => d.departmentName === c.department);
          const toEmail = c.picEmail || `${c.picName.toLowerCase().replace(/\s+/g, '')}@vendor.com`;
          const ccEmail = dept?.managerEmail || 'ekosunaryo7@gmail.com';
          const subject = `[PENGINGAT KONTRAK] Masa Berlaku Kontrak Vendor ${c.vendorName} Tinggal ${daysLeft} Hari`;

          logMessages.push(
            `[MATCH! H-${daysLeft}] ${c.vendorName} -> Mengirimkan email HTML ke: ${toEmail} (CC: ${ccEmail})`
          );

          emails.push({
            contract: c,
            daysLeft,
            subject,
            to: toEmail,
            cc: ccEmail,
          });

          onLogGenerated({
            contractId: c.id,
            vendorName: c.vendorName,
            recipientEmail: toEmail,
            recipientRole: 'Vendor PIC & Manager CC',
            subject,
            daysLeft,
            status: 'simulated',
          });
        } else {
          logMessages.push(
            `[INFO] ${c.vendorName} -> Sisa ${daysLeft} hari (tidak ada jadwal pengingat hari ini).`
          );
        }
      });

      logMessages.push(`[08:00:05 WIB] Selesai! Total ${emails.length} email peringatan otomatis diproses.`);
      setLogs(logMessages);
      setSimulatedEmails(emails);
      if (emails.length > 0) {
        setPreviewEmail(emails[0]);
      }
      setIsRunning(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Simulator Trigger & Engine Notifikasi Otomatis
            </h2>
            <p className="text-xs text-slate-500">
              Uji coba eksekusi rutin harian Google Apps Script `checkAndSendContractExpiryReminders()` secara instan.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-800">Target Database:</span> Google Sheets{' '}
            <code className="bg-slate-200/80 px-1.5 py-0.5 rounded font-mono text-[11px] text-slate-700">
              {spreadsheetId}
            </code>
          </div>

          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memproses Eksekusi Script...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Jalankan Simulasi Trigger Hari Ini</span>
              </>
            )}
          </button>
        </div>

        {/* Content Split: Console Output vs Email Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Console Output */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col h-[400px]">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800 mb-2">
              <span className="flex items-center space-x-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Execution Log Console</span>
              </span>
              <span className="text-[10px] text-slate-500">Google Apps Script Logger</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-300 pr-2">
              {logs.length === 0 ? (
                <div className="text-slate-600 text-center py-24 italic">
                  Klik tombol "Jalankan Simulasi Trigger Hari Ini" untuk memulai pengujian.
                </div>
              ) : (
                logs.map((msg, i) => (
                  <div
                    key={i}
                    className={`${
                      msg.includes('MATCH!')
                        ? 'text-emerald-400 font-bold bg-emerald-950/40 p-1 rounded'
                        : msg.includes('SKIP')
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {msg}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Email HTML Preview */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col h-[400px]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-200 mb-2">
              <span className="flex items-center space-x-1.5">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Preview Email Notifikasi Nyata</span>
              </span>
              {simulatedEmails.length > 0 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  {simulatedEmails.length} Email Terkirim
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {previewEmail ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
                  {/* Email meta */}
                  <div className="bg-slate-100/80 p-3 border-b border-slate-200 space-y-1 text-[11px] text-slate-600">
                    <p>
                      <strong className="text-slate-800">To:</strong> {previewEmail.to}
                    </p>
                    <p>
                      <strong className="text-slate-800">CC:</strong> {previewEmail.cc}
                    </p>
                    <p>
                      <strong className="text-slate-800">Subject:</strong> {previewEmail.subject}
                    </p>
                  </div>

                  {/* Email Body */}
                  <div className="p-4 space-y-3">
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-white text-[10px] font-bold ${
                        previewEmail.daysLeft <= 7 ? 'bg-rose-600' : 'bg-amber-600'
                      }`}
                    >
                      {previewEmail.daysLeft === 0
                        ? 'HARI INI EXPIRED!'
                        : `Tersisa ${previewEmail.daysLeft} Hari Lagi`}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {previewEmail.contract.vendorName}
                      </h3>
                      <p className="text-slate-500 text-[11px]">
                        No. Dokumen: {previewEmail.contract.contractNumber}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg space-y-1 text-[11px] text-slate-700 border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Jatuh Tempo:</span>
                        <span className="font-bold text-rose-600">
                          {previewEmail.contract.expiredDate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Department:</span>
                        <span className="font-semibold">{previewEmail.contract.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nominal:</span>
                        <span className="font-semibold">
                          {formatRupiah(previewEmail.contract.nominalContract)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">PIC Vendor:</span>
                        <span>{previewEmail.contract.picName} ({previewEmail.contract.picPhone})</span>
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-blue-900 text-white font-semibold text-[11px] px-4 py-2 rounded-lg"
                      >
                        Buka Spreadsheet Database
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-center py-24 text-xs italic">
                  Belum ada preview. Jalankan simulasi untuk melihat format email pengingat.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Tutup Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
