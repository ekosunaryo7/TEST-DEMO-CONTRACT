import React from 'react';
import { 
  X, 
  Building2, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  FileText, 
  Paperclip, 
  ExternalLink, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Send
} from 'lucide-react';
import { Contract } from '../types';
import { formatRupiah, calculateContractStatus, getWhatsAppUrl } from '../services/contractService';

interface ContractDetailModalProps {
  contract: Contract | null;
  onClose: () => void;
  onOpenRenewModal: (contract: Contract) => void;
  onSendContractEmail: (contract: Contract) => void;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
  contract,
  onClose,
  onOpenRenewModal,
  onSendContractEmail,
}) => {
  if (!contract) return null;

  const { status, daysLeft } = calculateContractStatus(contract.expiredDate);
  const isCritical = daysLeft >= 0 && daysLeft <= 7;
  const isExpiring = daysLeft > 7 && daysLeft <= 30;
  const isExpired = daysLeft < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
            <span>{contract.department}</span>
            <span>&bull;</span>
            <span className="font-mono text-slate-400">{contract.contractNumber || contract.id}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {contract.vendorName}
          </h2>

          <div className="mt-3 flex items-center space-x-2">
            {isExpired ? (
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                Masa Berlaku Telah Berakhir ({Math.abs(daysLeft)} hari lalu)
              </span>
            ) : isCritical ? (
              <span className="bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Status Kritis: {daysLeft === 0 ? 'Hari Ini Jatuh Tempo!' : `Tersisa ${daysLeft} Hari Lagi`}</span>
              </span>
            ) : isExpiring ? (
              <span className="bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Mendekati Expired: Sisa {daysLeft} Hari</span>
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Aktif Aman: Sisa {daysLeft} Hari</span>
              </span>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-6">
          {/* Section: Waktu & Finansial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Tanggal Mulai Kontrak:</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                {new Date(contract.startDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Tanggal Jatuh Tempo:</span>
              <p className={`font-bold text-sm mt-0.5 ${isCritical ? 'text-rose-600' : 'text-slate-800'}`}>
                {new Date(contract.expiredDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Nilai Total Kontrak:</span>
              <p className="font-extrabold text-blue-600 text-base mt-0.5">
                {formatRupiah(contract.nominalContract)}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Tersimpan di Sheet:</span>
              <p className="font-mono text-slate-600 text-xs mt-1 truncate">
                Tab `Contracts` &bull; ID: {contract.id}
              </p>
            </div>
          </div>

          {/* Section: PIC Vendor */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Informasi PIC Vendor
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900 text-sm">{contract.picName}</p>
                <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                  <span>Telp: {contract.picPhone || '-'}</span>
                  <span>&bull;</span>
                  <span>Email: {contract.picEmail || '-'}</span>
                </div>
              </div>

              {contract.picPhone && (
                <a
                  href={getWhatsAppUrl(contract.picPhone, contract.vendorName, contract.contractNumber, daysLeft)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Chat WhatsApp PIC</span>
                </a>
              )}
            </div>
          </div>

          {/* Section: Lampiran Dokumen */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Lampiran Dokumen Kontrak & Upload Optional
            </h3>

            <div className="space-y-2.5">
              {/* Main contract file */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 truncate">
                      {contract.contractFileName || 'Dokumen_Kontrak_Vendor.pdf'}
                    </p>
                    <p className="text-[10px] text-slate-400">File Dokumen Utama Kontrak</p>
                  </div>
                </div>

                <a
                  href={contract.contractFileUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <span>Buka File</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Optional File */}
              {contract.optionalFileName && (
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Paperclip className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 truncate">
                        {contract.optionalFileName}
                      </p>
                      <p className="text-[10px] text-slate-400">Lampiran Optional / Addendum / BAST</p>
                    </div>
                  </div>

                  <a
                    href={contract.optionalFileUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:text-emerald-800 font-semibold flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <span>Buka File</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Catatan */}
          {contract.notes && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 text-xs">
              <h4 className="font-bold text-amber-900 mb-1">Catatan Khusus Kontrak:</h4>
              <p className="text-amber-800 leading-relaxed">{contract.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenRenewModal(contract);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Perpanjang / Renew Kontrak</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onSendContractEmail(contract);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Email Pengingat</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
