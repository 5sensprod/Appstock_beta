@echo off
echo Arrêt du serveur Flask...
:: Terminer le processus Flask
taskkill /F /IM python.exe

echo Arrêt du serveur React...
:: Terminer le processus React
taskkill /F /IM node.exe

echo Arrêt de l'application Electron...
:: Terminer le processus Electron
taskkill /F /IM electron.exe

echo Les serveurs Flask, React et l'application Electron ont été arrêtés.
pause
