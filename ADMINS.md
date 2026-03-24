# Admin Guide

This guide covers managing the Google Sheet that powers the calendar.

## Google Sheet Setup

### Required Columns

Ensure your Google Sheet has these columns in the header row:

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| EventKey | Yes | Date + ID (pipe-separated) | `2026-03-24\|Intro to Woodworking\|123` |
| EventName | Yes | Event title | "Intro to Woodworking" |
| StartTime | Yes | Start time (HH:MM) | "14:00" |
| Duration | No | Minutes (default: 120) | "180" |
| Stewards | No | Comma-separated names | "John, Mary" |
| ParticipantNames | No | Comma-separated names | "Alice, Bob, Carol" |
| ParticipantEmails | No | Comma-separated emails | "alice@mail.com,bob@mail.com" |
| Costs | No | Price information | "$25" |
| LastModified | No | Auto-updated timestamp | (auto) |
| Notes | No | Additional info | "Bring safety glasses" |
| TicketIDs | No | Ticket URL or ID | "https://tix.com/123" |

### EventKey Format

The `EventKey` column contains the event date encoded with other info:

```
YYYY-MM-DD|EventName|AdditionalInfo
```

**Example:**
```
2026-03-24|Intro to Woodworking|101
```

- First segment: Date (YYYY-MM-DD) - **Critical for calendar placement**
- Second segment: Event name
- Third segment: Additional ID/info (optional)

## Adding New Events

1. Open the Google Sheet
2. Add a new row
3. Fill in the required columns:
   - `EventKey`: Use format `YYYY-MM-DD|EventName|ID`
   - `EventName`: Short title for display
   - `StartTime`: Time like "09:00" or "14:30"
4. Optionally fill:
   - `Duration`: Minutes (leave blank for 120 min default)
   - `Stewards`: Who is running the event
   - `ParticipantNames`: Who's attending
   - `TicketIDs`: Link to ticket sales page
   - `Notes`: Any special instructions
   - `Costs`: Price if any

## Modifying Events

1. Find the row with the event
2. Edit any field
3. Changes appear on the calendar within 1 hour (or on next page refresh)

## Deleting Events

1. Find the row with the event
2. Delete the entire row
3. The event will no longer appear on the calendar

## Troubleshooting

### Events Not Showing on Calendar

1. Check that `EventKey` starts with valid date (YYYY-MM-DD)
2. Verify `EventName` is not empty
3. Ensure the Google Apps Script is deployed correctly
4. Check the calendar website shows no errors

### Wrong Date Displayed

- The date is extracted from the first part of `EventKey` (before the pipe)
- Make sure format is exactly: `2026-03-24|EventName|...`

### Duration Shows Incorrectly

- Check `Duration` column has a number (minutes)
- If empty, defaults to 120 minutes
- Height calculation: `duration * 2` pixels (min 24, max 80)

## Google Apps Script Setup

If you need to redeploy the API:

1. Go to your Google Sheet
2. Extensions > Apps Script
3. Open the existing project or create new
4. Paste the code from `apps-script.gs`
5. Click Deploy > New deployment
6. Select "Web app"
7. Set:
   - Description: "Calendar API"
   - Execute as: "Me"
   - Who has access: "Anyone"
8. Click Deploy
9. Copy the Web App URL
10. Update `config.js` with the new URL

## Automated Deployment (GitHub Actions)

The project includes automatic deployment to Google Apps Script via GitHub Actions.

### How It Works

1. When `apps-script.gs` is pushed to the `master` branch, the workflow automatically runs
2. It authenticates using stored credentials
3. It pushes the code and deploys as a Web App

### Setup Required

1. **Enable Apps Script API**: Go to https://script.google.com/home/usersettings
2. **Get Script ID**: Open your Apps Script project, copy the ID from the URL
3. **Get clasp credentials**: Run `cat ~/.clasprc.json` locally
4. **Add GitHub Secrets**:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add secret `CLASPRC_JSON` with the contents of your `~/.clasprc.json`
   - Add secret `SCRIPT_ID` with your Apps Script project ID
5. **Update .clasp.json**: Replace `YOUR_SCRIPT_ID_HERE` with your actual Script ID

### Troubleshooting Deployment

- **Authentication failure**: Refresh your `CLASPRC_JSON` token
- **Script not found**: Verify `SCRIPT_ID` is correct in `.clasp.json`
- **Web App not updating**: Check GitHub Actions logs for errors
