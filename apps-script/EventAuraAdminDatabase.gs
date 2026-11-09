/**
 * EventAura Admin Database — initial Google Sheets setup
 *
 * Run setupEventAuraAdminDatabase() once from the Apps Script editor
 * attached to the new EventAura Admin Database spreadsheet.
 *
 * This creates the database tabs and headers only. It does not publish
 * a public API or change the separate EventAura Reviews spreadsheet.
 */

const EVENTAURA_DB_SCHEMA = {
  Bookings: [
    "booking_id", "created_at", "updated_at", "customer_id", "customer_name",
    "phone", "email", "event_type", "theme_id", "event_date", "event_time",
    "venue", "city", "guest_count", "budget", "quoted_amount", "advance_paid",
    "balance_due", "booking_status", "payment_status", "partner_id",
    "assigned_staff", "notes", "source"
  ],
  Customers: [
    "customer_id", "created_at", "updated_at", "full_name", "phone", "email",
    "city", "address", "total_bookings", "total_spend", "notes"
  ],
  Partners: [
    "partner_id", "created_at", "updated_at", "business_name", "contact_name",
    "phone", "email", "city", "services", "coverage_areas", "commission_type",
    "commission_value", "status", "rating", "notes"
  ],
  Themes: [
    "theme_id", "created_at", "updated_at", "theme_name", "category",
    "description", "starting_price", "cover_image_url", "gallery_urls",
    "status", "sort_order"
  ],
  Gallery: [
    "gallery_id", "created_at", "title", "category", "image_url",
    "alt_text", "theme_id", "is_featured", "status", "sort_order"
  ],
  Payments: [
    "payment_id", "created_at", "booking_id", "customer_id", "amount",
    "payment_method", "transaction_reference", "payment_date", "payment_type",
    "received_by", "notes"
  ],
  Expenses: [
    "expense_id", "created_at", "booking_id", "event_date", "category",
    "description", "amount", "paid_to", "payment_method", "receipt_url",
    "recorded_by", "notes"
  ],
  Assignments: [
    "assignment_id", "created_at", "updated_at", "booking_id", "partner_id",
    "staff_name", "role", "assigned_date", "status", "agreed_cost", "notes"
  ],
  EventTasks: [
    "task_id", "created_at", "updated_at", "booking_id", "task_name",
    "assigned_to", "due_date", "status", "completed_at", "notes"
  ],
  Notifications: [
    "notification_id", "created_at", "booking_id", "channel", "recipient",
    "message", "status", "sent_at", "error"
  ],
  AdminUsers: [
    "user_id", "email", "display_name", "role", "status", "created_at",
    "last_login"
  ],
  Settings: ["setting_key", "setting_value", "updated_at", "notes"],
  ActivityLog: [
    "log_id", "created_at", "user_email", "action", "entity_type",
    "entity_id", "details"
  ]
};

function setupEventAuraAdminDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Open this script from the EventAura Admin Database spreadsheet.");
  }

  Object.keys(EVENTAURA_DB_SCHEMA).forEach(function (tabName) {
    const headers = EVENTAURA_DB_SCHEMA[tabName];
    let sheet = ss.getSheetByName(tabName);
    if (!sheet) sheet = ss.insertSheet(tabName);

    // Only initialize a tab if it is empty; never overwrite existing records.
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    } else {
      const existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
        .getValues()[0].filter(String);
      const missing = headers.filter(function (h) { return existing.indexOf(h) === -1; });
      if (missing.length) {
        sheet.getRange(1, sheet.getLastColumn() + 1, 1, missing.length)
          .setValues([missing]);
      }
    }

    const width = sheet.getLastColumn();
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, width)
      .setFontWeight("bold")
      .setWrap(true);
    sheet.autoResizeColumns(1, width);
    if (!sheet.getFilter() && sheet.getLastRow() > 1) {
      sheet.getRange(1, 1, sheet.getLastRow(), width).createFilter();
    }
  });

  const settings = ss.getSheetByName("Settings");
  const defaults = [
    ["business_name", "EventAura", new Date(), "Business display name"],
    ["timezone", "Asia/Karachi", new Date(), "Business timezone"],
    ["currency", "PKR", new Date(), "Default currency"],
    ["reviews_source", "Separate EventAura Reviews spreadsheet", new Date(), "Do not merge or overwrite the existing reviews sheet"]
  ];
  const existingKeys = settings.getLastRow() > 1
    ? settings.getRange(2, 1, settings.getLastRow() - 1, 1).getValues().flat()
    : [];
  defaults.forEach(function (row) {
    if (existingKeys.indexOf(row[0]) === -1) settings.appendRow(row);
  });

  SpreadsheetApp.flush();
  return "EventAura Admin Database tabs are ready.";
}
