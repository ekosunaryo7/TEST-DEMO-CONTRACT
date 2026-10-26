/**
 * Production-ready Google Apps Script Code
 * Targeted for Spreadsheet ID: 18RpeSEBHm-xQm1eYEzn36KJvm7USvyU6w0yzo-64-K4
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ============================================================================
 * VENDOR CONTRACT PRO - GOOGLE APPS SCRIPT DATABASE & EMAIL NOTIFIER
 * Database Spreadsheet: https://docs.google.com/spreadsheets/d/18RpeSEBHm-xQm1eYEzn36KJvm7USvyU6w0yzo-64-K4/edit
 * ============================================================================
 */

// Konfigurasi ID Spreadsheet Target
const SPREADSHEET_ID = "18RpeSEBHm-xQm1eYEzn36KJvm7USvyU6w0yzo-64-K4";

// Nama-nama Sheet / Tab Database
const SHEETS = {
  CONTRACTS: "Contracts",
  USERS: "Users",
  DEPARTMENTS: "Settings_Dept",
  SETTINGS: "Notification_Settings",
  LOGS: "Email_Logs"
};

// Interval Notifikasi Default (Hari sebelum Expired)
const DEFAULT_INTERVALS = [60, 30, 14, 7, 3, 1, 0];

/**
 * Menu Kustom di UI Google Sheets saat file spreadsheet dibuka
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🏢 Vendor Contract Pro")
    .addItem("🔔 Cek & Kirim Email Reminder Sekarang", "checkAndSendContractExpiryReminders")
    .addSeparator()
    .addItem("⚙️ Setup Sheet & Header Otomatis", "setupDatabaseSheets")
    .addItem("⏰ Aktifkan Trigger Otomatis Harian (08.00 WIB)", "createDailyTimeTrigger")
    .addItem("📊 Tampilkan Ringkasan Dashboard", "showContractSummaryPopup")
    .addToUi();
}

/**
 * 1. INISIALISASI DATABASE SPREADSHEET
 * Membuat tab sheet dan header standar jika belum ada
 */
function setupDatabaseSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Sheet Contracts
  let sheetContracts = ss.getSheetByName(SHEETS.CONTRACTS);
  if (!sheetContracts) {
    sheetContracts = ss.insertSheet(SHEETS.CONTRACTS);
  }
  const contractHeaders = [
    ["ID Kontrak", "No. Kontrak", "Nama Vendor", "Tanggal Awal", "Tanggal Expired", 
     "Department", "Nominal Kontrak (Rp)", "Nama PIC", "Nomor PIC", "Email PIC", 
     "Upload Kontrak URL", "Upload Optional URL", "Status", "Sisa Hari", "Catatan", "Terakhir Diupdate"]
  ];
  sheetContracts.getRange(1, 1, 1, contractHeaders[0].length).setValues(contractHeaders);
  formatHeaderRow(sheetContracts, contractHeaders[0].length, "#1E3A8A"); // Navy blue

  // 2. Sheet Users
  let sheetUsers = ss.getSheetByName(SHEETS.USERS);
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet(SHEETS.USERS);
  }
  const userHeaders = [["ID User", "Nama Lengkap", "Email", "Role", "Department", "Status", "Tanggal Terdaftar"]];
  sheetUsers.getRange(1, 1, 1, userHeaders[0].length).setValues(userHeaders);
  formatHeaderRow(sheetUsers, userHeaders[0].length, "#065F46"); // Emerald green

  // Tambahkan user default admin jika kosong
  if (sheetUsers.getLastRow() === 1) {
    sheetUsers.appendRow([
      "usr-001", "Eko Sunaryo", "ekosunaryo7@gmail.com", "Super Admin", "All", "Active", new Date()
    ]);
  }

  // 3. Sheet Settings_Dept
  let sheetDept = ss.getSheetByName(SHEETS.DEPARTMENTS);
  if (!sheetDept) {
    sheetDept = ss.insertSheet(SHEETS.DEPARTMENTS);
  }
  const deptHeaders = [["Kode Dept", "Nama Department", "Sender Name", "Sender Email", "Manager Email", "CC Emails"]];
  sheetDept.getRange(1, 1, 1, deptHeaders[0].length).setValues(deptHeaders);
  formatHeaderRow(sheetDept, deptHeaders[0].length, "#4C1D95"); // Violet

  // Tambahkan contoh department
  if (sheetDept.getLastRow() === 1) {
    sheetDept.appendRow(["IT", "Information Technology (IT)", "IT Vendor Ops", "it@company.com", "ekosunaryo7@gmail.com", "procurement@company.com"]);
    sheetDept.appendRow(["GA", "General Affairs & Facility", "GA Operations", "ga@company.com", "ekosunaryo7@gmail.com", ""]);
    sheetDept.appendRow(["PROC", "Procurement & Purchasing", "Procurement Dept", "procurement@company.com", "ekosunaryo7@gmail.com", ""]);
    sheetDept.appendRow(["FIN", "Finance & Accounting", "Finance Division", "finance@company.com", "ekosunaryo7@gmail.com", ""]);
    sheetDept.appendRow(["HR", "Human Resources", "HR Operations", "hr@company.com", "ekosunaryo7@gmail.com", ""]);
    sheetDept.appendRow(["LEGAL", "Legal & Compliance", "Corporate Legal", "legal@company.com", "ekosunaryo7@gmail.com", ""]);
  }

  // 4. Sheet Email_Logs
  let sheetLogs = ss.getSheetByName(SHEETS.LOGS);
  if (!sheetLogs) {
    sheetLogs = ss.insertSheet(SHEETS.LOGS);
  }
  const logHeaders = [["Timestamp", "ID Kontrak", "Nama Vendor", "Recipient Email", "Recipient Role", "Subject", "Sisa Hari", "Status"]];
  sheetLogs.getRange(1, 1, 1, logHeaders[0].length).setValues(logHeaders);
  formatHeaderRow(sheetLogs, logHeaders[0].length, "#7C2D12"); // Amber/Brown

  SpreadsheetApp.getActiveSpreadsheet().toast("Inisialisasi sheet database berhasil disiapkan!", "Sukses", 5);
}

/**
 * Format baris header agar terlihat rapi dan profesional
 */
function formatHeaderRow(sheet, colCount, bgColor) {
  const range = sheet.getRange(1, 1, 1, colCount);
  range.setBackground(bgColor);
  range.setFontColor("#FFFFFF");
  range.setFontWeight("bold");
  range.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  for (let c = 1; c <= colCount; c++) {
    sheet.autoResizeColumn(c);
  }
}

/**
 * 2. ENGINE NOTIFIKASI EMAIL OTOMATIS
 * Dijalankan otomatis setiap hari via Time-driven Trigger
 */
function checkAndSendContractExpiryReminders() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.CONTRACTS);
  const logSheet = ss.getSheetByName(SHEETS.LOGS);
  
  if (!sheet || sheet.getLastRow() < 2) {
    Logger.log("Belum ada data kontrak untuk diproses.");
    return { status: "empty", message: "Tidak ada kontrak" };
  }

  // Ambil mapping departemen untuk pengirim & manager CC
  const deptMap = getDepartmentSettingsMap(ss);
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let emailsSent = 0;
  const processedResults = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 2; // Baris riil di spreadsheet (1-indexed + header)

    const contractId = row[0];
    const contractNo = row[1];
    const vendorName = row[2];
    const startDateRaw = row[3];
    const expireDateRaw = row[4];
    const department = row[5];
    const nominal = row[6];
    const picName = row[7];
    const picPhone = row[8];
    const picEmail = row[9];
    const contractUrl = row[10];
    let currentStatus = row[12];

    if (!expireDateRaw) continue;

    const expireDate = new Date(expireDateRaw);
    expireDate.setHours(0, 0, 0, 0);

    // Hitung sisa hari
    const diffTime = expireDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Update status kolom sisa hari di sheet (Kolom 14 = N)
    sheet.getRange(rowIndex, 14).setValue(daysLeft);

    // Tentukan status kontrak terkini
    let updatedStatus = currentStatus;
    if (daysLeft < 0) {
      updatedStatus = "Kadaluarsa";
    } else if (daysLeft <= 7) {
      updatedStatus = "Kritis (H-" + daysLeft + ")";
    } else if (daysLeft <= 30) {
      updatedStatus = "Mendekati Expired (" + daysLeft + " Hari)";
    } else {
      updatedStatus = "Aktif";
    }
    sheet.getRange(rowIndex, 13).setValue(updatedStatus);

    // Cek apakah sisa hari cocok dengan interval notifikasi
    if (DEFAULT_INTERVALS.indexOf(daysLeft) !== -1 && daysLeft >= 0) {
      const deptConfig = deptMap[department] || {
        managerEmail: "ekosunaryo7@gmail.com",
        senderName: "Vendor Contract System",
        ccEmails: ""
      };

      const recipients = [];
      if (picEmail && picEmail.indexOf("@") !== -1) {
        recipients.push(picEmail);
      }
      if (deptConfig.managerEmail && recipients.indexOf(deptConfig.managerEmail) === -1) {
        recipients.push(deptConfig.managerEmail);
      }

      if (recipients.length > 0) {
        const subject = \`[PENGINGAT KONTRAK] \${vendorName} - Sisa \${daysLeft} Hari (\${contractNo || contractId})\`;
        const htmlBody = buildContractEmailHtml({
          vendorName: vendorName,
          contractNo: contractNo,
          contractId: contractId,
          daysLeft: daysLeft,
          expireDate: Utilities.formatDate(expireDate, "Asia/Jakarta", "dd MMMM yyyy"),
          department: department,
          nominal: formatRupiah(nominal),
          picName: picName,
          picPhone: picPhone,
          contractUrl: contractUrl,
          senderName: deptConfig.senderName
        });

        try {
          MailApp.sendEmail({
            to: recipients.join(","),
            cc: deptConfig.ccEmails || undefined,
            name: deptConfig.senderName,
            subject: subject,
            htmlBody: htmlBody
          });

          emailsSent++;
          if (logSheet) {
            logSheet.appendRow([
              new Date(), contractId, vendorName, recipients.join("; "), "Vendor PIC & Manager", subject, daysLeft, "Sent"
            ]);
          }
          processedResults.push({ vendor: vendorName, daysLeft: daysLeft, status: "Sent" });
        } catch (mailErr) {
          Logger.log("Gagal kirim email: " + mailErr.toString());
          if (logSheet) {
            logSheet.appendRow([
              new Date(), contractId, vendorName, recipients.join("; "), "Error", mailErr.toString(), daysLeft, "Failed"
            ]);
          }
        }
      }
    }
  }

  Logger.log(\`Pengecekan selesai. Total email terkirim: \${emailsSent}\`);
  return { status: "success", emailsSent: emailsSent, count: rows.length };
}

/**
 * Template Email HTML Responsif & Elegan
 */
function buildContractEmailHtml(data) {
  const urgencyColor = data.daysLeft <= 7 ? "#DC2626" : data.daysLeft <= 30 ? "#EA580C" : "#2563EB";
  const urgencyBadge = data.daysLeft === 0 ? "HARI INI EXPIRED!" : \`Tersisa \${data.daysLeft} Hari\`;

  return \`
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%); padding: 24px; color: #ffffff;">
        <div style="font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #93C5FD; font-weight: 700; margin-bottom: 6px;">
          SISTEM MONITORING KONTRAK VENDOR
        </div>
        <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700;">Peringatan Jatuh Tempo Kontrak</h2>
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Masa berlaku kontrak vendor di bawah ini akan segera berakhir.</p>
      </div>

      <div style="padding: 24px;">
        <div style="display: inline-block; background: \${urgencyColor}; color: #ffffff; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 9999px; margin-bottom: 20px;">
          \${urgencyBadge}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
          <tbody>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; color: #64748B; width: 38%;">Nama Vendor</td>
              <td style="padding: 10px 0; color: #0F172A; font-weight: 700;">\${data.vendorName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; color: #64748B;">Nomor Dokumen</td>
              <td style="padding: 10px 0; color: #0F172A; font-weight: 600;">\${data.contractNo || data.contractId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; color: #64748B;">Department Pemilik</td>
              <td style="padding: 10px 0; color: #0F172A;">\${data.department}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; color: #64748B;">Tanggal Jatuh Tempo</td>
              <td style="padding: 10px 0; color: \${urgencyColor}; font-weight: 700;">\${data.expireDate}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; color: #64748B;">Nilai Kontrak</td>
              <td style="padding: 10px 0; color: #0F172A; font-weight: 600;">\${data.nominal}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; color: #64748B;">PIC Vendor / Internal</td>
              <td style="padding: 10px 0; color: #0F172A;">\${data.picName} (\${data.picPhone || "-"})</td>
            </tr>
          </tbody>
        </table>

        <div style="background: #F8FAFC; border-left: 4px solid #3B82F6; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5;">
            <strong>Tindakan yang Disarankan:</strong> Segera hubungi PIC Vendor untuk evaluasi kinerja, pengajuan penawaran renewal, atau persiapan proses tender/adendum sebelum layanan terputus.
          </p>
        </div>

        <div style="text-align: center; margin: 28px 0 16px 0;">
          <a href="https://docs.google.com/spreadsheets/d/\${SPREADSHEET_ID}/edit" 
             style="background: #1E3A8A; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; display: inline-block;">
            Buka Spreadsheet Database
          </a>
        </div>
      </div>

      <div style="background: #F1F5F9; padding: 16px 24px; font-size: 12px; color: #64748B; text-align: center; border-top: 1px solid #E2E8F0;">
        Email ini dihasilkan secara otomatis oleh Google Apps Script terintegrasi Google Sheets. 
      </div>
    </div>
  \`;
}

/**
 * 3. PASANG TRIGGER WAKTU OTOMATIS (CRON HARIAN)
 */
function createDailyTimeTrigger() {
  // Hapus trigger lama jika ada agar tidak double
  const existingTriggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < existingTriggers.length; i++) {
    if (existingTriggers[i].getHandlerFunction() === "checkAndSendContractExpiryReminders") {
      ScriptApp.deleteTrigger(existingTriggers[i]);
    }
  }

  // Buat trigger baru setiap hari pk 08.00 pagi
  ScriptApp.newTrigger("checkAndSendContractExpiryReminders")
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  SpreadsheetApp.getActiveSpreadsheet().toast("Trigger harian jam 08:00 WIB berhasil dipasang!", "Sukses", 5);
}

/**
 * 4. REST API WEB APP - GET & POST
 * Digunakan untuk koneksi real-time dari aplikasi web frontend
 */
function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.CONTRACTS);
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Sheet not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const items = [];

  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    items.push({
      id: row[0],
      contractNumber: row[1],
      vendorName: row[2],
      startDate: row[3] ? Utilities.formatDate(new Date(row[3]), "Asia/Jakarta", "yyyy-MM-dd") : "",
      expiredDate: row[4] ? Utilities.formatDate(new Date(row[4]), "Asia/Jakarta", "yyyy-MM-dd") : "",
      department: row[5],
      nominalContract: Number(row[6]) || 0,
      picName: row[7],
      picPhone: row[8],
      picEmail: row[9],
      contractFileUrl: row[10],
      optionalFileUrl: row[11],
      status: row[12],
      daysLeft: row[13],
      notes: row[14]
    });
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "success", data: items }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.CONTRACTS);

    if (postData.action === "addContract") {
      const c = postData.contract;
      sheet.appendRow([
        c.id || "CTR-" + new Date().getTime(),
        c.contractNumber || "-",
        c.vendorName,
        c.startDate,
        c.expiredDate,
        c.department,
        c.nominalContract || 0,
        c.picName,
        c.picPhone || "-",
        c.picEmail || "-",
        c.contractFileUrl || "-",
        c.optionalFileUrl || "-",
        "Aktif",
        "",
        c.notes || "-",
        new Date()
      ]);

      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Kontrak berhasil disimpan" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (postData.action === "triggerEmailCheck") {
      const result = checkAndSendContractExpiryReminders();
      return ContentService.createTextOutput(JSON.stringify({ status: "success", result: result }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Action not recognized" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper: Ambil konfigurasi departemen
function getDepartmentSettingsMap(ss) {
  const sheet = ss.getSheetByName(SHEETS.DEPARTMENTS);
  const map = {};
  if (!sheet || sheet.getLastRow() < 2) return map;

  const data = sheet.getDataRange().getValues();
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    map[row[1]] = {
      code: row[0],
      senderName: row[2],
      senderEmail: row[3],
      managerEmail: row[4],
      ccEmails: row[5]
    };
  }
  return map;
}

// Helper: Format Rupiah
function formatRupiah(amount) {
  const num = Number(amount) || 0;
  return "Rp " + num.toLocaleString("id-ID");
}

function showContractSummaryPopup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.CONTRACTS);
  const total = sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
  SpreadsheetApp.getUi().alert("Ringkasan Kontrak", \`Total data kontrak terdaftar di sheet: \${total} kontrak.\`, SpreadsheetApp.getUi().ButtonSet.OK);
}
`;

export const ARCHITECTURE_STEPS = [
  {
    step: 1,
    title: 'Buka Google Spreadsheet Target',
    description: 'Buka spreadsheet database utama di https://docs.google.com/spreadsheets/d/18RpeSEBHm-xQm1eYEzn36KJvm7USvyU6w0yzo-64-K4/edit',
    icon: 'Sheet',
  },
  {
    step: 2,
    title: 'Buka Extensions > Apps Script',
    description: 'Di menu atas Google Sheets, klik menu Extensions (Ekstensi) > Apps Script. Hapus kode default myFunction() {} yang ada.',
    icon: 'Code',
  },
  {
    step: 3,
    title: 'Paste Kode Code.gs',
    description: 'Salin seluruh kode di tab ini dan tempelkan ke file Code.gs di editor Apps Script, lalu klik Simpan (Ctrl+S / Cmd+S).',
    icon: 'Copy',
  },
  {
    step: 4,
    title: 'Jalankan setupDatabaseSheets()',
    description: 'Pilih fungsi setupDatabaseSheets() dari dropdown fungsi, lalu klik Run (Jalankan). Berikan izin akses (Review Permissions) saat diminta.',
    icon: 'Play',
  },
  {
    step: 5,
    title: 'Deploy sebagai Web App & Aktifkan Trigger',
    description: 'Klik tombol Deploy > New Deployment > Web app > Execute as: Me > Who has access: Anyone > Salin URL Web App ke Pengaturan aplikasi ini.',
    icon: 'Zap',
  },
];
