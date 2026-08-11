const API_BASE_URL = `${window.location.origin}/api`;
const DEFAULT_TEAMS = [
    'Chennai Super Kings',
    'Delhi Daredevils',
    'Kings XI Punjab',
    'Kolkata Knight Riders',
    'Mumbai Indians',
    'Rajasthan Royals',
    'Royal Challengers Bangalore',
    'Sunrisers Hyderabad'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadTeams();
    setupFormHandler();
    setupShareButton();
    setupTeamSelectionVisuals();
});

// Setup visual feedback for team selection
function setupTeamSelectionVisuals() {
    const battingTeam = document.getElementById('battingTeam');
    const bowlingTeam = document.getElementById('bowlingTeam');
    
    [battingTeam, bowlingTeam].forEach(select => {
        select.addEventListener('change', function() {
            if (this.value) {
                this.style.borderColor = 'rgba(81, 207, 102, 0.8)';
                this.style.boxShadow = '0 0 20px rgba(81, 207, 102, 0.3), inset 0 0 10px rgba(81, 207, 102, 0.1)';
                this.style.background = 'rgba(81, 207, 102, 0.08)';
            } else {
                this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                this.style.boxShadow = 'none';
                this.style.background = 'rgba(255, 255, 255, 0.05)';
            }
        });
    });
}

// Load teams from backend
async function loadTeams() {
    try {
        const response = await fetch(`${API_BASE_URL}/teams`);
        const data = await response.json();
        
        const battingTeamSelect = document.getElementById('battingTeam');
        const bowlingTeamSelect = document.getElementById('bowlingTeam');
        
        data.teams.forEach(team => {
            const option1 = document.createElement('option');
            option1.value = team;
            option1.textContent = team;
            battingTeamSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = team;
            option2.textContent = team;
            bowlingTeamSelect.appendChild(option2);
        });
    } catch (error) {
        console.error('Error loading teams:', error);
        populateDefaultTeams();
        showError('Running without the API. Team lists were loaded locally, but predictions still require the Flask backend.');
    }
}

function populateDefaultTeams() {
    const battingTeamSelect = document.getElementById('battingTeam');
    const bowlingTeamSelect = document.getElementById('bowlingTeam');

    DEFAULT_TEAMS.forEach(team => {
        const option1 = document.createElement('option');
        option1.value = team;
        option1.textContent = team;
        battingTeamSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = team;
        option2.textContent = team;
        bowlingTeamSelect.appendChild(option2);
    });
}

// Setup form submission
function setupFormHandler() {
    const form = document.getElementById('predictionForm');
    form.addEventListener('submit', handleFormSubmit);
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Show loading spinner with animation
    showLoading(true);
    hideResults();
    hideError();
    
    // Disable submit button
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    
    try {
        // Collect form data
        const formData = new FormData(document.getElementById('predictionForm'));
        const data = {
            batting_team: formData.get('batting_team'),
            bowling_team: formData.get('bowling_team'),
            overs: formData.get('overs'),
            runs: formData.get('runs'),
            wickets: formData.get('wickets'),
            runs_in_prev_5: formData.get('runs_in_prev_5'),
            wickets_in_prev_5: formData.get('wickets_in_prev_5')
        };
        
        // Validate data
        if (!validateInputs(data)) {
            showError('❌ Please fill in all fields correctly. Overs must be ≥ 5.0');
            showLoading(false);
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            return;
        }
        
        // Add delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Make API call
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        showLoading(false);
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        
        if (result.success) {
            displayResult(result);
        } else {
            showError('❌ ' + (result.error || 'Error making prediction. Please try again.'));
        }
    } catch (error) {
        console.error('Error:', error);
        showLoading(false);
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        showError('⚠️ Error: ' + error.message + '. Make sure the API is deployed and reachable from this site.');
    }
}

// Validate form inputs
function validateInputs(data) {
    if (!data.batting_team || !data.bowling_team) {
        return false;
    }
    
    const overs = parseFloat(data.overs);
    const runs = parseFloat(data.runs);
    const wickets = parseFloat(data.wickets);
    const runs_in_prev_5 = parseFloat(data.runs_in_prev_5);
    const wickets_in_prev_5 = parseFloat(data.wickets_in_prev_5);
    
    if (isNaN(overs) || overs < 5 || overs > 20) return false;
    if (isNaN(runs) || runs < 0 || runs > 300) return false;
    if (isNaN(wickets) || wickets < 0 || wickets > 10) return false;
    if (isNaN(runs_in_prev_5) || runs_in_prev_5 < 0) return false;
    if (isNaN(wickets_in_prev_5) || wickets_in_prev_5 < 0) return false;
    
    return true;
}

// Display prediction results with animation
function displayResult(result) {
    const scoreElement = document.getElementById('predictedScore');
    const rangeElement = document.getElementById('scoreRange');
    
    // Animate score counter
    const startScore = 0;
    const endScore = result.predicted_score;
    const duration = 1000;
    const startTime = performance.now();
    
    function animateScore(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentScore = Math.floor(startScore + (endScore - startScore) * progress);
        scoreElement.textContent = currentScore;
        
        if (progress < 1) {
            requestAnimationFrame(animateScore);
        } else {
            scoreElement.textContent = endScore;
            // Add a glow effect
            scoreElement.style.animation = 'none';
            setTimeout(() => {
                scoreElement.style.animation = 'glow 2s ease-out';
            }, 0);
        }
    }
    
    requestAnimationFrame(animateScore);
    
    rangeElement.textContent = `${result.range_low} to ${result.range_high}`;
    
    document.getElementById('resultSection').classList.remove('hidden');
    
    // Scroll to result
    setTimeout(() => {
        document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
}

// Reset form and results
function resetForm() {
    document.getElementById('predictionForm').reset();
    hideResults();
    hideError();
    showLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// UI Helper Functions
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

function hideResults() {
    document.getElementById('resultSection').classList.add('hidden');
}

function hideError() {
    document.getElementById('errorSection').classList.add('hidden');
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorSection').classList.remove('hidden');
}

// Setup share button
function setupShareButton() {
    const shareBtn = document.querySelector('.btn-share');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const score = document.getElementById('predictedScore').textContent;
            const range = document.getElementById('scoreRange').textContent;
            
            const text = `🏏 IPL Score Prediction: ${score} runs (${range})
            
Predicted using AI-powered machine learning model!
Check out the IPL Score Predictor: ${window.location.origin}`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'IPL Score Prediction',
                    text: text
                });
            } else {
                // Fallback: Copy to clipboard
                navigator.clipboard.writeText(text).then(() => {
                    alert('📋 Prediction copied to clipboard!');
                }).catch(() => {
                    alert(text);
                });
            }
        });
    }
}

// Add glow animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes glow {
        0% {
            text-shadow: 0 0 20px rgba(0, 212, 255, 0.8);
            filter: brightness(1.2);
        }
        100% {
            text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
            filter: brightness(1);
        }
    }
`;
document.head.appendChild(style);
