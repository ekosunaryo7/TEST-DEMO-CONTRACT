import React, { useState } from 'react';
import { 
  FilePlus2, 
  Building2, 
  Calendar, 
  CreditCard, 
  UserCheck, 
  Phone, 
  Mail, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X,
  FileCheck,
  Paperclip,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Contract, DepartmentConfig } from '../types';
import { formatRupiah, calculateContractStatus } from '../services/contractService';

interface FormInputViewProps {
  departments: DepartmentConfig[];
  onSubmitContract: (newContract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  onNavigateToDashboard: () => void;
  spreadsheetUrl: string;
}

export const FormInputView: React.FC<FormInputViewProps> = ({
  departments,
  onSubmitContract,
  onNavigateToDashboard,
  spreadsheetUrl,
}) => {
  // Form State
  const [vendorName, setVendorName] = useState('');
  const [contractNumber, setContractNumber] = useState(`CTR/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`);
  const [startDate, setStartDate] = useState('');
  const [expiredDate, setExpiredDate] = useState('');
  const [department, setDepartment] = useState(departments[0]?.departmentName || 'Information Technology (IT)');
  const [nominalRaw, setNominalRaw] = useState('');
  const [picName, setPicName] = useState('');
  const [picPhone, setPicPhone] = useState('');
  const [picEmail, setPicEmail] = useState('');
  const [notes, setNotes] = useState('');

  // File Upload State
  const [contractFileName, setContractFileName] = useState('');
  const [contractFileUrl, setContractFileUrl] = useState('');
  const [optionalFileName, setOptionalFileName] = useState('');
  const [optionalFileUrl, setOptionalFileUrl] = useState('');

  // Status & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-calculation
  const nominalNumber = parseInt(nominalRaw.replace(/\D/g, '') || '0', 10);
  const statusInfo = expiredDate ? calculateContractStatus(expiredDate) : null;

  // Handle Nominal Input Formatting
  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setNominalRaw(val ? new Intl.NumberFormat('id-ID').format(parseInt(val, 10)) : '');
  };

  // Mock File Upload handlers
  const handleContractFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setContractFileName(file.name);
      // Create object URL or mock Drive link
      setContractFileUrl(`https://drive.google.com/file/d/drive-doc-${Date.now()}/view`);
    }
  };

  const handleOptionalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOptionalFileName(file.name);
      setOptionalFileUrl(`https://drive.google.com/file/d/drive-opt-${Date.now()}/view`);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!vendorName.trim()) newErrors.vendorName = 'Nama vendor wajib diisi';
    if (!startDate) newErrors.startDate = 'Tanggal awal wajib dipilih';
    if (!expiredDate) newErrors.expiredDate = 'Tanggal expired wajib dipilih';
    if (startDate && expiredDate && new Date(expiredDate) <= new Date(startDate)) {
      newErrors.expiredDate = 'Tanggal expired harus setelah tanggal awal kontrak';
    }
    if (!department) newErrors.department = 'Pilih department';
    if (!nominalNumber || nominalNumber <= 0) newErrors.nominalRaw = 'Nominal kontrak harus lebih dari 0';
    if (!picName.trim()) newErrors.picName = 'Nama PIC wajib diisi';
    if (!picPhone.trim()) newErrors.picPhone = 'Nomor PIC wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitContract({
        contractNumber: contractNumber.trim() || `CTR-${Date.now()}`,
        vendorName: vendorName.trim(),
        startDate,
        expiredDate,
        department,
        nominalContract: nominalNumber,
        picName: picName.trim(),
        picPhone: picPhone.trim(),
        picEmail: picEmail.trim() || `${picName.toLowerCase().replace(/\s+/g, '')}@vendor.com`,
        contractFileName: contractFileName || 'Dokumen_Kontrak_Vendor.pdf',
        contractFileUrl: contractFileUrl || 'https://drive.google.com/sample-contract.pdf',
        optionalFileName: optionalFileName || undefined,
        optionalFileUrl: optionalFileUrl || undefined,
        notes: notes.trim(),
      });

      setIsSubmitting(false);
      setIsSuccess(true);
    }, 600);
  };

  const handleReset = () => {
    setVendorName('');
    setContractNumber(`CTR/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`);
    setStartDate('');
    setExpiredDate('');
    setNominalRaw('');
    setPicName('');
    setPicPhone('');
    setPicEmail('');
    setNotes('');
    setContractFileName('');
    setContractFileUrl('');
    setOptionalFileName('');
    setOptionalFileUrl('');
    setErrors({});
    setIsSuccess(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <FilePlus2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Form Pencatatan Kontrak Vendor
            </h1>
            <p className="text-sm text-slate-500">
              Input data manual kontrak aktif secara langsung. Data otomatis tersinkronisasi ke Google Sheets dan terdaftar dalam sistem monitoring.
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center shadow-sm animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">
            Kontrak Vendor Berhasil Dicatat!
          </h2>
          <p className="text-emerald-700 max-w-md mx-auto mb-6 text-sm">
            Data kontrak vendor <span className="font-semibold">{vendorName}</span> telah berhasil disimpan ke database Google Sheets dan siap dipantau secara berkala oleh Google Apps Script.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onNavigateToDashboard}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Lihat di Dashboard
            </button>
            <button
              onClick={handleReset}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Input Kontrak Lainnya
            </button>
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 text-emerald-700 hover:text-emerald-800 text-sm font-medium px-4 py-2.5"
            >
              <span>Buka Google Sheet</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card: Informasi Pokok Kontrak */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Detail Informasi Kontrak & Vendor</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Vendor */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nama Vendor <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="Contoh: PT Telekomunikasi Selular / PT ISS Indonesia"
                    className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                      errors.vendorName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.vendorName && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.vendorName}</span>
                  </p>
                )}
              </div>

              {/* No Kontrak */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nomor Kontrak / Dokumen SPK
                </label>
                <input
                  type="text"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  placeholder="CTR/2026/001"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Department Pemilik <span className="text-rose-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.departmentName}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal Awal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Tanggal Awal <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 cursor-pointer ${
                      errors.startDate ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.startDate}</span>
                  </p>
                )}
              </div>

              {/* Tanggal Expired */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Tanggal Expired <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={expiredDate}
                    onChange={(e) => setExpiredDate(e.target.value)}
                    className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 cursor-pointer ${
                      errors.expiredDate ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.expiredDate && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.expiredDate}</span>
                  </p>
                )}

                {/* Status Countdown Preview */}
                {statusInfo && (
                  <div className="mt-2 text-xs flex items-center space-x-2">
                    <span className="text-slate-500">Estimasi Masa Aktif:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full ${
                        statusInfo.daysLeft < 0
                          ? 'bg-rose-100 text-rose-700'
                          : statusInfo.daysLeft <= 7
                          ? 'bg-red-100 text-red-700'
                          : statusInfo.daysLeft <= 30
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {statusInfo.daysLeft < 0
                        ? `Expired (${Math.abs(statusInfo.daysLeft)} hari lalu)`
                        : `${statusInfo.daysLeft} Hari Lagi`}
                    </span>
                  </div>
                )}
              </div>

              {/* Nominal Contract */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nominal Kontrak (Rupiah) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                    Rp
                  </div>
                  <input
                    type="text"
                    value={nominalRaw}
                    onChange={handleNominalChange}
                    placeholder="250.000.000"
                    className={`w-full pl-11 pr-4 py-2.5 text-sm font-semibold rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                      errors.nominalRaw ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                </div>
                {nominalNumber > 0 && (
                  <p className="mt-1 text-xs text-blue-600 font-medium">
                    Terbilang: {formatRupiah(nominalNumber)}
                  </p>
                )}
                {errors.nominalRaw && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.nominalRaw}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card: PIC Vendor & Kontak */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6 flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <span>Person in Charge (PIC) & Komunikasi</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Nama PIC */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nama PIC Vendor <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  placeholder="Contoh: Budi Gunawan"
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                    errors.picName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {errors.picName && (
                  <p className="mt-1 text-xs text-rose-500">{errors.picName}</p>
                )}
              </div>

              {/* Nomor PIC */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nomor PIC (WhatsApp / Telepon) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={picPhone}
                    onChange={(e) => setPicPhone(e.target.value)}
                    placeholder="081234567890"
                    className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                      errors.picPhone ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.picPhone && (
                  <p className="mt-1 text-xs text-rose-500">{errors.picPhone}</p>
                )}
              </div>

              {/* Email PIC */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Email PIC Vendor (Untuk Reminder)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={picEmail}
                    onChange={(e) => setPicEmail(e.target.value)}
                    placeholder="pic@vendor.com"
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Upload Kontrak & Dokumen Tambahan */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6 flex items-center space-x-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              <span>Lampiran Dokumen Kontrak (Upload Contract & Optional)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Contract File */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-all bg-slate-50/50">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Upload Contract (Utama)</h3>
                <p className="text-xs text-slate-500 mb-4">
                  File kontrak PDF, PKS, atau SPK bertandatangan (Maks 25MB)
                </p>

                {contractFileName ? (
                  <div className="flex items-center justify-between bg-white border border-blue-200 rounded-xl px-4 py-2.5 text-left">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <FileCheck className="w-5 h-5 text-blue-600 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {contractFileName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setContractFileName('');
                        setContractFileUrl('');
                      }}
                      className="text-slate-400 hover:text-rose-500 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="inline-block bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-sm">
                    <span>Pilih File Kontrak</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleContractFileSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Upload Optional */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-all bg-slate-50/50">
                <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto mb-3">
                  <Paperclip className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Upload Optional (Tambahan)</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Addendum, NDA, NPWP, Portofolio, atau BAST Termin (Opsional)
                </p>

                {optionalFileName ? (
                  <div className="flex items-center justify-between bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-left">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {optionalFileName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOptionalFileName('');
                        setOptionalFileUrl('');
                      }}
                      className="text-slate-400 hover:text-rose-500 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="inline-block bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-sm">
                    <span>Pilih Lampiran Tambahan</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xlsx,.png,.jpg"
                      onChange={handleOptionalFileSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Catatan Tambahan */}
            <div className="mt-6">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Catatan / Klausul Penting (Opsional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan klausul perpanjangan, syarat adendum, SLA penalti, atau nomor rekening vendor..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-2.5 rounded-xl shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan ke Sheets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Simpan Kontrak Vendor</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
