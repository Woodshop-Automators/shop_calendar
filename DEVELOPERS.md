# Developer Guide

This guide covers development, customization, and deployment of the calendar website.

## Project Structure

```
woodshop-calendar/
├── index.html          # Main HTML page
├── styles.css         # All CSS styling
├── app.js            # Calendar logic (render, navigation)
├── api.js            # Google Sheets API fetching, caching
├── modal.js          # Event detail modal
├── config.js         # Configuration (API URL, intervals, sizes)
├── Code.gs           # Google Apps Script backend
├── appsscript.json  # Apps Script manifest
├── .clasp.json       # clasp configuration
├── SPEC.md           # Technical specification
├── USERS.md          # End user documentation
├── ADMINS.md         # Admin/sheet management docs
└── README.md         # This file
```

## Prerequisites

- Git
- Node.js (optional, for testing)
- Google account (for Apps Script)

## Local Development

### 1. Clone and Setup

```bash
cd ~/projects
git clone <your-repo> woodshop-calendar
cd woodshop-calendar
```

### 2. Configure API URL

Edit `config.js`:

```javascript
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/YOUR_ID/exec',
    REFRESH_INTERVAL_MS: 15 * 60 * 1000,  // 15 minutes
    EVENT_HEIGHT_MULTIPLIER: 1.5,
    EVENT_MIN_HEIGHT: 20,
    EVENT_MAX_HEIGHT: 50
};
```

### 3. Test Locally

Open `index.html` in a browser, or serve locally:

```bash
# Using Python
python -m http.server 8000

# Or using Node
npx http-server -p 8000
```

Visit `http://localhost:8000`

## Configuration Options

Edit `config.js` to customize:

| Setting | Default | Description |
|---------|---------|-------------|
| API_URL | (required) | Your Apps Script Web App URL |
| REFRESH_INTERVAL_MS | 900000 (15 min) | Auto-refresh interval |
| EVENT_HEIGHT_MULTIPLIER | 1.5 | Height = duration * this |
| EVENT_MIN_HEIGHT | 20 | Minimum block height (px) |
| EVENT_MAX_HEIGHT | 50 | Maximum block height (px) |

## Customization

### Changing Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --header-bg: #2c3e50;      /* Header background */
    --event-color: #3498db;    /* Event block color */
    --today-highlight: #e8f4f8; /* Today's highlight */
}
```

### Adding Fields to Modal

Edit `modal.js` - add fields to `detailsHTML`:

```javascript
if (event.YourField) {
    detailsHTML += `
        <div class="modal-detail">
            <strong>Your Label</strong>
            <p>${event.YourField}</p>
        </div>
    `;
}
```

## Deployment

### GitHub Pages

1. Push code to GitHub repository
2. Go to Repository Settings → Pages
3. Select source: "main branch"
4. Save
5. Your site will be at `https://yourusername.github.io/shop_calendar/`

### Google Apps Script Deployment

The workflow runs automatically on push to master. If needed manually:

1. Extensions > Apps Script in your Google Sheet
2. Paste code from `Code.gs`
3. Deploy > New deployment
4. Select "Web app"
5. Configure:
   - Description: "Calendar API"
   - Execute as: "Me"
   - Who has access: "Anyone"
6. Deploy
7. Copy the Web App URL to config.js

## GitHub Actions Secrets

| Secret | Required | Description |
|--------|----------|-------------|
| CLASPRC_JSON | Yes | OAuth credentials from `~/.clasprc.json` |
| SCRIPT_ID | Yes | Apps Script project ID |

## API Response Format

The Apps Script API returns:

```json
{
  "events": [
    {
      "EventKey": "Orientation|2026-03-24|18:00",
      "EventName": "Woodshop Orientation",
      "Stewards": "Sally, John",
      "Ticket URL": "https://...",
      "Duration": "60",
      ...
    }
  ],
  "count": 1
}
```

## Lazy Loading

The calendar uses localStorage caching:
- On page load, cached events display immediately
- Fresh data is fetched in background
- Manual "Refresh" button forces new fetch
- Auto-refresh every 15 minutes

## Troubleshooting

### CORS Errors
- Ensure Apps Script is deployed with "Anyone" access
- Verify the API URL is correct in config.js

### Events Not Loading
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Verify Apps Script returns valid JSON

### Build Failures
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Version

Current version: **0.9**