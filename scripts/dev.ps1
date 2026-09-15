$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
if (-not (Test-Path -LiteralPath '.venv/Scripts/python.exe')) {
    throw 'Execute os passos de instalação do README antes de iniciar.'
}
$env:DEBUG = 'true'
Push-Location backend
& ../.venv/Scripts/python.exe manage.py migrate --noinput
if ($LASTEXITCODE -ne 0) { throw 'Falha nas migrations.' }
Pop-Location
$apiProcess = Start-Process -FilePath "$projectRoot/.venv/Scripts/python.exe" -ArgumentList @('manage.py', 'runserver', '127.0.0.1:8000', '--noreload') -WorkingDirectory "$projectRoot/backend" -WindowStyle Hidden -PassThru
try {
    Set-Location -LiteralPath "$projectRoot/frontend"
    npm run dev
} finally {
    Stop-Process -Id $apiProcess.Id -ErrorAction SilentlyContinue
}
