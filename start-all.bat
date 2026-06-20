@echo off
echo Starting SmartWay Backend...
start "SmartWay Backend" cmd /k "cd /d "%~dp0backend" && npm start"

echo Waiting for backend to start...
ping 127.0.0.1 -n 4 >nul

echo Starting SmartWay Frontend...
start "SmartWay Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Waiting for frontend to start...
ping 127.0.0.1 -n 3 >nul

echo Opening browser...
start "" "http://localhost:3001"

echo.
echo  Backend:  http://localhost:3000/api
echo  Frontend: http://localhost:3001
echo.
echo  Press any key to exit this launcher window.
pause
