/**
 * EventAura customer reviews — Google Sheets backend.
 * Bind this script to a Google Sheet, then deploy as a Web App.
 * Reviews are private until the Status cell is changed to Approved.
 */
const SHEET_NAME = 'Reviews';
const HEADERS = ['Timestamp', 'Customer Name', 'Event Type', 'Rating', 'Review', 'Status'];

function getReviewsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('This Apps Script must be bound to the EventAura reviews spreadsheet.');
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonOutput_(data, callback) {
  const json = JSON.stringify(data);
  if (callback && /^[a-zA-Z_$][0-9a-zA-Z_$\.]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'list';
  if (action !== 'list') return jsonOutput_({ ok: false, error: 'Unsupported action' });
  const sheet = getReviewsSheet_();
  const rows = sheet.getDataRange().getValues();
  const reviews = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (String(row[5]).trim().toLowerCase() !== 'approved') continue;
    const rating = Math.max(1, Math.min(5, Number(row[3]) || 5));
    reviews.push({
      name: String(row[1] || 'EventAura Customer'),
      event: String(row[2] || 'Event'),
      rating: rating,
      review: String(row[4] || ''),
      date: row[0] instanceof Date
        ? Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'MMM yyyy')
        : ''
    });
  }
  reviews.reverse();
  return jsonOutput_({ ok: true, reviews: reviews }, e && e.parameter && e.parameter.callback);
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);
    // Honeypot: bots that fill this hidden field are silently discarded.
    if (data.website) return jsonOutput_({ ok: true });
    const name = String(data.customer_name || data.name || '').trim().slice(0, 80);
    const eventType = String(data.event_type || data.event || '').trim().slice(0, 60);
    const rating = Number(String(data.rating || '').match(/[1-5]/)?.[0] || 0);
    const review = String(data.review || '').trim().slice(0, 1200);
    if (!name || !eventType || rating < 1 || rating > 5 || review.length < 8) {
      return jsonOutput_({ ok: false, error: 'Please complete all review fields.' });
    }
    getReviewsSheet_().appendRow([new Date(), name, eventType, rating, review, 'Pending']);
    return jsonOutput_({ ok: true, message: 'Review received and awaiting approval.' });
  } catch (error) {
    return jsonOutput_({ ok: false, error: String(error) });
  }
}

function setupReviewsSheet() {
  const sheet = getReviewsSheet_();
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  sheet.autoResizeColumns(1, HEADERS.length);
}
