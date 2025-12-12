# Script to start the FastAPI server
# Activate virtual environment and run uvicorn

Write-Host "Activating virtual environment..." -ForegroundColor Green
& .\venv\Scripts\Activate.ps1

Write-Host "Starting FastAPI server..." -ForegroundColor Green
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

