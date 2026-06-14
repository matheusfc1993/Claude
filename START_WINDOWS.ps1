# CFO Virtual - Iniciar Sistema Completo
# PowerShell - Windows moderno
# Executar: powershell -ExecutionPolicy Bypass -File START_WINDOWS.ps1

Clear-Host

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  CFO Virtual - Sistema de Clínicas" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

# Verificar Node.js
$NodeCheck = $null
try {
    $NodeCheck = node --version 2>$null
    Write-Host "[OK] Node.js detectado: $NodeCheck" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Node.js não encontrado!" -ForegroundColor Red
    Write-Host "Instale em: https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Criar pasta de logs
if (-Not (Test-Path "logs")) {
    New-Item -ItemType Directory -Name "logs" | Out-Null
}

# Iniciar Backend
Write-Host ""
Write-Host "[INFO] Iniciando Backend na porta 3000..." -ForegroundColor Yellow

$BackendPath = Join-Path $ScriptDir "packages\backend"
$BackendProcess = Start-Process -NoNewWindow -WorkingDirectory $BackendPath `
    -FileName "cmd" -ArgumentList "/c npm install > nul 2>&1 && npm run dev" `
    -PassThru

Write-Host "[OK] Backend iniciado (PID: $($BackendProcess.Id))" -ForegroundColor Green

# Aguardar
Start-Sleep -Seconds 3

# Iniciar Frontend
Write-Host "[INFO] Iniciando Frontend na porta 5173..." -ForegroundColor Yellow

$FrontendPath = Join-Path $ScriptDir "packages\frontend"
$FrontendProcess = Start-Process -NoNewWindow -WorkingDirectory $FrontendPath `
    -FileName "cmd" -ArgumentList "/c npm install > nul 2>&1 && npm run dev" `
    -PassThru

Write-Host "[OK] Frontend iniciado (PID: $($FrontendProcess.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "[OK] Sistema iniciado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "IDs dos processos:" -ForegroundColor Yellow
Write-Host "  Backend:  $($BackendProcess.Id)" -ForegroundColor Gray
Write-Host "  Frontend: $($FrontendProcess.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "Para parar o sistema, feche as janelas dos terminais" -ForegroundColor Yellow
Write-Host "ou execute no PowerShell:" -ForegroundColor Yellow
Write-Host "  Stop-Process -Id $($BackendProcess.Id),$($FrontendProcess.Id)" -ForegroundColor Gray
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Aguardar qualquer tecla
Read-Host "Pressione Enter para sair (isso encerrará o sistema)"

# Parar processos
Stop-Process -Id $BackendProcess.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $FrontendProcess.Id -Force -ErrorAction SilentlyContinue

Write-Host "Sistema encerrado." -ForegroundColor Yellow
