@echo off
echo Starting Smart House Price Prediction System...

:: Starting Machine Learning API
echo Starting ML Service (Flask)...
start cmd /k "cd ml-model && python app.py"

:: Starting Node.js Backend
echo Starting Backend Server (Express)...
start cmd /k "cd server && npm run dev"

:: Starting React Frontend
echo Starting Frontend Client (Vite)...
start cmd /k "cd client && npm run dev"

echo.
echo All services are starting up. 
echo - ML API: http://localhost:5001
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:5173
echo.
pause
