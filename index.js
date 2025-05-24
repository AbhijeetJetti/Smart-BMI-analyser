// BMI Calculator JavaScript
let bmiHistory = [];
let achievements = {
    firstCalc: false,
    healthyRange: false,
    voiceUser: false,
    healthTracker: false
};

// Voice recognition setup
let recognition;
let isListening = false;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up form event listener
    document.getElementById('bmi-form').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateBMI();
    });

    // Initialize card animations
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Add sample placeholders after delay
    setTimeout(() => {
        document.getElementById('height').placeholder = "e.g., 175";
        document.getElementById('weight').placeholder = "e.g., 70";
    }, 1000);
});

function calculateBMI() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const name = document.getElementById('name').value || 'User';

    if (!height || !weight || height <= 0 || weight <= 0) {
        alert('Please enter valid height and weight values.');
        return;
    }

    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    displayResults(bmi, height, weight, age, gender, name);
    updateHistory(bmi, name);
    checkAchievements(bmi);
    updateGamification();
}

function displayResults(bmi, height, weight, age, gender, name) {
    const resultsCard = document.getElementById('results-card');
    const bmiValue = document.getElementById('bmi-value');
    const bmiCategory = document.getElementById('bmi-category');
    
    bmiValue.textContent = bmi.toFixed(1);
    
    let category, categoryClass, healthStatus, recommendations;
    
    if (bmi < 18.5) {
        category = 'Underweight';
        categoryClass = 'category-underweight';
        healthStatus = 'You are currently underweight. Consider consulting with a healthcare professional.';
        recommendations = 'Focus on nutrient-dense foods, strength training, and gradual weight gain.';
    } else if (bmi < 25) {
        category = 'Normal Weight';
        categoryClass = 'category-normal';
        healthStatus = 'Congratulations! You are in the healthy weight range.';
        recommendations = 'Maintain your current lifestyle with balanced diet and regular exercise.';
    } else if (bmi < 30) {
        category = 'Overweight';
        categoryClass = 'category-overweight';
        healthStatus = 'You are slightly above the healthy weight range.';
        recommendations = 'Consider a balanced diet with portion control and increased physical activity.';
    } else {
        category = 'Obese';
        categoryClass = 'category-obese';
        healthStatus = 'You are in the obese range. Consider consulting with a healthcare professional.';
        recommendations = 'Focus on sustainable lifestyle changes including diet modification and regular exercise.';
    }
    
    bmiCategory.textContent = category;
    bmiCategory.className = `bmi-category ${categoryClass}`;
    
    document.getElementById('health-status').textContent = healthStatus;
    document.getElementById('recommendations').textContent = recommendations;
    
    // Calculate ideal weight range
    const idealWeightMin = (18.5 * Math.pow(height / 100, 2)).toFixed(1);
    const idealWeightMax = (24.9 * Math.pow(height / 100, 2)).toFixed(1);
    document.getElementById('ideal-weight').textContent = `${idealWeightMin} - ${idealWeightMax} kg for your height`;
    
    // Calculate daily calories (basic estimation)
    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * (age || 25));
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * (age || 25));
    }
    const dailyCalories = Math.round(bmr * 1.4); // Lightly active
    document.getElementById('daily-calories').textContent = `~${dailyCalories} calories per day`;
    
    resultsCard.classList.add('show');
    
    // Speak result
    speakResult(bmi, category, name);
}

function speakResult(bmi, category, name) {
    if ('speechSynthesis' in window) {
        const text = `Hello ${name}! Your BMI is ${bmi.toFixed(1)}, which falls in the ${category} category.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
    }
}

function updateHistory(bmi, name) {
    const timestamp = new Date().toLocaleDateString();
    bmiHistory.unshift({ bmi: bmi.toFixed(1), name, date: timestamp });
    
    if (bmiHistory.length > 5) bmiHistory.pop();
    
    const historyCard = document.getElementById('history-card');
    const historyList = document.getElementById('history-list');
    
    if (bmiHistory.length > 0) {
        historyList.innerHTML = bmiHistory.map(entry => 
            `<div class="history-item">
                <span>${entry.name} - BMI: ${entry.bmi}</span>
                <span>${entry.date}</span>
            </div>`
        ).join('');
        historyCard.style.display = 'block';
    }
}

function checkAchievements(bmi) {
    if (!achievements.firstCalc) {
        achievements.firstCalc = true;
        unlockAchievement('first-calc');
    }
    
    if (bmi >= 18.5 && bmi < 25 && !achievements.healthyRange) {
        achievements.healthyRange = true;
        unlockAchievement('healthy-range');
    }
    
    if (bmiHistory.length >= 3 && !achievements.healthTracker) {
        achievements.healthTracker = true;
        unlockAchievement('health-tracker');
    }
}

function unlockAchievement(achievementId) {
    const achievement = document.getElementById(achievementId);
    achievement.classList.add('unlocked');
    
    // Show achievement notification
    if (achievement) {
        const achievementText = achievement.querySelector('div:last-child').textContent;
        showNotification(`🎉 Achievement Unlocked: ${achievementText}!`);
    }
}

function updateGamification() {
    const gamificationCard = document.getElementById('gamification-card');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    gamificationCard.style.display = 'block';
    
    let progress = 0;
    if (achievements.firstCalc) progress += 25;
    if (achievements.voiceUser) progress += 25;
    if (achievements.healthyRange) progress += 25;
    if (achievements.healthTracker) progress += 25;
    
    progressFill.style.width = progress + '%';
    progressText.textContent = `Health Journey Progress: ${progress}%`;
}

function startVoiceInput() {
    if (!recognition) {
        alert('Voice recognition not supported in this browser.');
        return;
    }
    
    const voiceIcon = document.getElementById('voice-icon');
    
    if (!isListening) {
        recognition.start();
        isListening = true;
        voiceIcon.innerHTML = '<span class="voice-animation">🎙️</span>';
        voiceIcon.parentElement.style.background = 'var(--gradient-danger)';
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.toLowerCase();
            parseVoiceInput(transcript);
        };
        
        recognition.onend = function() {
            isListening = false;
            voiceIcon.innerHTML = '🎤';
            voiceIcon.parentElement.style.background = 'var(--gradient-success)';
        };
        
        if (!achievements.voiceUser) {
            achievements.voiceUser = true;
            unlockAchievement('voice-user');
            updateGamification();
        }
    }
}

function parseVoiceInput(transcript) {
    // Simple voice command parsing
    const heightMatch = transcript.match(/height.*?(\d+(?:\.\d+)?)/);
    const weightMatch = transcript.match(/weight.*?(\d+(?:\.\d+)?)/);
    const ageMatch = transcript.match(/age.*?(\d+)/);
    
    if (heightMatch) {
        document.getElementById('height').value = heightMatch[1];
    }
    if (weightMatch) {
        document.getElementById('weight').value = weightMatch[1];
    }
    if (ageMatch) {
        document.getElementById('age').value = ageMatch[1];
    }
    
    if (transcript.includes('calculate') || transcript.includes('compute')) {
        calculateBMI();
    }
    
    showNotification(`Voice input processed: "${transcript}"`);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--gradient);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}