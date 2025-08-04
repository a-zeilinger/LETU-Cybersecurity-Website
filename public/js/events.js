// Events JavaScript for Cybersecurity Club Website

document.addEventListener('DOMContentLoaded', function() {
    const eventsGrid = document.getElementById('eventsGrid');
    
    if (!eventsGrid) return;
    
    // Load events from API
    loadEvents();
    
    async function loadEvents() {
        try {
            const response = await fetch('/api/events');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const events = await response.json();
            displayEvents(events);
            
        } catch (error) {
            console.error('Error loading events:', error);
            displayError('Failed to load events. Please try again later.');
        }
    }
    
    function displayEvents(events) {
        if (events.length === 0) {
            eventsGrid.innerHTML = `
                <div class="no-events">
                    <h3>No Events Scheduled</h3>
                    <p>Check back soon for upcoming cybersecurity events and workshops.</p>
                </div>
            `;
            return;
        }
        
        const eventsHTML = events.map(event => createEventCard(event)).join('');
        eventsGrid.innerHTML = eventsHTML;
        
        // Add click handlers for event cards
        addEventCardHandlers();
    }
    
    function createEventCard(event) {
        const formattedDate = window.formatDate ? window.formatDate(event.date) : event.date;
        const formattedTime = window.formatTime ? window.formatTime(event.time) : event.time;
        
        return `
            <div class="event-card" data-event-id="${event.id}">
                <div class="event-image">
                    ${getEventIcon(event.title)}
                </div>
                <div class="event-content">
                    <div class="event-date">${formattedDate} at ${formattedTime}</div>
                    <h3 class="event-title">${escapeHtml(event.title)}</h3>
                    <div class="event-location">📍 ${escapeHtml(event.location)}</div>
                    <p class="event-description">${escapeHtml(event.description)}</p>
                    <button class="btn btn-secondary event-details-btn">Learn More</button>
                </div>
            </div>
        `;
    }
    
    function getEventIcon(title) {
        const lowerTitle = title.toLowerCase();
        
        if (lowerTitle.includes('ctf') || lowerTitle.includes('competition')) {
            return '🏆';
        } else if (lowerTitle.includes('workshop') || lowerTitle.includes('password')) {
            return '🛡️';
        } else if (lowerTitle.includes('speaker') || lowerTitle.includes('career')) {
            return '🎤';
        } else if (lowerTitle.includes('hacking') || lowerTitle.includes('penetration')) {
            return '🔓';
        } else {
            return '🔒';
        }
    }
    
    function addEventCardHandlers() {
        document.querySelectorAll('.event-details-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const eventCard = this.closest('.event-card');
                const eventId = eventCard.dataset.eventId;
                
                // Show event details modal or navigate to detailed view
                showEventDetails(eventId);
            });
        });
        
        // Add hover effects
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    function showEventDetails(eventId) {
        // For now, show a simple alert. In a real application, this would open a modal
        // or navigate to a detailed event page
        alert(`Event details for event ID: ${eventId}\n\nThis would typically open a detailed view or modal with full event information.`);
    }
    
    function displayError(message) {
        eventsGrid.innerHTML = `
            <div class="error-message">
                <div class="error-icon">❌</div>
                <h3>Error Loading Events</h3>
                <p>${escapeHtml(message)}</p>
                <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
            </div>
        `;
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Add CSS for error and no-events states
    const style = document.createElement('style');
    style.textContent = `
        .no-events, .error-message {
            text-align: center;
            padding: 3rem;
            background-color: var(--secondary);
            border-radius: var(--border-radius-lg);
            border: 1px solid var(--border);
        }
        
        .no-events h3, .error-message h3 {
            color: var(--text);
            margin-bottom: 1rem;
        }
        
        .no-events p, .error-message p {
            color: var(--text-muted);
            margin-bottom: 1.5rem;
        }
        
        .error-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .event-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .event-details-btn {
            margin-top: 1rem;
        }
    `;
    document.head.appendChild(style);
}); 