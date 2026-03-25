let cachedEvents = [];
let lastFetchTime = null;

async function fetchEvents() {
    try {
        const response = await fetch(CONFIG.API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.message || 'API returned error');
        }
        cachedEvents = Array.isArray(data) ? data : (data.events || []);
        lastFetchTime = new Date();
        updateLastUpdatedDisplay();
        return cachedEvents;
    } catch (error) {
        console.error('Failed to fetch events:', error);
        throw error;
    }
}

function getEventsForMonth(year, month) {
    return cachedEvents.filter(event => {
        const eventKeyParts = String(event.EventKey).split('|');
        const dateStr = eventKeyParts[1];
        if (!dateStr) return false;
        // Parse YYYY-MM-DD manually to avoid timezone issues
        const [evtYear, evtMonth] = dateStr.split('-').map(Number);
        return evtYear === year && (evtMonth - 1) === month;
    });
}

function extractDateFromEventKey(eventKey) {
    if (!eventKey) return null;
    const parts = String(eventKey).split('|');
    return parts[1] || null; // Format: EventName|Date|Time
}

function getEventById(id) {
    return cachedEvents.find(event => event.id === id);
}

function updateLastUpdatedDisplay() {
    const element = document.getElementById('last-updated');
    if (element && lastFetchTime) {
        element.textContent = `Last updated: ${lastFetchTime.toLocaleTimeString()}`;
    }
}

function startAutoRefresh() {
    fetchEvents();
    setInterval(fetchEvents, CONFIG.REFRESH_INTERVAL_MS);
}
