# Script de démarrage propre pour Windows

Write-Host "--- Nettoyage et Démarrage du projet SaaS ---" -ForegroundColor Cyan

# 1. Arrêt des processus Node potentiellement bloquants
Write-Host "1. Arrêt des processus Node existants..."
Stop-Process -Name "node" -ErrorAction SilentlyContinue

# 2. Installation des dépendances manquantes
Write-Host "2. Vérification des dépendances..."
if (!(Test-Path "node_modules")) {
    Write-Host "Installation des modules (cela peut prendre un moment)..."
    npm install
}
# Installation des libs 2FA ajoutées récemment si manquantes
npm install ioredis otplib qrcode

# 3. Base de données
Write-Host "3. Mise à jour de la Base de Données..."
# S'assurer que Docker est up
docker-compose up -d
Start-Sleep -Seconds 5
# Migration
npx prisma migrate dev --name init_and_2fa
# Seed si nécessaire (ignorer erreur si déjà seedé via unique constraint)
npx prisma db seed 2>$null

# 4. Lancement
Write-Host "4. Lancement du serveur de développement..." -ForegroundColor Green
Write-Host "Accédez à http://localhost:3000"
npm run dev
