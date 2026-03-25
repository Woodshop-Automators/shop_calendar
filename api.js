let cachedEvents = [];
let lastFetchTime = null;

const CACHE_KEY = 'calendar_events';
const CACHE_TIMESTAMP_KEY = 'calendar_events_timestamp';

function getCachedEvents() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        if (cached && timestamp) {
            return {
                events: JSON.parse(cached),
                timestamp: new Date(timestamp)
            };
        }
    } catch (e) {
        console.warn('Failed to read from localStorage:', e);
    }
    return null;
}

function setCachedEvents(events) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(events));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
    } catch (e) {
        console.warn('Failed to write to localStorage:', e);
    }
}

async function fetchEvents(forceRefresh = false) {
    // Try to load from cache first if not forcing refresh
    if (!forceRefresh) {
        const cached = getCachedEvents();
        if (cached && cached.events.length > 0) {
            cachedEvents = cached.events;
            lastFetchTime = cached.timestamp;
            updateLastUpdatedDisplay();
        }
    }
    
    try {
        const response = await fetch(CONFIG.API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.message || 'API returned error');
        }
        const newEvents = Array.isArray(data) ? data : (data.events || []);
        
        // Update cache if we got fresh data
        if (newEvents.length > 0) {
            setCachedEvents(newEvents);
        }
        
        cachedEvents = newEvents;
        lastFetchTime = new Date();
        updateLastUpdatedDisplay();
        return cachedEvents;
    } catch (error) {
        console.error('Failed to fetch events:', error);
        // If fetch fails but we have cached data, don't throw
        if (cachedEvents.length > 0) {
            return cachedEvents;
        }
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
    fetchEvents(); // Initial fetch (will use cache if available)
    setInterval(() => fetchEvents(true), CONFIG.REFRESH_INTERVAL_MS);
}

function refreshEvents() {
    return fetchEvents(true);
}
