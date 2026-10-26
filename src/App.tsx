/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { FormInputView } from './components/FormInputView';
import { ManageUserView } from './components/ManageUserView';
import { SettingsView } from './components/SettingsView';
import { AppsScriptGuideView } from './components/AppsScriptGuideView';
import { ContractDetailModal } from './components/ContractDetailModal';
import { RenewContractModal } from './components/RenewContractModal';
import { TriggerSimulatorModal } from './components/TriggerSimulatorModal';

import { 
  Contract, 
  AppUser, 
  DepartmentConfig, 
  NotificationIntervalConfig, 
  SheetIntegrationConfig, 
  UserRole,
  EmailLog
} from './types';
import { ContractStorageManager, calculateContractStatus } from './services/contractService';
import { CheckCircle2, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'users' | 'settings' | 'apps-script'>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('super_admin');

  // Application Data States
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [departments, setDepartments] = useState<DepartmentConfig[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationIntervalConfig>(
    ContractStorageManager.getNotificationSettings()
  );
  const [sheetConfig, setSheetConfig] = useState<SheetIntegrationConfig>(
    ContractStorageManager.getSheetConfig()
  );

  // Modals
  const [selectedContractForDetail, setSelectedContractForDetail] = useState<Contract | null>(null);
  const [selectedContractForRenew, setSelectedContractForRenew] = useState<Contract | null>(null);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Initial Data
  useEffect(() => {
    setContracts(ContractStorageManager.getContracts());
    setUsers(ContractStorageManager.getUsers());
    setDepartments(ContractStorageManager.getDepartments());
    setNotificationSettings(ContractStorageManager.getNotificationSettings());
    setSheetConfig(ContractStorageManager.getSheetConfig());
  }, []);

  // Contract actions
  const handleAddContract = (newContractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const created = ContractStorageManager.addContract(newContractData);
    setContracts(ContractStorageManager.getContracts());
    showToast(`Kontrak ${created.vendorName} berhasil dicatat & disinkronkan ke Sheets!`);
  };

  const handleUpdateContract = (id: string, updates: Partial<Contract>) => {
    ContractStorageManager.updateContract(id, updates);
    setContracts(ContractStorageManager.getContracts());
    showToast('Data kontrak berhasil diperbarui.');
  };

  const handleRenewContract = (id: string, updates: Partial<Contract>) => {
    ContractStorageManager.updateContract(id, updates);
    setContracts(ContractStorageManager.getContracts());
    showToast('Kontrak vendor berhasil diperpanjang (Renewed)!');
  };

  const handleSendContractEmail = (contract: Contract) => {
    const { daysLeft } = calculateContractStatus(contract.expiredDate);
    ContractStorageManager.addEmailLog({
      contractId: contract.id,
      vendorName: contract.vendorName,
      recipientEmail: contract.picEmail || `${contract.picName.toLowerCase().replace(/\s+/g, '')}@vendor.com`,
      recipientRole: 'Vendor PIC',
      subject: `[PENGINGAT KONTRAK] Masa Berlaku Kontrak ${contract.vendorName} Sisa ${daysLeft} Hari`,
      daysLeft,
      status: 'sent',
    });
    showToast(`Email pengingat masa kontrak berhasil dikirim ke PIC ${contract.picName}!`);
  };

  // User actions
  const handleAddUser = (userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    const newUser = ContractStorageManager.addUser(userData);
    setUsers(ContractStorageManager.getUsers());
    showToast(`Akun user ${newUser.name} (${newUser.role}) berhasil ditambahkan.`);
  };

  const handleUpdateUser = (id: string, updates: Partial<AppUser>) => {
    ContractStorageManager.updateUser(id, updates);
    setUsers(ContractStorageManager.getUsers());
    showToast('Data akun user berhasil diperbarui.');
  };

  const handleDeleteUser = (id: string) => {
    ContractStorageManager.deleteUser(id);
    setUsers(ContractStorageManager.getUsers());
    showToast('User berhasil dihapus.');
  };

  const handleSendTestEmail = (email: string, userName: string) => {
    showToast(`Email pengujian berhasil dikirim ke ${userName} (${email})!`);
  };

  // Settings actions
  const handleSaveDepartments = (depts: DepartmentConfig[]) => {
    ContractStorageManager.saveDepartments(depts);
    setDepartments(depts);
    showToast('Daftar departemen & email sender berhasil disimpan.');
  };

  const handleSaveNotificationSettings = (settings: NotificationIntervalConfig) => {
    ContractStorageManager.saveNotificationSettings(settings);
    setNotificationSettings(settings);
    showToast('Konfigurasi interval notifikasi berhasil diperbarui.');
  };

  const handleSaveSheetConfig = (config: SheetIntegrationConfig) => {
    ContractStorageManager.saveSheetConfig(config);
    setSheetConfig(config);
    showToast('Pengaturan Google Sheets berhasil disimpan.');
  };

  const handleLogGenerated = (log: Omit<EmailLog, 'id' | 'timestamp'>) => {
    ContractStorageManager.addEmailLog(log);
  };

  // Critical contracts count for badge
  const criticalCount = contracts.filter((c) => {
    const { daysLeft } = calculateContractStatus(c.expiredDate);
    return daysLeft >= 0 && daysLeft <= 7;
  }).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        spreadsheetUrl={sheetConfig.spreadsheetUrl}
        criticalCount={criticalCount}
        onOpenTriggerModal={() => setIsTriggerModalOpen(true)}
      />

      {/* Main Content Views */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView
            contracts={contracts}
            departments={departments}
            onOpenContractDetail={(c) => setSelectedContractForDetail(c)}
            onOpenRenewModal={(c) => setSelectedContractForRenew(c)}
            onSendContractEmail={handleSendContractEmail}
            onNavigateToForm={() => setActiveTab('form')}
            onNavigateToAppsScript={() => setActiveTab('apps-script')}
            spreadsheetUrl={sheetConfig.spreadsheetUrl}
          />
        )}

        {activeTab === 'form' && (
          <FormInputView
            departments={departments}
            onSubmitContract={handleAddContract}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            spreadsheetUrl={sheetConfig.spreadsheetUrl}
          />
        )}

        {activeTab === 'users' && (
          <ManageUserView
            users={users}
            departments={departments}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onSendTestEmail={handleSendTestEmail}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            departments={departments}
            onSaveDepartments={handleSaveDepartments}
            notificationSettings={notificationSettings}
            onSaveNotificationSettings={handleSaveNotificationSettings}
            sheetConfig={sheetConfig}
            onSaveSheetConfig={handleSaveSheetConfig}
            onOpenAppsScriptTab={() => setActiveTab('apps-script')}
          />
        )}

        {activeTab === 'apps-script' && (
          <AppsScriptGuideView
            spreadsheetUrl={sheetConfig.spreadsheetUrl}
            spreadsheetId={sheetConfig.spreadsheetId}
            onOpenTriggerSimulator={() => setIsTriggerModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            &copy; {new Date().getFullYear()} VendorContract Pro &bull; Terintegrasi Google Sheets & Google Apps Script
          </p>
          <div className="flex items-center space-x-4 text-slate-400">
            <span className="font-mono text-[11px]">DB: 18RpeSEBHm-xQm1eYEzn36KJvm7USvyU6w0yzo-64-K4</span>
            <span>&bull;</span>
            <button 
              onClick={() => setIsTriggerModalOpen(true)} 
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Uji Trigger Harian
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ContractDetailModal
        contract={selectedContractForDetail}
        onClose={() => setSelectedContractForDetail(null)}
        onOpenRenewModal={(c) => setSelectedContractForRenew(c)}
        onSendContractEmail={handleSendContractEmail}
      />

      <RenewContractModal
        contract={selectedContractForRenew}
        onClose={() => setSelectedContractForRenew(null)}
        onConfirmRenew={handleRenewContract}
      />

      <TriggerSimulatorModal
        isOpen={isTriggerModalOpen}
        onClose={() => setIsTriggerModalOpen(false)}
        contracts={contracts}
        departments={departments}
        notificationSettings={notificationSettings}
        onLogGenerated={handleLogGenerated}
        spreadsheetId={sheetConfig.spreadsheetId}
      />
    </div>
  );
}
