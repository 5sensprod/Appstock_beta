@echo off
echo Arrêt du serveur Flask...
:: Terminer le processus Flask
taskkill /F /IM python.exe

echo Arrêt du serveur React...
:: Terminer le processus React
taskkill /F /IM node.exe

echo Les serveurs Flask et React ont été arrêtés.
pause
