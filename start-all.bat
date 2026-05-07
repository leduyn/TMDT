@echo off
echo =======================================================
echo     TMDT - Clean, Build and Run Backend + Frontend
echo =======================================================

echo.
echo [1/3] Killing existing processes on Port 8080 and 3000...
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :8080 ^| find "LISTENING"') DO taskkill /F /PID %%a 2>nul
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :3000 ^| find "LISTENING"') DO taskkill /F /PID %%a 2>nul
echo Done clearing ports.

echo.
echo [2/3] Cleaning and starting Backend...
start "TMDT-Backend" cmd /c "cd backend && mvnw clean spring-boot:run"

echo.
echo [3/3] Starting Frontend...
start "TMDT-Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo =======================================================
echo FINISHED!
echo.
echo - Backend is starting in a new window (Port 8080)
echo - Frontend is starting in a new window (Port 3000)
echo =======================================================
pause
