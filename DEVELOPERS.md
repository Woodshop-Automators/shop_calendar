# Developer Guide

This guide covers development, customization, and deployment of the calendar website.

## Project Structure

```
woodshop-calendar/
├── index.html          # Main HTML page
├── styles.css         # All CSS styling
├── app.js            # Calendar logic (render, navigation)
├── api.js            # Google Sheets API fetching
├── modal.js          # Event detail modal
├── config.js         # Configuration (API URL, etc.)
├── apps-script.gs    # Google Apps Script backend
├── SPEC.md           # Technical specification
├── USERS.md          # End user documentation
├── ADMINS.md         # Admin/sheet management docs
├── DEVELOPERS.md     # This file
└── tests/
    ├── calendar.test.js
    └── api.test.js
```

## Prerequisites

- Node.js (for testing)
- Git
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
    API_URL: 'https://script.google.com/macros/s/YOUR_ID_HERE/exec',
    // ... other settings
};
```

### 3. Test Locally

You can open `index.html` directly in a browser, but due to CORS you'll need:

```bash
# Using Python's simple server
python -m http.server 8000

# Or using Node's http-server
npx http-server -p 8000
```

Then visit `http://localhost:8000`

### 4. Mock Data for Development

To test without a live Google Sheet, create `mock-data.js`:

```javascript
// Override fetchEvents in api.js to return test data
const MOCK_EVENTS = [
    {
        EventKey: "2026-03-24|Woodworking 101|1",
        EventName: "Woodworking 101",
        StartTime: "14:00",
        Duration: "120",
        Stewards: "John, Mary",
        ParticipantNames: "Alice, Bob",
        Notes: "Bring safety glasses",
        Costs: "$25",
        TicketIDs: "https://example.com/tickets/123"
    }
];
```

## Configuration Options

Edit `config.js` to customize:

```javascript
const CONFIG = {
    API_URL: 'https://...',      // Your Apps Script URL
    REFRESH_INTERVAL_MS: 3600000, // 1 hour in ms
    EVENT_HEIGHT_MULTIPLIER: 2,    // Height = duration * this
    EVENT_MIN_HEIGHT: 24,          // Minimum block height (px)
    EVENT_MAX_HEIGHT: 80           // Maximum block height (px)
};
```

## Customization

### Changing Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --header-bg: #2c3e50;      /* Header background */
    --event-color: #3498db;    /* Event block color */
    --today-highlight: #e8f4f8; /* Today's highlight */
    /* ... other colors */
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

### Changing Date Format

Edit `modal.js` - modify `formatDate()` function:

```javascript
const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
        // Your format options here
    });
};
```

## Deployment

### GitHub Pages

1. Push code to GitHub repository
2. Go to Repository Settings > Pages
3. Select source: "main branch"
4. Save
5. Your site will be at `https://yourusername.github.io/woodshop-calendar/`

### Google Apps Script Deployment

1. Open your Google Sheet
2. Extensions > Apps Script
3. Create new project or open existing
4. Paste code from `apps-script.gs`
5. Save (Ctrl+S)
6. Deploy > New deployment
7. Select "Web app"
8. Configure:
   - Description: "Calendar API"
   - Execute as: "Me"
   - Who has access: "Anyone"
9. Click Deploy
10. Copy the Web App URL

## Testing

### Running Tests

```bash
# Install dependencies
npm install

# Run tests
npm test
```

### Adding Tests

Edit test files in `tests/` directory using Vitest syntax:

```javascript
describe('Calendar', () => {
    it('should render events', () => {
        // Test code here
    });
});
```

## Troubleshooting

### CORS Errors

If you see CORS errors when fetching:
- Ensure Apps Script is deployed with "Anyone" access
- Check the API URL is correct in config.js

### Events Not Loading

1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Verify Apps Script returns valid JSON

### Build Failures

- Ensure Node.js is installed: `node --version`
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## CI/CD

The project includes GitHub Actions workflow for:
- Running tests on push
- Deploying to GitHub Pages

See `.github/workflows/` for configuration.
