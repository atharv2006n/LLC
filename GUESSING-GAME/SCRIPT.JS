// implement guessing game logic with difficulty levels random number and limited attempts

// compare user input with target number and show hints and score updates

// handle game reset replay and store best score using local storage
// Get DOM elements
const guessInput = document.getElementById('guessInput');
const submitBtn = document.getElementById('submitBtn');
const feedback = document.getElementById('feedback');
const attemptsLeft = document.getElementById('attemptsLeft');
const scoreDisplay = document.getElementById('scoreDisplay');
const resetBtn = document.getElementById('resetBtn');
const difficultySelect = document.getElementById('difficultySelect');
const badgesContainer = document.getElementById('badgesContainer');
const themeToggle = document.getElementById('themeToggle');

// Game variables
let targetNumber;
let attempts;
let score;
let currentDifficulty;
let maxAttempts;
let bestScore = localStorage.getItem('bestScore') || 0;

// Theme management
let isDarkMode = localStorage.getItem('darkMode') === 'true';
if (isDarkMode) {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
}

// Badge system variables
let gamesPlayed = parseInt(localStorage.getItem('gamesPlayed')) || 0;
let totalCorrectGuesses = parseInt(localStorage.getItem('totalCorrectGuesses')) || 0;
let luckyWins = parseInt(localStorage.getItem('luckyWins')) || 0;
let smartGuesses = parseInt(localStorage.getItem('smartGuesses')) || 0;
let earnedBadges = JSON.parse(localStorage.getItem('earnedBadges')) || [];

// Badge definitions
const badges = {
    'first-win': {
        name: 'First Victory',
        description: 'Win your first game',
        icon: '🏆',
        condition: () => totalCorrectGuesses >= 1
    },
    'persistent': {
        name: 'Persistent Player',
        description: 'Play 10 games',
        icon: '🎯',
        condition: () => gamesPlayed >= 10
    },
    'lucky': {
        name: 'Lucky Player',
        description: 'Win on your last attempt',
        icon: '🍀',
        condition: () => luckyWins >= 1
    },
    'smart-guesser': {
        name: 'Smart Guesser',
        description: 'Guess correctly in 2 attempts or less on hard difficulty',
        icon: '🧠',
        condition: () => smartGuesses >= 1
    },
    'high-scorer': {
        name: 'High Scorer',
        description: 'Achieve a score of 500 or more',
        icon: '⭐',
        condition: () => bestScore >= 500
    },
    'master': {
        name: 'Master Guesser',
        description: 'Play 50 games and maintain high accuracy',
        icon: '👑',
        condition: () => gamesPlayed >= 50 && (totalCorrectGuesses / gamesPlayed) >= 0.7
    }
};

// Scoring multipliers based on difficulty
const scoreMultipliers = {
    easy: { pointsPerAttempt: 1, correctBonus: 20 },
    medium: { pointsPerAttempt: 2, correctBonus: 50 },
    hard: { pointsPerAttempt: 5, correctBonus: 100 }
};

// Initialize game
function initGame() {
    currentDifficulty = difficultySelect.value;
    switch (currentDifficulty) {
        case 'easy':
            targetNumber = Math.floor(Math.random() * 10) + 1;
            maxAttempts = 5;
            break;
        case 'medium':
            targetNumber = Math.floor(Math.random() * 50) + 1;
            maxAttempts = 7;
            break;
        case 'hard':
            targetNumber = Math.floor(Math.random() * 100) + 1;
            maxAttempts = 10;
            break;
    }
    attempts = maxAttempts;
    score = 0;
    feedback.textContent = '';
    attemptsLeft.textContent = `Attempts Left: ${attempts}`;
    updateScoreDisplay();
    guessInput.value = '';
    guessInput.disabled = false;
    submitBtn.disabled = false;
    guessInput.focus();
    displayBadges();
}

// Check and award badges
function checkBadges() {
    let newBadges = [];
    for (const [key, badge] of Object.entries(badges)) {
        if (!earnedBadges.includes(key) && badge.condition()) {
            earnedBadges.push(key);
            newBadges.push(badge);
        }
    }

    if (newBadges.length > 0) {
        localStorage.setItem('earnedBadges', JSON.stringify(earnedBadges));
        displayBadges();
        showBadgeNotification(newBadges);
    }
}

// Display earned badges
function displayBadges() {
    badgesContainer.innerHTML = '';
    earnedBadges.forEach(badgeKey => {
        const badge = badges[badgeKey];
        const badgeElement = document.createElement('div');
        badgeElement.className = 'badge earned';
        badgeElement.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-info">
                <div class="badge-name">${badge.name}</div>
                <div class="badge-description">${badge.description}</div>
            </div>
        `;
        badgesContainer.appendChild(badgeElement);
    });
}

// Show notification for new badges
function showBadgeNotification(newBadges) {
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
        <h3>🎉 New Badge${newBadges.length > 1 ? 's' : ''} Earned!</h3>
        ${newBadges.map(badge => `
            <div class="notification-badge">
                <span class="badge-icon">${badge.icon}</span>
                <span class="badge-name">${badge.name}</span>
            </div>
        `).join('')}
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Update score display with best score
function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score} | Best: ${bestScore}`;
}

// Handle guess submission
submitBtn.addEventListener('click', () => {
    const userGuess = parseInt(guessInput.value);
    if (isNaN(userGuess)) {
        feedback.textContent = 'Please enter a valid number.';
        return;
    }

    if (userGuess < 1 || (currentDifficulty === 'easy' && userGuess > 10) ||
        (currentDifficulty === 'medium' && userGuess > 50) ||
        (currentDifficulty === 'hard' && userGuess > 100)) {
        feedback.textContent = 'Please enter a number in the valid range.';
        return;
    }

    attempts--;
    const multiplier = scoreMultipliers[currentDifficulty];

    if (userGuess === targetNumber) {
        const correctBonus = multiplier.correctBonus + (attempts * multiplier.pointsPerAttempt);
        score += correctBonus;
        totalCorrectGuesses++;
        localStorage.setItem('totalCorrectGuesses', totalCorrectGuesses);

        // Check for lucky win (won on last attempt)
        if (attempts === 0) {
            luckyWins++;
            localStorage.setItem('luckyWins', luckyWins);
        }

        // Check for smart guess (correct in 2 attempts or less on hard)
        if (currentDifficulty === 'hard' && (maxAttempts - attempts) <= 2) {
            smartGuesses++;
            localStorage.setItem('smartGuesses', smartGuesses);
        }

        feedback.textContent = `🎉 Correct! +${correctBonus} points!`;
        updateBestScore();
        endGame();
        checkBadges();
    } else if (userGuess < targetNumber) {
        score += multiplier.pointsPerAttempt;
        feedback.textContent = `Too low! +${multiplier.pointsPerAttempt} point`;
    } else {
        score += multiplier.pointsPerAttempt;
        feedback.textContent = `Too high! +${multiplier.pointsPerAttempt} point`;
    }

    attemptsLeft.textContent = `Attempts Left: ${attempts}`;
    updateScoreDisplay();
    guessInput.value = '';

    if (attempts === 0 && userGuess !== targetNumber) {
        feedback.textContent = `Game Over! The number was ${targetNumber}. Final Score: ${score}`;
        endGame();
        checkBadges();
    }
});

// Update best score in local storage
function updateBestScore() {
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
    }
}

// End game and disable input
function endGame() {
    guessInput.disabled = true;
    submitBtn.disabled = true;
    gamesPlayed++;
    localStorage.setItem('gamesPlayed', gamesPlayed);
}

// Handle game reset
resetBtn.addEventListener('click', initGame);

// Handle theme toggle
themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark');
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDarkMode);
});

// Handle difficulty change
difficultySelect.addEventListener('change', initGame);

// Allow Enter key to submit guess
guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitBtn.click();
    }
});

// Initialize the game on page load
window.addEventListener('load', () => {
    initGame();
    checkBadges();
});
