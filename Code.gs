/**
 * Google Apps Script - Event Calendar API
 * Version: 1.0.2 - Auto-deployed from GitHub via clasp
 * 
 * This script reads from a Google Sheet and serves event data as JSON.
 * 
 * CONFIGURATION:
 * - Default: Uses the spreadsheet the script is bound to (from Extensions > Apps Script)
 * - Alternative: Set SPREADSHEET_ID below for standalone scripts
 * - Sheet name: Defaults to "Events", override with ?sheet=SheetName in URL
 * 
 * DEPLOYMENT: Automatically deployed via GitHub Actions on push to master.
 */

const SPREADSHEET_ID = ''; // Set this for standalone scripts, leave empty for bound scripts

function doGet(e) {
  const sheetName = e.parameter.sheet || "Events";
  
  try {
    let ss;
    if (SPREADSHEET_ID) {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } else {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return createErrorResponse("Sheet not found: " + sheetName);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const events = data.slice(1).map((row, index) => {
      const obj = {};
      headers.forEach((header, i) => {
        let value = row[i];
        
        if (value instanceof Date) {
          value = Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        } else if (value !== null && value !== undefined) {
          value = String(value).trim();
        }
        
        obj[header] = value;
      });
      
      obj._rowIndex = index + 2;
      
      return obj;
    }).filter(event => event.EventKey || event.EventName);
    
    return createJsonResponse({ events: events, count: events.length });
    
  } catch (error) {
    return createErrorResponse(error.message || String(error));
  }
}

function createJsonResponse(data) {
  const jsonOutput = JSON.stringify(data, null, 2);
  return ContentService.createTextOutput(jsonOutput)
    .setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(message) {
  const error = { error: true, message: message };
  return ContentService.createTextOutput(JSON.stringify(error))
    .setMimeType(ContentService.MimeType.JSON);
}

function getEventKeyParts(eventKey) {
  if (!eventKey) return { date: null, name: null, extra: null };
  
  const parts = eventKey.split('|');
  return {
    date: parts[0] || null,
    name: parts[1] || null,
    extra: parts.slice(2).join('|') || null
  };
}
