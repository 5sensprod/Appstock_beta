@echo off
echo Arrêt du serveur Flask et du serveur React...

:: Arrêter le serveur Flask
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F

:: Arrêter le serveur React
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F

echo Les serveurs Flask et React ont été arrêtés.
