import React, { useState } from 'react';
import { X, RefreshCw, Calendar, AlertCircle, Check, DollarSign } from 'lucide-react';
import { Contract } from '../types';
import { formatRupiah } from '../services/contractService';

interface RenewContractModalProps {
  contract: Contract | null;
  onClose: () => void;
  onConfirmRenew: (contractId: string, updates: Partial<Contract>) => void;
}

export const RenewContractModal: React.FC<RenewContractModalProps> = ({
  contract,
  onClose,
  onConfirmRenew,
}) => {
  if (!contract) return null;

  // Defaults: new start date = previous expired date, new expired date = +1 year
  const prevExp = new Date(contract.expiredDate);
  const nextStart = contract.expiredDate;
  const nextExpDate = new Date(prevExp);
  nextExpDate.setFullYear(nextExpDate.getFullYear() + 1);
  const nextExpStr = nextExpDate.toISOString().split('T')[0];

  const [newStartDate, setNewStartDate] = useState(nextStart);
  const [newExpiredDate, setNewExpiredDate] = useState(nextExpStr);
  const [newNominalRaw, setNewNominalRaw] = useState(
    new Intl.NumberFormat('id-ID').format(contract.nominalContract)
  );
  const [newContractNumber, setNewContractNumber] = useState(
    `${contract.contractNumber}-REN1`
  );
  const [renewalNotes, setRenewalNotes] = useState(
    `Perpanjangan masa kerja sama untuk periode ${newStartDate} s/d ${newExpiredDate}.`
  );
  const [error, setError] = useState('');

  const nominalNumber = parseInt(newNominalRaw.replace(/\D/g, '') || '0', 10);

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setNewNominalRaw(val ? new Intl.NumberFormat('id-ID').format(parseInt(val, 10)) : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartDate || !newExpiredDate) {
      setError('Tanggal mulai dan expired baru wajib diisi');
      return;
    }
    if (new Date(newExpiredDate) <= new Date(newStartDate)) {
      setError('Tanggal expired harus setelah tanggal mulai baru');
      return;
    }

    onConfirmRenew(contract.id, {
      startDate: newStartDate,
      expiredDate: newExpiredDate,
      nominalContract: nominalNumber,
      contractNumber: newContractNumber,
      notes: `${contract.notes ? contract.notes + '\n' : ''}[RENEWAL]: ${renewalNotes}`,
      status: 'active',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Perpanjangan Kontrak (Renewal)</h2>
            <p className="text-xs text-slate-500">{contract.vendorName}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Nomor Dokumen Perpanjangan / Adendum
            </label>
            <input
              type="text"
              value={newContractNumber}
              onChange={(e) => setNewContractNumber(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Tanggal Mulai Baru
              </label>
              <input
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Tanggal Expired Baru (+1 Thn)
              </label>
              <input
                type="date"
                value={newExpiredDate}
                onChange={(e) => setNewExpiredDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Nominal Kontrak Baru (Rupiah)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                Rp
              </div>
              <input
                type="text"
                value={newNominalRaw}
                onChange={handleNominalChange}
                className="w-full pl-10 pr-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
              />
            </div>
            {nominalNumber > 0 && (
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">
                {formatRupiah(nominalNumber)}
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Catatan Negosiasi / Adendum
            </label>
            <textarea
              rows={2}
              value={renewalNotes}
              onChange={(e) => setRenewalNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Simpan & Aktifkan Perpanjangan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
