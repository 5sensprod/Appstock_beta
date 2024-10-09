import os
import shutil
import subprocess
import sys

def run_command(command, cwd=None):
    """Exécute une commande et affiche les messages d'erreur si elle échoue."""
    result = subprocess.run(command, shell=True, cwd=cwd)
    if result.returncode != 0:
        print(f"❌ Erreur lors de l'exécution de la commande : {command}")
        sys.exit(1)

# 1. Construire l'application React
print("🛠️  Construction de l'application React...")
run_command("npm run build", cwd="frontend")

# 2. Copier le build de React vers le backend
source_dir = "frontend/build"
dest_dir = "backend/react_build"

if not os.path.exists(source_dir):
    print("❌ Erreur : Le dossier de build React n'a pas été trouvé.")
    sys.exit(1)

# Supprimer l'ancien dossier react_build s'il existe
if os.path.exists(dest_dir):
    print("📁 Suppression de l'ancien dossier react_build...")
    shutil.rmtree(dest_dir)

# Copier le dossier build vers le backend et le renommer en react_build
print("📦 Copie du dossier build de React vers backend/react_build...")
shutil.copytree(source_dir, dest_dir)
print("✅ Dossier de build copié avec succès.")

# 3. Créer l'exécutable avec PyInstaller
print("🚀 Création de l'exécutable avec PyInstaller...")
run_command('pyinstaller --onefile --noconsole --add-data "react_build;react_build" app.py', cwd="backend")

# 4. Nettoyage des fichiers temporaires générés par PyInstaller
build_dir = "backend/build"
pycache_dir = "backend/__pycache__"
spec_file = "backend/app.spec"

print("🧹 Nettoyage des fichiers temporaires...")
if os.path.exists(build_dir):
    shutil.rmtree(build_dir)
if os.path.exists(pycache_dir):
    shutil.rmtree(pycache_dir)
if os.path.exists(spec_file):
    os.remove(spec_file)

print("✅ Création de l'exécutable terminée avec succès ! Vous pouvez trouver l'exécutable dans le dossier 'backend/dist'.")

# 5. Construction de l'application Electron avec Electron-Builder
print("⚡ Construction de l'application Electron avec Electron-Builder...")
run_command('npx electron-builder', cwd="frontend")

print("✅ Construction de l'application Electron terminée avec succès ! Vous pouvez trouver l'installateur dans le dossier 'frontend/dist'.")
