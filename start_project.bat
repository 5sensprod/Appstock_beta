@echo off
echo Démarrage du backend Flask...
cd backend
call .venv\Scripts\activate
start cmd /k python app.py

echo Démarrage du frontend React...
cd ../frontend
start cmd /k npm start

echo Les serveurs Flask et React sont démarrés !
