let cachedEvents = [];
let lastFetchTime = null;

async function fetchEvents() {
    try {
        console.log('Fetching from:', CONFIG.API_URL);
        const response = await fetch(CONFIG.API_URL);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.error) {
            throw new Error(data.message || 'API returned error');
        }
        cachedEvents = Array.isArray(data) ? data : (data.events || []);
        console.log('Cached events count:', cachedEvents.length);
        console.log('First event sample:', cachedEvents[0]);
        
        lastFetchTime = new Date();
        updateLastUpdatedDisplay();
        return cachedEvents;
    } catch (error) {
        console.error('Failed to fetch events:', error);
        throw error;
    }
}

function getEventsForMonth(year, month) {
    const filtered = cachedEvents.filter(event => {
        const dateStr = extractDateFromEventKey(event.EventKey);
        if (!dateStr) {
            console.log('No date for event:', event.EventName, 'EventKey:', event.EventKey);
            return false;
        }
        const eventDate = new Date(dateStr);
        console.log('Event:', event.EventName, 'DateStr:', dateStr, 'Parsed:', eventDate, 'Year:', eventDate.getFullYear(), 'Month:', eventDate.getMonth(), 'Target:', year, month);
        
        return !isNaN(eventDate) && 
               eventDate.getFullYear() === year && 
               eventDate.getMonth() === month;
    });
    console.log('Filtered events for', year, month, ':', filtered.length);
    return filtered;
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
