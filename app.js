let currentYear;
let currentMonth;

function init() {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();

    initModal();
    setupNavigation();
    setupRetryButton();
    
    loadAndRender();
    startAutoRefresh();
}

async function loadAndRender() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const gridEl = document.getElementById('calendar-grid');

    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    gridEl.innerHTML = '';

    try {
        await fetchEvents();
        loadingEl.style.display = 'none';
        renderCalendar();
    } catch (error) {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
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
        const dayEvents = events.filter(e => {
            const eventKeyParts = String(e.EventKey).split('|');
            const dateStr = eventKeyParts[1];
            if (!dateStr) return false;
            // Parse YYYY-MM-DD manually to avoid timezone issues
            const [year, month, d] = dateStr.split('-').map(Number);
            return year === currentYear && (month - 1) === currentMonth && d === day;
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
    
    const duration = parseInt(event.Duration) || parseInt(event.EventDuration) || 120;
    const height = Math.min(
        Math.max(duration * CONFIG.EVENT_HEIGHT_MULTIPLIER, CONFIG.EVENT_MIN_HEIGHT),
        CONFIG.EVENT_MAX_HEIGHT
    );
    block.style.height = `${height}px`;
    
    block.textContent = event.EventName || 'Event';
    
    block.addEventListener('click', () => {
        openModal(event);
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
    document.getElementById('retry-btn').addEventListener('click', loadAndRender);
}

document.addEventListener('DOMContentLoaded', init);
