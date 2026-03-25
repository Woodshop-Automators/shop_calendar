# Admin Guide

This guide covers managing the Google Sheet that powers the calendar.

## Google Sheet Setup

### Required Columns

Ensure your Google Sheet has these columns (case-sensitive):

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| Event Key | Yes | EventName\|Date\|Time | `Orientation|2026-03-24|18:00` |
| EventName | Yes | Event title | "Woodshop Orientation" |
| Date | No | Date (for reference) | "Tue Mar 24 2026" |
| Stewards | No | Comma-separated names | "Sally, John" |
| Ticket URL | No | Link to ticket sales | "https://..." |
| Duration / EventDuration | No | Minutes | "60" |

### EventKey Format

The `Event Key` column format is:

```
EventName|YYYY-MM-DD|HH:MM
```

**Example:**
```
Orientation|2026-03-24|18:00
```

- Position 0: Event name
- Position 1: Date (YYYY-MM-DD) - **Critical for calendar placement**
- Position 2: Time (HH:MM) - **Used for display**

## Adding New Events

1. Open the Google Sheet
2. Add a new row
3. Fill in `Event Key`: Use format `EventName|YYYY-MM-DD|HH:MM`
4. Fill in `EventName`: Short title for display
5. Optionally fill:
   - `Stewards`: Who is running the event
   - `Ticket URL`: Link to ticket sales page
   - `Duration`: Minutes (defaults to 60 if empty)

## Modifying Events

1. Find the row with the event
2. Edit any field
3. Changes appear on the next page refresh (within 15 minutes)

## Deleting Events

1. Find the row with the event
2. Delete the entire row
3. The event will no longer appear on the calendar

## Troubleshooting

### Events Not Showing on Calendar

1. Check that `Event Key` format is correct (EventName|YYYY-MM-DD|HH:MM)
2. Verify `EventName` is not empty
3. Ensure the Google Apps Script is deployed correctly
4. Check the calendar website shows no errors in browser console

### Wrong Date Displayed

- The date is extracted from position 1 of Event Key (between pipes)
- Make sure format is exactly: `EventName|2026-03-24|18:00`

### Ticket Button Not Showing

- Check that `Ticket URL` column (not TicketIDs) has a valid URL
- Column header must be exactly "Ticket URL"

## Automated Deployment

The project includes automatic deployment to Google Apps Script via GitHub Actions.

### How It Works

1. When code is pushed to master, GitHub Actions runs
2. It authenticates using stored credentials
3. It pushes Code.gs to Apps Script
4. It deploys as a Web App

### GitHub Secrets Required

| Secret | How to Get |
|--------|------------|
| CLASPRC_JSON | Run `cat ~/.clasprc.json` locally |
| SCRIPT_ID | From Apps Script URL |

Go to: Repository Settings → Secrets and variables → Actions

## Manual Deployment (if needed)

1. Go to: https://script.google.com/d/YOUR_SCRIPT_ID/edit
2. Deploy → New deployment
3. Select "Web app"
4. Set: Execute as "Me", Who has access "Anyone"
5. Click Deploy
6. Update config.js with new URL
7. Push to GitHub