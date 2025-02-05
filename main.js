// Task Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Dashboard Elements
const todayTasks = document.getElementById('todayTasks');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const timer = document.getElementById('timer');
const startTimerBtn = document.getElementById('startTimer');
const resetTimerBtn = document.getElementById('resetTimer');

// Timer Implementation
let timeLeft = 25 * 60; // 25 minutes in seconds
let timerId = null;

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
    } else {
        clearInterval(timerId);
        timerId = null;
        alert('Study session complete! Take a break.');
        startTimerBtn.textContent = 'Start';
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    if (timer) {
        timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Timer Controls
if (startTimerBtn) {
    startTimerBtn.addEventListener('click', () => {
        if (timerId === null) {
            timerId = setInterval(updateTimer, 1000);
            startTimerBtn.textContent = 'Pause';
        } else {
            clearInterval(timerId);
            timerId = null;
            startTimerBtn.textContent = 'Start';
        }
    });
}

if (resetTimerBtn) {
    resetTimerBtn.addEventListener('click', () => {
        clearInterval(timerId);
        timerId = null;
        timeLeft = 25 * 60;
        updateTimerDisplay();
        startTimerBtn.textContent = 'Start';
    });
}

// Update Today's Tasks
function updateTodayTasks() {
    if (!todayTasks) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysList = tasks.filter(task => {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
    });

    if (todaysList.length === 0) {
        todayTasks.innerHTML = '<p class="no-tasks">No tasks scheduled for today</p>';
        return;
    }

    todayTasks.innerHTML = todaysList.map(task => `
        <div class="task-item ${task.priority}">
            <div class="task-content">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                    onchange="toggleTask(${task.id})">
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
            </div>
            <span class="task-priority">${task.priority}</span>
        </div>
    `).join('');
}

// Update Progress
function updateProgress() {
    if (!progressBar || !progressText) return;

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}% Complete`;
}

// Toggle Task Completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateTodayTasks();
        updateProgress();
    }
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    updateTodayTasks();
    updateProgress();
    updateTimerDisplay();
});