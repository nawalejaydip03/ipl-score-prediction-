@echo off
REM Quick Start Script for IPL Predictor Web App

echo ========================================
echo IPL First Innings Score Predictor
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo [1/3] Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Starting the Flask server...
echo.
echo The application will open at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

python app.py
