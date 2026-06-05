@echo off
echo =======================================================
echo     TMDT - Clean, Build and Run Backend, Frontend + Mobile
echo =======================================================

echo.
echo [1/4] Killing existing processes on Port 8080, 3000 and 8081...
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :8080 ^| find "LISTENING"') DO taskkill /F /PID %%a 2>nul
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :3000 ^| find "LISTENING"') DO taskkill /F /PID %%a 2>nul
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :8081 ^| find "LISTENING"') DO taskkill /F /PID %%a 2>nul
echo Done clearing ports.

echo.
echo [2/4] Cleaning and starting Backend...
start "TMDT-Backend" cmd /c "cd backend && mvnw clean spring-boot:run"

echo.
echo Waiting for Backend to start on port 8080...
:wait_loop
timeout /t 2 /nobreak >nul
netstat -ano | findstr :8080 | findstr LISTENING >nul
if errorlevel 1 (
    echo ...still waiting...
    goto wait_loop
)
echo Backend is UP!

echo.
echo [3/4] Starting Frontend...
start "TMDT-Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo [4/4] Starting Mobile App...
start "TMDT-Mobile" cmd /c "cd mobile && npm start"

echo.
echo =======================================================
echo FINISHED!
echo.
echo - Backend is running (Port 8080)
echo - Frontend is starting (Port 3000)
echo - Mobile App is starting (Port 8081)
echo =======================================================
pause
