# IPL First Innings Score Predictor - Web Application

A machine learning-based web application to predict IPL cricket match first innings scores.

## Project Structure

```
├── app.py                 # Flask backend server
├── ipl.csv               # Dataset
├── requirements.txt      # Python dependencies
├── templates/
│   └── index.html        # Frontend HTML
└── static/
    ├── style.css         # Frontend styling
    └── script.js         # Frontend logic
```

## Installation & Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Application

```bash
python app.py
```

The application will start at: **http://localhost:5000**

### 3. Open in Browser

Navigate to `http://localhost:5000` in your web browser.

## How to Use

1. **Select Teams**: Choose the batting and bowling teams
2. **Enter Match Status**: Provide the current match statistics (at 5+ overs):
   - Overs completed (e.g., 9.2)
   - Total runs scored
   - Wickets lost
   - Runs in first 5 overs
   - Wickets lost in first 5 overs
3. **Click "Predict Score"**: Get the predicted final score
4. **View Results**: See the predicted score and likely range (±10 runs)

## Model Details

- **Algorithm**: Linear Regression
- **Training Data**: IPL Seasons 1-9 (2008-2016)
- **Test Data**: IPL Season 10 (2017)
- **Features**: Batting team, Bowling team, Current match statistics
- **Output**: Predicted first innings total score

## Teams Available

- Chennai Super Kings
- Delhi Daredevils
- Kings XI Punjab
- Kolkata Knight Riders
- Mumbai Indians
- Rajasthan Royals
- Royal Challengers Bangalore
- Sunrisers Hyderabad

## Features

✅ Real-time prediction
✅ User-friendly web interface
✅ Responsive design (works on mobile & desktop)
✅ Accurate predictions based on match statistics
✅ Easy to integrate with other applications

## Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Flask (Python)
- **ML Framework**: scikit-learn
- **Data Processing**: Pandas, NumPy

## Notes

- Predictions are based on historical IPL data
- The margin of error is approximately ±10 runs
- Model requires at least 5 overs of match data for prediction
- Cricket is inherently unpredictable - use this for insights, not as a guarantee!

## Troubleshooting

### Port 5000 already in use?
Change the port in `app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Change 5000 to 5001
```

### CORS errors?
The Flask-CORS extension handles this. If you still get errors, ensure `flask-cors` is installed.

### Model not training?
Make sure `ipl.csv` is in the same directory as `app.py`.

## Future Enhancements

- [ ] Add more teams (new IPL franchises)
- [ ] Include player statistics
- [ ] Support for other match formats
- [ ] Deployment to cloud (Heroku, AWS, Azure)
- [ ] Mobile app version
- [ ] Advanced analytics dashboard

---

**Created with ❤️ for cricket enthusiasts and ML learners!**
