let cachedEvents = [];
let lastFetchTime = null;

async function fetchEvents() {
    try {
        const response = await fetch(CONFIG.API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const events = await response.json();
        cachedEvents = events;
        lastFetchTime = new Date();
        updateLastUpdatedDisplay();
        return events;
    } catch (error) {
        console.error('Failed to fetch events:', error);
        throw error;
    }
}

function getEventsForMonth(year, month) {
    return cachedEvents.filter(event => {
        const eventDate = new Date(event.Date);
        return eventDate.getFullYear() === year && 
               eventDate.getMonth() === month;
    });
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
