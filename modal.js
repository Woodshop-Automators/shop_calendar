function openModal(event) {
    const modal = document.getElementById('event-modal');
    const titleEl = document.getElementById('modal-title');
    const detailsEl = document.getElementById('modal-details');

    titleEl.textContent = event.EventName || 'Untitled Event';

    // Extract date and time from EventKey (format: EventName|Date|Time)
    const eventKeyParts = String(event.EventKey).split('|');
    const dateStr = eventKeyParts[1] || null;
    const timeStr = eventKeyParts[2] || '00:00';
    
    // Parse date without timezone issues by splitting YYYY-MM-DD
    let startDate = new Date();
    if (dateStr) {
        const [year, month, day] = dateStr.split('-').map(Number);
        startDate = new Date(year, month - 1, day);
    }
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    startDate.setHours(hours, minutes);
    
    const duration = parseInt(event.Duration) || parseInt(event.EventDuration) || 120;
    
    const endDate = new Date(startDate);
    endDate.setHours(hours, minutes + duration);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const formatDuration = (mins) => {
        const hrs = Math.floor(mins / 60);
        const minsRem = mins % 60;
        if (hrs === 0) return `${minsRem} minutes`;
        if (minsRem === 0) return hrs === 1 ? '1 hour' : `${hrs} hours`;
        return `${hrs} hour${hrs > 1 ? 's' : ''} ${minsRem} minutes`;
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    let detailsHTML = `
        <div class="modal-detail">
            <strong>Date</strong>
            <p>${formatDate(startDate)}</p>
        </div>
        <div class="modal-detail">
            <strong>Time</strong>
            <p>${formatTime(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), hours, minutes))} - ${formatTime(endDate)}</p>
        </div>
        <div class="modal-detail">
            <strong>Duration</strong>
            <p>${formatDuration(duration)}</p>
        </div>
    `;

    if (event.Stewards) {
        detailsHTML += `
            <div class="modal-detail">
                <strong>Stewards</strong>
                <p>${event.Stewards}</p>
            </div>
        `;
    }

    if (event.ParticipantNames) {
        detailsHTML += `
            <div class="modal-detail">
                <strong>Participants</strong>
                <p>${event.ParticipantNames}</p>
            </div>
        `;
    }

    if (event.Costs) {
        detailsHTML += `
            <div class="modal-detail">
                <strong>Cost</strong>
                <p>${event.Costs}</p>
            </div>
        `;
    }

    if (event.Notes) {
        detailsHTML += `
            <div class="modal-detail">
                <strong>Notes</strong>
                <p>${event.Notes}</p>
            </div>
        `;
    }

    const ticketUrlRaw = event['Ticket URL'] || event.TicketIDs || '';
    if (ticketUrlRaw) {
        const ticketUrl = ticketUrlRaw.startsWith('http') 
            ? ticketUrlRaw 
            : `https://${ticketUrlRaw}`;
        detailsHTML += `
            <a href="${ticketUrl}" target="_blank" class="ticket-link">Get Tickets</a>
        `;
    }

    detailsEl.innerHTML = detailsHTML;
    modal.style.display = 'block';
}

function extractTimeFromEventKey(eventKey) {
    if (!eventKey) return null;
    const parts = String(eventKey).split('|');
    return parts[2] || null; // Format: EventName|Date|Time
}

function closeModal() {
    const modal = document.getElementById('event-modal');
    modal.style.display = 'none';
}

function initModal() {
    const closeBtn = document.querySelector('.modal .close');
    const modal = document.getElementById('event-modal');

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}
