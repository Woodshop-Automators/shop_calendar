function openModal(event) {
    const modal = document.getElementById('event-modal');
    const titleEl = document.getElementById('modal-title');
    const detailsEl = document.getElementById('modal-details');

    titleEl.textContent = event.Title || 'Untitled Event';

    const startDate = new Date(event.Date);
    const startTime = event.StartTime || '00:00';
    const duration = parseInt(event.Duration) || 0;
    
    const [hours, minutes] = startTime.split(':').map(Number);
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

    if (event.Participants) {
        detailsHTML += `
            <div class="modal-detail">
                <strong>Participants</strong>
                <p>${event.Participants}</p>
            </div>
        `;
    }

    if (event.TicketURL) {
        detailsHTML += `
            <a href="${event.TicketURL}" target="_blank" class="ticket-link">Get Tickets</a>
        `;
    }

    detailsEl.innerHTML = detailsHTML;
    modal.style.display = 'block';
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
