@echo off
echo Démarrage du backend Flask...

:: Naviguer dans le répertoire backend et activer l'environnement virtuel
cd backend
call .venv\Scripts\activate

:: Lancer le serveur Flask dans une nouvelle fenêtre de commande
start cmd /k "python app.py"

:: Revenir à la racine du projet pour démarrer le frontend
cd ..

echo Démarrage du frontend React...
cd frontend
start cmd /k "npm start"

echo Les serveurs Flask et React sont démarrés !
pause
