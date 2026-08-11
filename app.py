from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.linear_model import LinearRegression
from datetime import datetime

# Initialize Flask app
app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)

# Configuration
MODEL_PATH = 'ipl_model.pkl'
DATA_PATH = 'ipl.csv'

# Teams list
TEAMS = ['Chennai Super Kings', 'Delhi Daredevils', 'Kings XI Punjab', 
         'Kolkata Knight Riders', 'Mumbai Indians', 'Rajasthan Royals', 
         'Royal Challengers Bangalore', 'Sunrisers Hyderabad']

# Global model
model = None

# ========== HELPER FUNCTIONS ==========

def encode_team(team_name):
    """Encode team name to one-hot vector"""
    encoding = [0] * 8
    if team_name in TEAMS:
        encoding[TEAMS.index(team_name)] = 1
    return encoding

def prepare_features(batting_team, bowling_team, overs, runs, wickets, runs_in_prev_5, wickets_in_prev_5):
    """Prepare feature array for prediction"""
    features = []
    features.extend(encode_team(batting_team))
    features.extend(encode_team(bowling_team))
    features.extend([overs, runs, wickets, runs_in_prev_5, wickets_in_prev_5])
    return np.array([features])

def train_model():
    """Train the model from ipl.csv data"""
    global model
    
    print("Loading data from ipl.csv...")
    df = pd.read_csv(DATA_PATH)
    
    print("Cleaning data...")
    # Remove unwanted columns
    columns_to_remove = ['mid', 'venue', 'batsman', 'bowler', 'striker', 'non-striker']
    df.drop(labels=columns_to_remove, axis=1, inplace=True)
    
    # Keep only consistent teams
    consistent_teams = ['Kolkata Knight Riders', 'Chennai Super Kings', 'Rajasthan Royals',
                        'Mumbai Indians', 'Kings XI Punjab', 'Royal Challengers Bangalore',
                        'Delhi Daredevils', 'Sunrisers Hyderabad']
    
    df = df[(df['bat_team'].isin(consistent_teams)) & (df['bowl_team'].isin(consistent_teams))]
    df = df[df['overs'] >= 5.0]
    
    # Convert date column
    df['date'] = df['date'].apply(lambda x: datetime.strptime(x, '%Y-%m-%d'))
    
    print("Preparing features...")
    # Feature engineering
    X = []
    y = []
    
    for idx, row in df.iterrows():
        features = []
        features.extend(encode_team(row['bat_team']))
        features.extend(encode_team(row['bowl_team']))
        features.extend([row['overs'], row['runs'], row['wickets'], 
                        row['runs_last_5'], row['wickets_last_5']])
        X.append(features)
        y.append(row['total'])
    
    X = np.array(X)
    y = np.array(y)
    
    # Train-test split based on date
    split_idx = int(0.8 * len(df))
    X_train = X[:split_idx]
    y_train = y[:split_idx]
    
    print("Training Linear Regression model...")
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    # Save model
    joblib.dump(model, MODEL_PATH)
    print(f"Model trained and saved to {MODEL_PATH}")

# ========== FLASK ROUTES ==========

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/teams', methods=['GET'])
def get_teams():
    """Get list of teams"""
    return jsonify({'teams': TEAMS})

@app.route('/api/predict', methods=['POST'])
def predict():
    """Make a prediction based on match data"""
    try:
        if model is None:
            return jsonify({'success': False, 'error': 'Model not loaded'}), 500
        
        data = request.json
        
        # Validate input
        batting_team = data.get('batting_team')
        bowling_team = data.get('bowling_team')
        
        if not batting_team or not bowling_team:
            return jsonify({'success': False, 'error': 'Teams are required'}), 400
        
        overs = float(data.get('overs', 0))
        runs = float(data.get('runs', 0))
        wickets = float(data.get('wickets', 0))
        runs_in_prev_5 = float(data.get('runs_in_prev_5', 0))
        wickets_in_prev_5 = float(data.get('wickets_in_prev_5', 0))
        
        # Prepare features and make prediction
        features = prepare_features(batting_team, bowling_team, overs, runs, 
                                   wickets, runs_in_prev_5, wickets_in_prev_5)
        
        predicted_score = int(model.predict(features)[0])
        
        return jsonify({
            'success': True,
            'predicted_score': predicted_score,
            'range_low': predicted_score - 10,
            'range_high': predicted_score + 5
        })
    
    except ValueError as ve:
        return jsonify({'success': False, 'error': f'Invalid input: {str(ve)}'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': f'Error: {str(e)}'}), 500

# ========== MAIN ==========

if __name__ == '__main__':
    # Load or train model
    if os.path.exists(MODEL_PATH):
        print(f"Loading pre-trained model from {MODEL_PATH}...")
        model = joblib.load(MODEL_PATH)
    else:
        if os.path.exists(DATA_PATH):
            train_model()
        else:
            print(f"Error: {DATA_PATH} not found. Cannot train model.")
            print("Please ensure ipl.csv is in the same directory as this script.")
    
    print("\n🏏 IPL Score Predictor - Flask Server")
    print("=" * 50)
    print("Server running at: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    print("=" * 50 + "\n")
    
    app.run(debug=True, port=5000)
