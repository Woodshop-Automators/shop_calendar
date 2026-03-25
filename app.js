let currentYear;
let currentMonth;
let isRefreshing = false;

function init() {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();

    initModal();
    setupNavigation();
    setupRetryButton();
    setupRefreshButton();
    
    loadAndRender();
    startAutoRefresh();
}

async function loadAndRender(forceRefresh = false) {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const gridEl = document.getElementById('calendar-grid');
    const refreshBtn = document.getElementById('refresh-btn');

    if (!forceRefresh) {
        // Check if we have cached data - if so, render immediately without loading spinner
        const cached = localStorage.getItem('calendar_events');
        if (cached) {
            try {
                const events = JSON.parse(cached);
                if (events.length > 0) {
                    renderCalendar();
                }
            } catch (e) {}
        }
    }
    
    if (forceRefresh && refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.textContent = '...';
    }

    loadingEl.style.display = forceRefresh ? 'block' : 'none';
    errorEl.style.display = 'none';
    gridEl.innerHTML = '';

    try {
        await fetchEvents(forceRefresh);
        loadingEl.style.display = 'none';
        renderCalendar();
    } catch (error) {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
    } finally {
        if (refreshBtn && forceRefresh) {
            refreshBtn.disabled = false;
            refreshBtn.textContent = '↻ Refresh';
        }
    }
}

function renderCalendar() {
    const gridEl = document.getElementById('calendar-grid');
    const monthDisplay = document.getElementById('current-month');
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    monthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    gridEl.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === currentYear && 
                           today.getMonth() === currentMonth;

    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const cell = createDayCell(day, true);
        gridEl.appendChild(cell);
    }

    const events = getEventsForMonth(currentYear, currentMonth);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = createDayCell(day, false, isCurrentMonth && day === today.getDate());
        let dayEvents = events.filter(e => {
            const eventKeyParts = String(e.EventKey).split('|');
            const dateStr = eventKeyParts[1];
            if (!dateStr) return false;
            // Parse YYYY-MM-DD manually to avoid timezone issues
            const [year, month, d] = dateStr.split('-').map(Number);
            return year === currentYear && (month - 1) === currentMonth && d === day;
        });
        
        // Sort by start time (earlier times first)
        dayEvents.sort((a, b) => {
            const timeA = String(a.EventKey).split('|')[2] || '00:00';
            const timeB = String(b.EventKey).split('|')[2] || '00:00';
            return timeA.localeCompare(timeB);
        });
        
        dayEvents.forEach(event => {
            const eventBlock = createEventBlock(event);
            cell.appendChild(eventBlock);
        });
        
        gridEl.appendChild(cell);
    }

    const totalCells = gridEl.children.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const cell = createDayCell(day, true);
        gridEl.appendChild(cell);
    }
}

function createDayCell(day, isOtherMonth, isToday = false) {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell';
    
    if (isOtherMonth) {
        cell.classList.add('other-month');
    }
    if (isToday) {
        cell.classList.add('today');
    }

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    return cell;
}

function createEventBlock(event) {
    const block = document.createElement('div');
    block.className = 'event-block';
    
    // Let CSS handle height - don't set fixed height
    // Use min-height instead to ensure minimum visibility
    
    // Extract duration
    const duration = parseInt(event.Duration) || parseInt(event.EventDuration) || 60;
    
    // Extract time from EventKey
    const eventKeyParts = String(event.EventKey).split('|');
    const timeStr = eventKeyParts[2] || '00:00';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const startTime = new Date(2000, 0, 1, hours, minutes);
    const timeDisplay = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    // Format duration
    const formatDuration = (mins) => {
        const hrs = Math.floor(mins / 60);
        const minsRem = mins % 60;
        if (hrs === 0) return `${minsRem}m`;
        if (minsRem === 0) return `${hrs}h`;
        return `${hrs}h ${minsRem}m`;
    };
    
    // Get steward name
    const steward = event.Stewards ? `with ${event.Stewards}` : '';
    
    // Get ticket URL if available
    let ticketHtml = '';
    const ticketUrlRaw = event['Ticket URL'] || '';
    if (ticketUrlRaw) {
        const ticketUrl = ticketUrlRaw.startsWith('http') 
            ? ticketUrlRaw 
            : `https://${ticketUrlRaw}`;
        ticketHtml = `<span class="event-ticket" data-url="${ticketUrl}">Tickets</span>`;
    }
    
    // Create block content - time and duration on same line, title always visible
    block.innerHTML = `
        <div class="event-time">${timeDisplay} - ${formatDuration(duration)}</div>
        <div class="event-title">${event.EventName || 'Event'}</div>
        ${steward ? `<div class="event-steward">${steward}</div>` : ''}
        ${ticketHtml}
    `;
    
    // Handle click - open modal or ticket link
    block.addEventListener('click', (e) => {
        const ticketEl = e.target.closest('.event-ticket');
        if (ticketEl) {
            e.stopPropagation();
            window.open(ticketEl.dataset.url, '_blank');
        } else {
            openModal(event);
        }
    });

    return block;
}

function extractDateFromEventKey(eventKey) {
    if (!eventKey) return null;
    const parts = String(eventKey).split('|');
    return parts[1] || null; // Format: EventName|Date|Time
}

function setupNavigation() {
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
}

function setupRetryButton() {
    document.getElementById('retry-btn').addEventListener('click', () => loadAndRender(true));
}

function setupRefreshButton() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => loadAndRender(true));
    }
}

document.addEventListener('DOMContentLoaded', init);
