import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Phone, 
  Mail, 
  ExternalLink, 
  ArrowUpRight, 
  DollarSign, 
  Building2, 
  ChevronRight, 
  Download, 
  RefreshCw, 
  Calendar,
  Share2,
  FileCheck,
  Eye,
  Plus
} from 'lucide-react';
import { Contract, ContractStatus, DepartmentConfig } from '../types';
import { formatRupiah, calculateContractStatus, getWhatsAppUrl } from '../services/contractService';

interface DashboardViewProps {
  contracts: Contract[];
  departments: DepartmentConfig[];
  onOpenContractDetail: (contract: Contract) => void;
  onOpenRenewModal: (contract: Contract) => void;
  onSendContractEmail: (contract: Contract) => void;
  onNavigateToForm: () => void;
  onNavigateToAppsScript: () => void;
  spreadsheetUrl: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  contracts,
  departments,
  onOpenContractDetail,
  onOpenRenewModal,
  onSendContractEmail,
  onNavigateToForm,
  onNavigateToAppsScript,
  spreadsheetUrl,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'expired_asc' | 'expired_desc' | 'nominal_desc' | 'vendor_asc'>('expired_asc');

  // Calculations
  const stats = useMemo(() => {
    let totalNominal = 0;
    let critical = 0; // <= 7 days
    let expiringSoon = 0; // 8 - 30 days
    let active = 0; // > 30 days
    let expired = 0;

    contracts.forEach((c) => {
      totalNominal += c.nominalContract || 0;
      const { status, daysLeft } = calculateContractStatus(c.expiredDate);
      if (status === 'expired' || daysLeft < 0) {
        expired++;
      } else if (daysLeft <= 7) {
        critical++;
      } else if (daysLeft <= 30) {
        expiringSoon++;
      } else {
        active++;
      }
    });

    return {
      total: contracts.length,
      totalNominal,
      critical,
      expiringSoon,
      active,
      expired,
    };
  }, [contracts]);

  // Filtered & Sorted contracts
  const filteredContracts = useMemo(() => {
    return contracts
      .filter((c) => {
        const matchesSearch =
          c.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.picName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = selectedDept === 'all' || c.department === selectedDept;

        const { status, daysLeft } = calculateContractStatus(c.expiredDate);
        let matchesStatus = true;
        if (selectedStatus === 'critical') {
          matchesStatus = daysLeft >= 0 && daysLeft <= 7;
        } else if (selectedStatus === 'expiring_soon') {
          matchesStatus = daysLeft > 7 && daysLeft <= 30;
        } else if (selectedStatus === 'active') {
          matchesStatus = daysLeft > 30;
        } else if (selectedStatus === 'expired') {
          matchesStatus = daysLeft < 0;
        }

        return matchesSearch && matchesDept && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'expired_asc') {
          return new Date(a.expiredDate).getTime() - new Date(b.expiredDate).getTime();
        }
        if (sortBy === 'expired_desc') {
          return new Date(b.expiredDate).getTime() - new Date(a.expiredDate).getTime();
        }
        if (sortBy === 'nominal_desc') {
          return (b.nominalContract || 0) - (a.nominalContract || 0);
        }
        if (sortBy === 'vendor_asc') {
          return a.vendorName.localeCompare(b.vendorName);
        }
        return 0;
      });
  }, [contracts, searchTerm, selectedDept, selectedStatus, sortBy]);

  // Critical Contracts for Top Alert Banner
  const criticalContracts = useMemo(() => {
    return contracts
      .map((c) => ({ ...c, ...calculateContractStatus(c.expiredDate) }))
      .filter((c) => c.daysLeft >= 0 && c.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [contracts]);

  // Department Distribution stats
  const deptSummary = useMemo(() => {
    const summary: Record<string, { count: number; totalNominal: number }> = {};
    contracts.forEach((c) => {
      const d = c.department || 'Other';
      if (!summary[d]) {
        summary[d] = { count: 0, totalNominal: 0 };
      }
      summary[d].count++;
      summary[d].totalNominal += c.nominalContract || 0;
    });
    return summary;
  }, [contracts]);

  const exportToCSV = () => {
    const headers = ['ID Kontrak', 'No Kontrak', 'Nama Vendor', 'Tgl Awal', 'Tgl Expired', 'Department', 'Nominal', 'Nama PIC', 'No PIC', 'Email PIC', 'Status'];
    const rows = filteredContracts.map(c => [
      c.id,
      `"${c.contractNumber}"`,
      `"${c.vendorName}"`,
      c.startDate,
      c.expiredDate,
      `"${c.department}"`,
      c.nominalContract,
      `"${c.picName}"`,
      `"${c.picPhone}"`,
      `"${c.picEmail}"`,
      c.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Kontrak_Vendor_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Operational Dashboard: Monitoring Kontrak Vendor</span>
          </h1>
          <p className="text-sm text-slate-500">
            Pemantauan real-time status aktif kontrak, jatuh tempo otomatis, dan integrasi Google Sheets.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer transition-all"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onNavigateToForm}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Kontrak Baru</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Banner (if any) */}
      {criticalContracts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-600/30">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-rose-900">
                  Perhatian Manajer Operasional: {criticalContracts.length} Kontrak Masuk Fase Kritis (≤ 7 Hari)
                </h3>
                <span className="text-xs bg-rose-200/80 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                  Urgent Attention
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-1">
                Kontrak ini membutuhkan tindakan segera sebelum masa aktif terputus. Segera kirim reminder email atau hubungi PIC via WhatsApp:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {criticalContracts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onOpenContractDetail(c)}
                    className="inline-flex items-center space-x-2 bg-white/90 hover:bg-white text-rose-900 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer shadow-xs transition-all"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-bold">{c.vendorName}</span>
                    <span className="text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {c.daysLeft === 0 ? 'Hari H!' : `H-${c.daysLeft}`}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Kontrak */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kontrak</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.total}</div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Tersimpan di Google Sheets
          </p>
        </div>

        {/* Total Nilai Kontrak */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Nominal</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 truncate">
            {formatRupiah(stats.totalNominal)}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Akumulasi nilai kerja sama
          </p>
        </div>

        {/* Kritis <= 7 Hari */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'critical' ? 'all' : 'critical')}
          className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs cursor-pointer transition-all ${
            selectedStatus === 'critical' ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Kritis (≤7 Hari)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{stats.critical}</div>
          <p className="text-[11px] text-rose-500 font-medium mt-1">
            Prioritas tindakan hari ini
          </p>
        </div>

        {/* Mendekati Expired (8-30 Hari) */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'expiring_soon' ? 'all' : 'expiring_soon')}
          className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs cursor-pointer transition-all ${
            selectedStatus === 'expiring_soon' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Mendekati (≤30 H)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{stats.expiringSoon}</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            Siapkan proses negosiasi
          </p>
        </div>

        {/* Kadaluarsa */}
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'expired' ? 'all' : 'expired')}
          className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs cursor-pointer transition-all ${
            selectedStatus === 'expired' ? 'border-slate-500 ring-2 ring-slate-200' : 'border-slate-200 hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expired</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-700">{stats.expired}</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Butuh adendum / arsip
          </p>
        </div>
      </div>

      {/* Distribution by Department Quick Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Ringkasan Alokasi per Departemen
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(deptSummary).map(([deptName, d]) => (
            <div
              key={deptName}
              onClick={() => setSelectedDept(selectedDept === deptName ? 'all' : deptName)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                selectedDept === deptName
                  ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/60'
              }`}
            >
              <p className="text-xs font-bold text-slate-800 truncate" title={deptName}>
                {deptName.replace(/\(.*?\)/, '')}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-extrabold text-blue-600">{d.count} Kontrak</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                {formatRupiah(d.totalNominal)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari vendor, no kontrak, atau PIC..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
          >
            <option value="all">Semua Departemen</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.departmentName}>
                {dept.departmentName}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="critical">Kritis (≤ 7 Hari)</option>
            <option value="expiring_soon">Mendekati Expired (8-30 Hari)</option>
            <option value="active">Aktif Aman (&gt; 30 Hari)</option>
            <option value="expired">Sudah Expired</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
          >
            <option value="expired_asc">Jatuh Tempo Terdekat</option>
            <option value="expired_desc">Jatuh Tempo Terjauh</option>
            <option value="nominal_desc">Nominal Tertinggi</option>
            <option value="vendor_asc">Nama Vendor (A-Z)</option>
          </select>

          {(searchTerm || selectedDept !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDept('all');
                setSelectedStatus('all');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Real-Time Contracts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-5">Vendor & No. Kontrak</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Masa Kontrak</th>
                <th className="py-3.5 px-4">Status & Sisa Hari</th>
                <th className="py-3.5 px-4">Nominal Kontrak</th>
                <th className="py-3.5 px-4">PIC & Kontak</th>
                <th className="py-3.5 px-4 text-center">Dokumen</th>
                <th className="py-3.5 px-5 text-right">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ditemukan kontrak dengan kriteria pencarian yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => {
                  const { status, daysLeft } = calculateContractStatus(contract.expiredDate);
                  const isCritical = daysLeft >= 0 && daysLeft <= 7;
                  const isExpiring = daysLeft > 7 && daysLeft <= 30;
                  const isExpired = daysLeft < 0;

                  return (
                    <tr
                      key={contract.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCritical ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Vendor Name & Contract Number */}
                      <td className="py-3.5 px-5">
                        <div
                          onClick={() => onOpenContractDetail(contract)}
                          className="cursor-pointer group"
                        >
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center space-x-1.5">
                            <span>{contract.vendorName}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {contract.contractNumber || contract.id}
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium truncate max-w-[140px]" title={contract.department}>
                          {contract.department.replace(/\(.*?\)/, '')}
                        </span>
                      </td>

                      {/* Start - Expired Date */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-medium">
                          {new Date(contract.expiredDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Mulai: {new Date(contract.startDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Status & Sisa Hari */}
                      <td className="py-3.5 px-4">
                        {isExpired ? (
                          <span className="inline-flex items-center space-x-1 bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3 text-slate-500" />
                            <span>Expired ({Math.abs(daysLeft)} hr lalu)</span>
                          </span>
                        ) : isCritical ? (
                          <span className="inline-flex items-center space-x-1 bg-rose-100 text-rose-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>{daysLeft === 0 ? 'Hari Ini Expired!' : `Kritis (${daysLeft} Hari)`}</span>
                          </span>
                        ) : isExpiring ? (
                          <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Sisa {daysLeft} Hari</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Aktif ({daysLeft} Hari)</span>
                          </span>
                        )}
                      </td>

                      {/* Nominal */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">
                          {formatRupiah(contract.nominalContract)}
                        </span>
                      </td>

                      {/* PIC & Quick Contact */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-semibold">{contract.picName}</div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {contract.picPhone}
                          </span>
                          {contract.picPhone && (
                            <a
                              href={getWhatsAppUrl(contract.picPhone, contract.vendorName, contract.contractNumber, daysLeft)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded bg-emerald-50 hover:bg-emerald-100"
                              title="Chat WhatsApp PIC"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Uploaded Documents Indicator */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {contract.contractFileName ? (
                            <span 
                              className="text-blue-600 hover:text-blue-700 p-1 bg-blue-50 rounded cursor-pointer"
                              title={`Kontrak: ${contract.contractFileName}`}
                              onClick={() => onOpenContractDetail(contract)}
                            >
                              <FileCheck className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}

                          {contract.optionalFileName && (
                            <span 
                              className="text-emerald-600 hover:text-emerald-700 p-1 bg-emerald-50 rounded cursor-pointer"
                              title={`Optional: ${contract.optionalFileName}`}
                              onClick={() => onOpenContractDetail(contract)}
                            >
                              <FileText className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Send email reminder */}
                          <button
                            onClick={() => onSendContractEmail(contract)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Kirim Peringatan Email Sekarang"
                          >
                            <Mail className="w-4 h-4" />
                          </button>

                          {/* Detail */}
                          <button
                            onClick={() => onOpenContractDetail(contract)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Lengkap"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Renew button */}
                          <button
                            onClick={() => onOpenRenewModal(contract)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Perpanjang / Renew Kontrak"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Menampilkan <span className="font-bold text-slate-700">{filteredContracts.length}</span> dari{' '}
            <span className="font-bold text-slate-700">{contracts.length}</span> kontrak vendor aktif.
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1"
            >
              <span>Sinkronisasi Google Sheet</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
