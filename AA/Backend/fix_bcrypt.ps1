# Script to fix bcrypt/passlib compatibility issues
# Run this in PowerShell from the Backend directory

Write-Host "🔧 Fixing bcrypt/passlib compatibility..." -ForegroundColor Cyan

# Uninstall conflicting packages
Write-Host "📦 Uninstalling old packages..." -ForegroundColor Yellow
pip uninstall -y bcrypt passlib

# Install compatible versions
Write-Host "📦 Installing compatible versions..." -ForegroundColor Yellow
pip install bcrypt==3.2.0
pip install "passlib[bcrypt]==1.7.4"

Write-Host "✅ Done! Try running 'python run_seed.py' again." -ForegroundColor Green

