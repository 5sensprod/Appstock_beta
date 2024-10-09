@echo off

echo Arrêt du serveur Flask...

:: Terminer le processus Flask (changer "python.exe" en "app.exe" si nécessaire)
taskkill /F /IM app.exe 2>nul
taskkill /F /IM python.exe 2>nul

echo Arrêt du serveur React...

:: Terminer le processus React
taskkill /F /IM node.exe 2>nul

echo Arrêt de l'application Electron...

:: Terminer le processus Electron (vérifie le nom exact si ton application est packagée)
taskkill /F /IM electron.exe 2>nul
taskkill /F /IM MonApp.exe 2>nul

echo Les serveurs Flask, React et l'application Electron ont été arrêtés.

pause