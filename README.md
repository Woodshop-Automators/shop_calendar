# Woodshop Calendar v0.9

A low-cost event calendar website powered by Google Sheets and GitHub Pages.

## Overview

The Woodshop Calendar displays timed events (classes) from a Google Sheet, showing them in a monthly calendar view. Users can click events to see details including stewards, participants, and ticket links.

### System Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Google     │     │  Google Apps     │     │  GitHub        │     │  Browser     │
│  Sheets     │────▶│  Script API     │────▶│  Pages         │────▶│  (Calendar)  │
│  (Data)     │     │  (Code.gs)      │     │  (Hosting)     │     │  (UI)         │
└─────────────┘     └──────────────────┘     └─────────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────────┐
                    │  GitHub Actions │
                    │  (Auto-deploy)  │
                    └──────────────────┘
```

### Data Flow

1. **Google Sheet** contains event data with columns: EventKey, EventName, Date, Time, Duration, Stewards, Ticket URL
2. **Apps Script** reads sheet, transforms data, serves as JSON API
3. **GitHub Pages** hosts the static HTML/CSS/JS website
4. **Browser** fetches data, renders calendar, handles user interactions

### Technology Stack

| Component | Technology | Cost |
|-----------|------------|------|
| Hosting | GitHub Pages | Free |
| Data Source | Google Sheets | Free |
| API Layer | Google Apps Script | Free |
| CI/CD | GitHub Actions | Free |

**Total Cost: $0/month**

---

## Quick Start

### 1. Set Up Google Sheet

Ensure your sheet has these columns:
- `Event Key` - Format: `EventName|YYYY-MM-DD|HH:MM`
- `Event Name` - Event title
- `Stewards` - Comma-separated names
- `Ticket URL` - Link to ticket sales
- `Duration` / `EventDuration` - Minutes (optional, defaults to 60)

### 2. Deploy Apps Script

1. Go to Extensions → Apps Script in your Google Sheet
2. Paste code from `Code.gs`
3. Deploy as Web App (Anyone, Me)
4. Copy the Web App URL

### 3. Configure the Website

1. Update `config.js` with your API URL
2. Push changes to GitHub
3. Enable GitHub Pages in repo settings

---

## Code Updates & Deployment

### Making Code Changes

1. Edit files locally in `/home/daver/projects/woodshop-calendar/`
2. Commit: `git add . && git commit -m "Description"`
3. Push: `git push`

### Automatic Deployment

The GitHub Actions workflow automatically:
- Runs on every push to master
- Installs clasp
- Authenticates with Google
- Pushes Code.gs to Apps Script
- Deploys as Web App

### Manual Deployment (if needed)

1. Go to: https://script.google.com/d/YOUR_SCRIPT_ID/edit
2. Deploy → Manage deployments → Edit → Deploy

---

## Module Documentation

### config.js
Configuration settings for the calendar.

| Setting | Type | Description |
|---------|------|-------------|
| API_URL | string | Google Apps Script Web App URL |
| REFRESH_INTERVAL_MS | number | Auto-refresh interval (default: 15 min) |
| EVENT_HEIGHT_MULTIPLIER | number | Height calculation multiplier |
| EVENT_MIN_HEIGHT | number | Minimum event block height (px) |
| EVENT_MAX_HEIGHT | number | Maximum event block height (px) |

### api.js
Handles data fetching and caching.

**Functions:**
- `fetchEvents(forceRefresh)` - Fetch from API, use cache if available
- `getEventsForMonth(year, month)` - Filter events for specific month
- `getCachedEvents()` - Read from localStorage
- `setCachedEvents(events)` - Write to localStorage
- `startAutoRefresh()` - Begin periodic refresh
- `refreshEvents()` - Force refresh

**Input:** Google Apps Script JSON endpoint
**Output:** Array of event objects

### app.js
Main calendar logic and rendering.

**Functions:**
- `init()` - Initialize calendar on page load
- `loadAndRender(forceRefresh)` - Load data and render
- `renderCalendar()` - Draw monthly grid
- `createEventBlock(event)` - Create event block element
- `createDayCell(day, isOtherMonth, isToday)` - Create day cell
- `setupNavigation()` - Handle prev/next month buttons
- `setupRefreshButton()` - Handle refresh button

**Input:** Event data from api.js
**Output:** DOM elements rendered to calendar-grid

### modal.js
Event detail popup.

**Functions:**
- `openModal(event)` - Display event details
- `closeModal()` - Hide modal
- `initModal()` - Set up event listeners

**Input:** Event object with all properties
**Output:** Modal overlay with event details

### styles.css
Visual styling for all components.

**Key Classes:**
- `.event-block` - Event display in calendar
- `.event-time` - Time display (e.g., "6:00 PM - 2h")
- `.event-title` - Event name
- `.event-steward` - Steward name
- `.event-ticket` - Ticket button

### Code.gs (Apps Script)
Google Sheets to JSON API.

**Functions:**
- `doGet(e)` - Main endpoint, returns JSON
- `createJsonResponse(data)` - Format JSON output
- `createErrorResponse(message)` - Format error output
- `getEventKeyParts(eventKey)` - Parse EventKey

**Input:** Google Sheet data
**Output:** JSON with events array

---

## Troubleshooting Guide

### Events Not Loading

1. **Check API URL** - Verify `config.js` has correct URL
2. **Check browser console** - Look for fetch errors (F12)
3. **Test API directly** - Copy API URL and open in browser
4. **Verify sheet name** - Code expects "Registry-Cal-test"

### Events Show Wrong Date

- Check EventKey format: `EventName|YYYY-MM-DD|HH:MM`
- Date must be in position 1 (not 0)

### Ticket Button Not Showing

- Verify "Ticket URL" column has data in sheet
- Column header must match exactly (case-sensitive)

### GitHub Actions Deployment Fails

1. **Check secrets** - CLASPRC_JSON and SCRIPT_ID in repo settings
2. **Verify token** - Run `cat ~/.clasprc.json` locally
3. **Check workflow logs** - Go to Actions tab for error details

### Event Blocks Too Small/Large

- Adjust in `config.js`:
  - `EVENT_HEIGHT_MULTIPLIER` (default: 1.5)
  - `EVENT_MIN_HEIGHT` (default: 20)
  - `EVENT_MAX_HEIGHT` (default: 50)

### Calendar Slow to Load

- Lazy loading is enabled - first load shows cached data
- Refresh interval is 15 minutes
- Click "Refresh" button for immediate update

### Modal Not Opening

- Check browser console for JavaScript errors
- Verify modal.js is loaded in index.html

---

## Documentation Files

- [User Guide](USERS.md) - For end users viewing the calendar
- [Admin Guide](ADMINS.md) - For managing the Google Sheet
- [Developer Guide](DEVELOPERS.md) - For code customization
- [SPEC.md](SPEC.md) - Technical specification

---

## Version History

- **v0.9** - Current version
  - Lazy loading with localStorage cache
  - Manual refresh button
  - 15-minute auto-refresh
  - Steward and ticket display in event blocks