# Event Calendar Website Specification

## 1. Project Overview

**Project Name:** Event Calendar  
**Project Type:** Static website with Google Sheets backend  
**Core Functionality:** Display monthly calendar with interactive event blocks that show class/event details on click  
**Target Users:** Organization members booking/attending classes

---

## 2. Architecture

### Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Hosting | GitHub Pages | Free, HTTPS included |
| Frontend | Vanilla HTML/CSS/JS | No framework needed |
| Data Source | Google Sheets | User provides |
| API Layer | Google Apps Script | Serves sheet as JSON |

### Data Flow

```
Google Sheet → Apps Script (doGet) → JSON API → Frontend → Rendered Calendar
```

### Cost: $0/month

---

## 3. UI/UX Specification

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  Header: Title + Month Navigation                   │
├─────────────────────────────────────────────────────┤
│  Weekday Headers (Sun Mon Tue Wed Thu Fri Sat)     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Calendar Grid (7 columns × 5-6 rows)              │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐      │
│  │  1  │  2  │  3  │  4  │  5  │  6  │  7  │      │
│  │     │ ████│     │ ████│     │     │     │      │
│  │     │Event│     │Event│     │     │     │      │
│  └─────┴─────┴─────┴─────┴─────┴─────┴─────┘      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Width | Columns |
|------------|-------|---------|
| Desktop | ≥1024px | 7 columns, 120px min cell |
| Tablet | 768-1023px | 7 columns, stacked events |
| Mobile | <768px | Single column day list |

### Visual Design

**Color Palette:**
- Background: `#f8f9fa` (light gray)
- Calendar background: `#ffffff`
- Header background: `#2c3e50` (dark blue-gray)
- Header text: `#ffffff`
- Today highlight: `#e8f4f8` (light blue)
- Event block primary: `#3498db` (blue)
- Event block text: `#ffffff`
- Modal overlay: `rgba(0, 0, 0, 0.5)`
- Modal background: `#ffffff`
- Close button: `#e74c3c` (red)

**Typography:**
- Font family: `"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif`
- Header title: 24px, bold
- Weekday headers: 14px, semibold, uppercase
- Day numbers: 16px, regular
- Event block title: 12px, semibold
- Modal title: 20px, bold
- Modal body: 14px, regular

**Spacing:**
- Calendar cell padding: 8px
- Event block padding: 6px 8px
- Event block margin: 2px 0
- Modal padding: 24px

**Visual Effects:**
- Event block: 4px border-radius
- Event block hover: brightness(1.1), cursor pointer
- Modal: 8px border-radius, box-shadow `0 4px 20px rgba(0,0,0,0.15)`
- Month navigation buttons: subtle hover background transition

### Components

#### Header
- Title: "Event Calendar" (left-aligned)
- Navigation: `< Prev` button | Month/Year display | `Next >` button
- Refresh indicator: Shows "Last updated: [time]"

#### Calendar Grid
- 7 columns for days of week
- Rows for weeks (5-6 rows depending on month)
- Each cell contains:
  - Day number (top-left)
  - Stacked event blocks

#### Event Block
- Height: `duration_minutes * 2` pixels (min 24px, max 80px)
- Background: Primary color
- Content: Truncated title
- States:
  - Default: Normal display
  - Hover: Brightness increase, cursor pointer

#### Event Detail Modal
- Overlay: Full screen, semi-transparent
- Modal: Centered, max-width 480px
- Content:
  - Title (event name)
  - Date: Full date (e.g., "Monday, March 24, 2026")
  - Time: "2:00 PM - 3:30 PM" (calculated from start + duration)
  - Duration: "1 hour 30 minutes"
  - Stewards: List of names
  - Participants: List of names (or count)
  - Ticket Link: Button/link to external ticket page
  - Close button (X) in top-right

#### Loading State
- Show "Loading events..." text while fetching
- Show error message if fetch fails with retry button

---

## 4. Functionality Specification

### Core Features

1. **Month Display**
   - Show current month on page load
   - Navigate to previous/next months
   - Highlight today's date

2. **Event Rendering**
   - Fetch events from Google Apps Script API
   - Filter events for displayed month
   - Render event blocks with height proportional to duration
   - Stack multiple events on same day

3. **Event Details**
   - Click event block to open modal
   - Display all event fields
   - Link to ticket page (open in new tab)

4. **Auto-Refresh**
   - Fetch new data on page load
   - Refresh every hour via setInterval
   - Manual refresh via header button

5. **Error Handling**
   - Graceful fallback if API unavailable
   - Retry button on failure
   - Console logging for debugging

### User Interactions

| Action | Result |
|--------|--------|
| Click `< Prev` | Navigate to previous month |
| Click `Next >` | Navigate to next month |
| Click event block | Open detail modal |
| Click modal backdrop | Close modal |
| Click modal close button | Close modal |
| Press Escape key | Close modal |
| Page load | Fetch and display events |
| Hourly (automatic) | Refresh event data |

### Data Schema

**Expected Google Sheet Columns:**

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| Date | YYYY-MM-DD | Yes | Event date |
| StartTime | HH:MM | Yes | Start time (24hr) |
| Duration | Number | Yes | Duration in minutes |
| Title | Text | Yes | Event name |
| Stewards | Text | No | Comma-separated names |
| Participants | Text | No | Comma-separated names |
| TicketURL | URL | No | Link to ticket purchase |

> **Note:** Schema will be provided by user. This is a placeholder structure.

### Edge Cases

- Events spanning midnight: Display on start date only
- More than 5 events per day: Scroll within cell or show "+N more"
- Missing optional fields: Show "Not specified" or hide field
- Invalid date format: Log error, skip event
- Empty sheet: Show "No events" message

---

## 5. Technical Implementation

### File Structure

```
calendar-website/
├── index.html          # Main calendar page
├── styles.css         # All styling
├── app.js            # Calendar logic and rendering
├── modal.js          # Modal component
├── api.js            # Google Apps Script fetch
├── config.js         # Configuration (API URL, etc.)
├── SPEC.md           # This specification
└── tests/
    ├── calendar.test.js
    └── api.test.js
```

### Google Apps Script (apps-script.gs)

```javascript
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Events");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const events = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => obj[header] = row[i]);
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify(events))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### API Endpoint

- Deploy Apps Script as Web App
- Access: "Anyone" (anonymous)
- Execute as: "Me"
- URL format: `https://script.google.com/macros/s/[ID]/exec`

---

## 6. Testing Strategy

### Test Types

1. **Unit Tests** (Jest/Vitest)
   - Date calculations
   - Duration to height conversion
   - Event filtering by month

2. **Integration Tests** (Playwright)
   - Page loads without errors
   - Events render correctly
   - Modal opens/closes properly
   - Navigation works

3. **Visual Regression** (optional)
   - Screenshot comparison for major states

### CI Pipeline

- GitHub Actions runs tests on every push
- Deploy to GitHub Pages on main branch merge

---

## 7. Documentation Plan

### User Guide (USERS.md)
- How to view the calendar
- How to book tickets
- How to report issues

### Admin Guide (ADMINS.md)
- How to update the Google Sheet
- How to add new events
- How to change event details

### Developer Guide (DEVELOPERS.md)
- Project structure
- Local development setup
- Deployment process
- Customization guide

---

## 8. Timeline Estimate

| Task | Effort |
|------|--------|
| Google Apps Script setup | 1 hour |
| HTML/CSS implementation | 2 hours |
| JavaScript logic | 3 hours |
| Testing | 2 hours |
| Documentation | 2 hours |
| **Total** | ~10 hours |

---

## 9. Open Questions

- [ ] Google Sheet schema (columns) - User will provide
- [ ] Ticket URL format/host
- [ ] Preferred date format for display
- [ ] Maximum concurrent users expected

---

## 10. Acceptance Criteria

- [ ] Calendar displays current month on load
- [ ] Month navigation works (prev/next)
- [ ] Events display with correct height based on duration
- [ ] Clicking event shows modal with all details
- [ ] Modal closes via X, backdrop click, or Escape
- [ ] Data refreshes on page load and hourly
- [ ] Error state shows gracefully if API fails
- [ ] Works on desktop and mobile
- [ ] Tests validate core functionality
- [ ] Documentation is complete for users, admins, and developers
