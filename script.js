// Enhanced game variables
let score = 0;
let level = 1;
let lives = 3;
let timer;
let timeLeft = 100;
let gameActive = false;
let correctAnswer;
let combo = 0;
let comboMultiplier = 1;
let powerUps = {
    time: { count: 3, active: false },
    double: { count: 2, active: false },
    skip: { count: 5, active: false },
    life: { count: 1, active: false }
};
let levelProgress = 0;
let gamePaused = false;
let difficulty = "easy";

// Enhanced color library
const colorNames = [
    "Crimson", "RoyalBlue", "ForestGreen", "Goldenrod", "DarkOrchid",
    "Tomato", "DodgerBlue", "LimeGreen", "Gold", "MediumPurple",
    "Coral", "DeepSkyBlue", "SpringGreen", "Khaki", "MediumSlateBlue",
    "Salmon", "CornflowerBlue", "SeaGreen", "LemonChiffon", "Plum",
    "FireBrick", "SteelBlue", "OliveDrab", "DarkKhaki", "DarkViolet",
    "LightCoral", "SkyBlue", "PaleGreen", "LightGoldenrodYellow", "Thistle"
];

const colorValues = [
    "#DC143C", "#4169E1", "#228B22", "#DAA520", "#9932CC",
    "#FF6347", "#1E90FF", "#32CD32", "#FFD700", "#9370DB",
    "#FF7F50", "#00BFFF", "#00FF7F", "#F0E68C", "#7B68EE",
    "#FA8072", "#6495ED", "#2E8B57", "#FFFACD", "#DDA0DD",
    "#B22222", "#4682B4", "#6B8E23", "#BDB76B", "#9400D3",
    "#F08080", "#87CEEB", "#98FB98", "#FAFAD2", "#D8BFD8"
];

// DOM elements
const colorDisplay = document.getElementById('color-display');
const options = document.querySelectorAll('.option');
const scoreValue = document.getElementById('score-value');
const levelValue = document.getElementById('level-value');
const livesValue = document.getElementById('lives-value');
const comboValue = document.getElementById('combo-value');
const timerBar = document.getElementById('timer-bar');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const pauseBtn = document.getElementById('pause-btn');
const message = document.getElementById('message');
const levelBar = document.getElementById('level-bar');
const comboDisplay = document.getElementById('combo-display');
const bonusNotification = document.getElementById('bonus-notification');
const particlesContainer = document.getElementById('particles');
const powerUpElements = document.querySelectorAll('.power-up');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

// Create floating particles
function createParticles() {
    particlesContainer.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random properties
        const size = Math.random() * 10 + 5;
        const posX = Math.random() * 100;
        const duration = Math.random() * 20 + 15;
        const delay = Math.random() * 10;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.opacity = Math.random() * 0.7 + 0.1;
        
        particlesContainer.appendChild(particle);
    }
}

// Initialize game
function initGame() {
    score = 0;
    level = 1;
    lives = 3;
    timeLeft = 100;
    combo = 0;
    comboMultiplier = 1;
    levelProgress = 0;
    gameActive = false;
    gamePaused = false;
    updateUI();
    
    // Reset power-ups
    powerUps = {
        time: { count: 3, active: false },
        double: { count: 2, active: false },
        skip: { count: 5, active: false },
        life: { count: 1, active: false }
    };
    updatePowerUps();
    
    // Reset button states
    startBtn.innerHTML = '<i class="fas fa-play"></i> START GAME';
    startBtn.disabled = false;
    clearInterval(timer);
    
    // Reset display
    colorDisplay.style.backgroundColor = "#333";
    colorDisplay.classList.remove('pulse', 'glow');
    options.forEach(option => {
        option.textContent = "Option " + option.dataset.option;
        option.style.pointerEvents = "none";
        option.classList.remove('correct', 'incorrect');
    });
    
    levelBar.style.width = "0%";
    comboDisplay.classList.remove('show');
    
    // Create particles
    createParticles();
}

// Start the game
function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    startBtn.innerHTML = '<i class="fas fa-rocket"></i> PLAYING...';
    startBtn.disabled = true;
    generateQuestion();
    startTimer();
    
    // Show combo display
    comboDisplay.textContent = `Combo: ${comboMultiplier}x`;
    comboDisplay.classList.add('show');
}

// Generate a new question
function generateQuestion() {
    // Select random color index
    const correctIndex = Math.floor(Math.random() * colorValues.length);
    correctAnswer = colorNames[correctIndex];
    
    // Set display color with animation
    colorDisplay.style.backgroundColor = colorValues[correctIndex];
    colorDisplay.classList.add('pulse');
    
    // Generate options
    const optionIndices = [correctIndex];
    
    // Add 3 random wrong options
    while (optionIndices.length < 4) {
        const randomIndex = Math.floor(Math.random() * colorNames.length);
        if (!optionIndices.includes(randomIndex)) {
            optionIndices.push(randomIndex);
        }
    }
    
    // Shuffle options
    shuffleArray(optionIndices);
    
    // Assign text to options
    options.forEach((option, index) => {
        option.textContent = colorNames[optionIndices[index]];
        option.style.pointerEvents = "auto";
        option.classList.remove('correct', 'incorrect');
    });
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Start the timer
function startTimer() {
    if (gamePaused) return;
    
    clearInterval(timer);
    timeLeft = 100;
    timerBar.style.width = "100%";
    
    // Adjust timer speed based on difficulty
    let timerSpeed = 100;
    if (difficulty === "medium") timerSpeed = 80;
    if (difficulty === "hard") timerSpeed = 60;
    
    timer = setInterval(() => {
        if (gamePaused) return;
        
        timeLeft -= 1;
        timerBar.style.width = timeLeft + "%";
        
        // Change color as time runs out
        if (timeLeft < 20) {
            timerBar.style.background = "linear-gradient(to right, #ff5e62, #ff0000)";
            timerBar.classList.add('glow');
        } else if (timeLeft < 50) {
            timerBar.style.background = "linear-gradient(to right, #ff9966, #ff5e62)";
            timerBar.classList.remove('glow');
        } else {
            timerBar.style.background = "linear-gradient(to right, #4facfe, #00f2fe, #00ff7f)";
            timerBar.classList.remove('glow');
        }
        
        // Time's up
        if (timeLeft <= 0) {
            clearInterval(timer);
            loseLife();
            if (lives > 0 && !gamePaused) {
                generateQuestion();
                startTimer();
            }
        }
    }, timerSpeed - (level * 5)); // Timer gets faster with level
}

// Check answer
function checkAnswer(selectedOption) {
    if (!gameActive || gamePaused) return;
    
    const selectedText = selectedOption.textContent;
    const isCorrect = (selectedText === correctAnswer);
    
    // Visual feedback
    if (isCorrect) {
        // Correct answer
        selectedOption.classList.add('correct');
        message.textContent = `Correct! +${10 * level * comboMultiplier} points`;
        message.className = "message correct show";
        score += 10 * level * comboMultiplier;
        
        // Increase combo
        combo++;
        if (combo % 5 === 0) {
            comboMultiplier = Math.floor(combo / 5) + 1;
            bonusNotification.textContent = `COMBO x${comboMultiplier}!`;
            bonusNotification.style.animation = 'none';
            setTimeout(() => {
                bonusNotification.style.animation = 'bonusAppear 1.5s forwards';
            }, 10);
        }
        
        // Update combo display
        comboValue.textContent = `${comboMultiplier}x`;
        comboDisplay.textContent = `Combo: ${comboMultiplier}x`;
        
        // Create score popup
        createScorePopup(10 * level * comboMultiplier);
        
        // Level up progress
        levelProgress += 10;
        levelBar.style.width = `${levelProgress}%`;
        
        // Level up every 100 progress
        if (levelProgress >= 100) {
            levelUp();
            levelProgress = 0;
        }
    } else {
        // Wrong answer
        selectedOption.classList.add('incorrect');
        message.textContent = "Wrong! The correct color was " + correctAnswer;
        message.className = "message incorrect show";
        
        // Reset combo
        combo = 0;
        comboMultiplier = 1;
        comboValue.textContent = "1x";
        comboDisplay.textContent = "Combo: 1x";
        
        loseLife();
    }
    
    // Update UI
    updateUI();
    
    // Show message then hide after delay
    setTimeout(() => {
        message.classList.remove('show');
        
        if (lives > 0 && !gamePaused) {
            generateQuestion();
            // Reset timer
            timeLeft = 100;
            timerBar.style.width = "100%";
        }
    }, 1500);
    
    // Disable options during feedback
    options.forEach(option => {
        option.style.pointerEvents = "none";
        
        // Highlight correct answer
        if (option.textContent === correctAnswer) {
            option.classList.add('correct');
        }
    });
}

// Create floating score popup
function createScorePopup(points) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+' + points;
    popup.style.color = '#4facfe';
    popup.style.left = (Math.random() * 60 + 20) + '%';
    popup.style.top = '50%';
    
    document.body.appendChild(popup);
    
    // Remove after animation
    setTimeout(() => {
        popup.remove();
    }, 1200);
}

// Level up
function levelUp() {
    level++;
    createConfetti();
    
    // Update UI
    levelValue.textContent = level;
    
    // Speed up timer
    clearInterval(timer);
    startTimer();
    
    // Visual feedback
    levelBar.style.background = "linear-gradient(to right, #ff9966, #ffcc33, #ff5e62, #ff0000)";
    setTimeout(() => {
        levelBar.style.background = "linear-gradient(to right, #ff9966, #ffcc33, #ff5e62)";
    }, 1000);
}

// Lose a life
function loseLife() {
    lives--;
    
    if (lives <= 0) {
        gameOver();
    }
    
    // Update UI
    updateLives();
}

// Game over
function gameOver() {
    gameActive = false;
    clearInterval(timer);
    
    startBtn.disabled = false;
    startBtn.innerHTML = '<i class="fas fa-redo"></i> PLAY AGAIN';
    
    // Show game over message
    message.textContent = "Game Over! Final Score: " + score;
    message.className = "message show";
    
    // Create confetti effect for game over
    createConfetti();
    
    // Reset combo display
    comboDisplay.classList.remove('show');
}

// Update UI elements
function updateUI() {
    scoreValue.textContent = score;
    levelValue.textContent = level;
    updateLives();
}

// Update lives display
function updateLives() {
    let livesHTML = "";
    for (let i = 0; i < 3; i++) {
        livesHTML += i < lives ? "❤" : "🤍";
    }
    livesValue.innerHTML = livesHTML;
}

// Update power-ups display
function updatePowerUps() {
    powerUpElements.forEach(powerUp => {
        const powerType = powerUp.dataset.power;
        const count = powerUps[powerType].count;
        
        // Update tooltip
        const tooltip = powerUp.querySelector('.power-up-tooltip');
        if (tooltip) {
            const powerName = powerType === 'time' ? 'Freeze Timer' : 
                             powerType === 'double' ? 'Double Points' : 
                             powerType === 'skip' ? 'Skip Question' : 
                             'Extra Life';
            tooltip.textContent = `${powerName} (${count} uses)`;
        }
        
        // Disable if no uses left
        if (count <= 0) {
            powerUp.classList.add('disabled');
        } else {
            powerUp.classList.remove('disabled');
        }
    });
}

// Create confetti effect
function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff9900', '#ff66cc'];
    const container = document.querySelector('.container');
    
    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.opacity = "1";
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.width = `${Math.random() * 15 + 5}px`;
        confetti.style.height = `${Math.random() * 15 + 5}px`;
        
        document.body.appendChild(confetti);
        
        // Animate confetti
        const animation = confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: 2000 + Math.random() * 3000,
            easing: 'cubic-bezier(0,0,0.2,1)'
        });
        
        // Remove after animation
        animation.onfinish = () => confetti.remove();
    }
}

// Use power-up
function usePowerUp(powerType) {
    if (!gameActive || gamePaused || powerUps[powerType].count <= 0) return;
    
    powerUps[powerType].count--;
    updatePowerUps();
    
    switch (powerType) {
        case 'time':
            // Freeze timer for 5 seconds
            clearInterval(timer);
            timerBar.style.background = "linear-gradient(to right, #00ffff, #00ccff)";
            setTimeout(() => {
                if (gameActive && !gamePaused) startTimer();
            }, 5000);
            break;
            
        case 'double':
            // Activate double points for 3 questions
            powerUps.double.active = true;
            comboMultiplier *= 2;
            comboValue.textContent = `${comboMultiplier}x`;
            comboDisplay.textContent = `Combo: ${comboMultiplier}x`;
            break;
            
        case 'skip':
            // Skip current question
            generateQuestion();
            timeLeft = 100;
            timerBar.style.width = "100%";
            break;
            
        case 'life':
            // Add extra life
            lives = Math.min(lives + 1, 3);
            updateLives();
            break;
    }
}

// Pause/Resume game
function togglePause() {
    if (!gameActive) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> RESUME';
        clearInterval(timer);
        message.textContent = "Game Paused";
        message.className = "message show";
    } else {
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
        message.classList.remove('show');
        startTimer();
    }
}

// Set difficulty
function setDifficulty(level) {
    difficulty = level;
    
    // Update UI
    difficultyBtns.forEach(btn => {
        if (btn.dataset.diff === level) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Event Listeners
startBtn.addEventListener('click', () => {
    if (!gameActive) {
        startGame();
    }
});

resetBtn.addEventListener('click', initGame);

pauseBtn.addEventListener('click', togglePause);

options.forEach(option => {
    option.addEventListener('click', () => {
        checkAnswer(option);
    });
});

// Power-up event listeners
powerUpElements.forEach(powerUp => {
    powerUp.addEventListener('click', () => {
        if (!powerUp.classList.contains('disabled')) {
            usePowerUp(powerUp.dataset.power);
        }
    });
});

// Difficulty event listeners
difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setDifficulty(btn.dataset.diff);
    });
});

// Social sharing
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Create pulse effect
        btn.classList.add('pulse');
        setTimeout(() => {
            btn.classList.remove('pulse');
        }, 500);
        
        // Fake share functionality
        message.textContent = "Challenge shared!";
        message.className = "message show";
        
        setTimeout(() => {
            message.classList.remove('show');
        }, 2000);
    });
});

// Initialize game on load
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    createParticles();
});