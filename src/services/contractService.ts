import { Contract, AppUser, DepartmentConfig, NotificationIntervalConfig, EmailLog, SheetIntegrationConfig, ContractStatus } from '../types';
import { INITIAL_CONTRACTS, INITIAL_USERS, INITIAL_DEPARTMENTS, INITIAL_NOTIFICATION_SETTINGS, INITIAL_EMAIL_LOGS, INITIAL_SPREADSHEET_CONFIG } from '../data/initialData';

const STORAGE_KEYS = {
  CONTRACTS: 'vendor_contracts_data_v1',
  USERS: 'vendor_users_data_v1',
  DEPARTMENTS: 'vendor_departments_data_v1',
  SETTINGS: 'vendor_settings_data_v1',
  EMAIL_LOGS: 'vendor_email_logs_v1',
  SHEET_CONFIG: 'vendor_sheet_config_v1',
};

// Hitung status kontrak berdasarkan tanggal expired terhadap tanggal hari ini
export function calculateContractStatus(expiredDateStr: string): { status: ContractStatus; daysLeft: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDate = new Date(expiredDateStr);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { status: 'expired', daysLeft };
  } else if (daysLeft <= 7) {
    return { status: 'critical', daysLeft };
  } else if (daysLeft <= 30) {
    return { status: 'expiring_soon', daysLeft };
  }
  return { status: 'active', daysLeft };
}

// Format Rupiah
export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format WhatsApp Phone
export function getWhatsAppUrl(phone: string, vendorName: string, contractNumber: string, daysLeft: number): string {
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1);
  }
  const message = encodeURIComponent(
    `Halo Bapak/Ibu PIC Vendor ${vendorName},\n\nKami dari Divisi Operasional ingin mengonfirmasikan masa berlaku kontrak kerja sama No. *${contractNumber}* yang akan berakhir dalam *${daysLeft} hari*. Mohon kesediaannya untuk koordinasi evaluasi dan proses perpanjangan kontrak.\n\nTerima kasih.`
  );
  return `https://wa.me/${cleanPhone}?text=${message}`;
}

export class ContractStorageManager {
  static getContracts(): Contract[] {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(INITIAL_CONTRACTS));
      return INITIAL_CONTRACTS;
    }
    try {
      const parsed: Contract[] = JSON.parse(saved);
      // Auto-update status based on current date
      return parsed.map(c => {
        const { status } = calculateContractStatus(c.expiredDate);
        return { ...c, status: c.status === 'renewed' ? 'renewed' : status };
      });
    } catch {
      return INITIAL_CONTRACTS;
    }
  }

  static saveContracts(contracts: Contract[]): void {
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
  }

  static addContract(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Contract {
    const current = this.getContracts();
    const { status } = calculateContractStatus(contract.expiredDate);
    const newId = `CTR-${new Date().getFullYear()}-${String(current.length + 1).padStart(3, '0')}`;
    
    const newContract: Contract = {
      ...contract,
      id: newId,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newContract, ...current];
    this.saveContracts(updated);
    return newContract;
  }

  static updateContract(id: string, updates: Partial<Contract>): Contract | null {
    const current = this.getContracts();
    const index = current.findIndex(c => c.id === id);
    if (index === -1) return null;

    const existing = current[index];
    const newExpiredDate = updates.expiredDate || existing.expiredDate;
    const { status } = calculateContractStatus(newExpiredDate);

    const updatedContract: Contract = {
      ...existing,
      ...updates,
      status: updates.status || status,
      updatedAt: new Date().toISOString(),
    };

    current[index] = updatedContract;
    this.saveContracts(current);
    return updatedContract;
  }

  static deleteContract(id: string): boolean {
    const current = this.getContracts();
    const filtered = current.filter(c => c.id !== id);
    if (filtered.length !== current.length) {
      this.saveContracts(filtered);
      return true;
    }
    return false;
  }

  // Users
  static getUsers(): AppUser[] {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_USERS;
    }
  }

  static saveUsers(users: AppUser[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static addUser(user: Omit<AppUser, 'id' | 'createdAt'>): AppUser {
    const users = this.getUsers();
    const newUser: AppUser = {
      ...user,
      id: `usr-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newUser, ...users];
    this.saveUsers(updated);
    return newUser;
  }

  static updateUser(id: string, updates: Partial<AppUser>): AppUser | null {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    this.saveUsers(users);
    return users[idx];
  }

  static deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length !== users.length) {
      this.saveUsers(filtered);
      return true;
    }
    return false;
  }

  // Departments
  static getDepartments(): DepartmentConfig[] {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
      return INITIAL_DEPARTMENTS;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_DEPARTMENTS;
    }
  }

  static saveDepartments(depts: DepartmentConfig[]): void {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(depts));
  }

  // Settings
  static getNotificationSettings(): NotificationIntervalConfig {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_NOTIFICATION_SETTINGS));
      return INITIAL_NOTIFICATION_SETTINGS;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_NOTIFICATION_SETTINGS;
    }
  }

  static saveNotificationSettings(settings: NotificationIntervalConfig): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Email Logs
  static getEmailLogs(): EmailLog[] {
    const saved = localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(INITIAL_EMAIL_LOGS));
      return INITIAL_EMAIL_LOGS;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_EMAIL_LOGS;
    }
  }

  static addEmailLog(log: Omit<EmailLog, 'id' | 'timestamp'>): EmailLog {
    const logs = this.getEmailLogs();
    const newLog: EmailLog = {
      ...log,
      id: `LOG-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...logs];
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(updated));
    return newLog;
  }

  // Sheet Config
  static getSheetConfig(): SheetIntegrationConfig {
    const saved = localStorage.getItem(STORAGE_KEYS.SHEET_CONFIG);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(INITIAL_SPREADSHEET_CONFIG));
      return INITIAL_SPREADSHEET_CONFIG;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_SPREADSHEET_CONFIG;
    }
  }

  static saveSheetConfig(config: SheetIntegrationConfig): void {
    localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(config));
  }
}
