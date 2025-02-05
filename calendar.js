class Calendar {
    constructor() {
        this.date = new Date();
        this.currentMonth = this.date.getMonth();
        this.currentYear = this.date.getFullYear();
        this.monthDisplay = document.getElementById('monthDisplay');
        this.calendarDays = document.getElementById('calendarDays');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.selectedDateEvents = document.getElementById('selectedDateEvents');
        
        this.initializeCalendar();
        this.loadTasks();
    }

    loadTasks() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    }

    initializeCalendar() {
        if (this.prevMonthBtn && this.nextMonthBtn) {
            this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
            this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
        }
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderCalendar();
            });
        });

        this.renderCalendar();
    }

    changeMonth(delta) {
        this.currentMonth += delta;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.renderCalendar();
    }

    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    renderCalendar() {
        if (!this.calendarDays) return;

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const daysInMonth = this.getDaysInMonth(this.currentYear, this.currentMonth);
        const startingDay = firstDay.getDay();
        
        if (this.monthDisplay) {
            this.monthDisplay.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${this.currentYear}`;
        }
        
        let calendarHTML = '';
        
        // Add day headers
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            calendarHTML += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        const today = new Date();
        const currentDate = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === currentDate && 
                           this.currentMonth === currentMonth && 
                           this.currentYear === currentYear;
            
            const isPast = new Date(this.currentYear, this.currentMonth, day) < new Date(currentYear, currentMonth, currentDate);
            
            const hasEvents = this.tasks.some(task => {
                const taskDate = new Date(task.date);
                return taskDate.getDate() === day && 
                       taskDate.getMonth() === this.currentMonth && 
                       taskDate.getFullYear() === this.currentYear;
            });
            
            const classes = [
                'calendar-day',
                isToday ? 'today' : '',
                isPast ? 'past' : '',
                hasEvents ? 'has-events' : ''
            ].filter(Boolean).join(' ');
            
            calendarHTML += `
                <div class="${classes}" data-date="${this.currentYear}-${this.currentMonth + 1}-${day}">
                    <span class="day-number">${day}</span>
                    ${hasEvents ? '<span class="event-dot"></span>' : ''}
                </div>
            `;
        }
        
        this.calendarDays.innerHTML = calendarHTML;
        
        // Add click event listeners to days
        this.calendarDays.querySelectorAll('.calendar-day:not(.empty)').forEach(day => {
            day.addEventListener('click', () => this.showEvents(day.dataset.date));
        });
    }

    showEvents(dateString) {
        if (!dateString || !this.selectedDateEvents) return;
        
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        
        const events = this.tasks.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate.getDate() === day && 
                   taskDate.getMonth() === month - 1 && 
                   taskDate.getFullYear() === year;
        });
        
        let eventsHTML = `
            <h4>${date.toLocaleDateString('default', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</h4>
        `;
        
        if (events.length > 0) {
            eventsHTML += '<ul class="event-list">';
            events.forEach(event => {
                eventsHTML += `
                    <li class="event-item ${event.priority}">
                        <span class="event-title">${event.text}</span>
                        <span class="event-time">${event.time || ''}</span>
                        <span class="event-status">${event.completed ? '✓' : '○'}</span>
                    </li>
                `;
            });
            eventsHTML += '</ul>';
        } else {
            eventsHTML += '<p class="no-events">No events scheduled for this day</p>';
        }
        
        this.selectedDateEvents.innerHTML = eventsHTML;
    }
}

// Initialize calendar when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.calendar-container')) {
        new Calendar();
    }
});