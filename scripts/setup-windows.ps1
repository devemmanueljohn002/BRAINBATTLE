$ErrorActionPreference = 'Stop'

Write-Host 'Setting up School Quiz Championship...' -ForegroundColor Cyan
if (!(Test-Path 'backend/.venv')) { python -m venv backend/.venv }
& 'backend/.venv/Scripts/python.exe' -m pip install --upgrade pip
& 'backend/.venv/Scripts/python.exe' -m pip install -r backend/requirements.txt
if (!(Test-Path 'backend/.env')) { Copy-Item 'backend/.env.example' 'backend/.env' }
if (!(Test-Path '.env')) { Copy-Item '.env.example' '.env' }
npm install
Write-Host 'Setup complete. Edit backend/.env and set a strong ADMIN_PASSWORD before starting the application.' -ForegroundColor Green
