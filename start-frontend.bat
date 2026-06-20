@echo off
title SmartWay Frontend (port 3001)
cd /d "%~dp0frontend"
echo.
echo  SmartWay Frontend - http://localhost:3001
echo  Make sure backend is running first!
echo  Press Ctrl+C to stop
echo.
npm run dev
