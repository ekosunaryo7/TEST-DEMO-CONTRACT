export type ContractStatus = 'active' | 'expiring_soon' | 'critical' | 'expired' | 'renewed' | 'draft';

export type UserRole = 'super_admin' | 'operational_manager' | 'department_pic' | 'auditor';

export interface Contract {
  id: string;
  contractNumber: string;
  vendorName: string;
  startDate: string; // YYYY-MM-DD
  expiredDate: string; // YYYY-MM-DD
  department: string;
  nominalContract: number;
  picName: string;
  picPhone: string;
  picEmail: string;
  contractFileUrl?: string;
  contractFileName?: string;
  optionalFileUrl?: string;
  optionalFileName?: string;
  status: ContractStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  renewedFromId?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string; // 'All' or specific department
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface DepartmentConfig {
  id: string;
  departmentName: string;
  senderName: string;
  senderEmail: string;
  managerEmail: string;
  ccEmails: string[]; // Additional CC emails
  color: string;
}

export interface NotificationIntervalConfig {
  intervals: number[]; // e.g. [60, 30, 14, 7, 3, 1, 0]
  sendTimeHour: number; // e.g. 8 for 08:00 AM
  enableCcManager: boolean;
  enablePicWhatsappReminder: boolean;
  emailSubjectTemplate: string;
  emailHeaderTitle: string;
  customFooterNote: string;
}

export interface EmailLog {
  id: string;
  contractId: string;
  vendorName: string;
  recipientEmail: string;
  recipientRole: string;
  subject: string;
  daysLeft: number;
  status: 'sent' | 'failed' | 'simulated';
  timestamp: string;
}

export interface SheetIntegrationConfig {
  spreadsheetUrl: string;
  spreadsheetId: string;
  webAppUrl: string;
  sheetName: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}
