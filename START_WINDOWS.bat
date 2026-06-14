@echo off
REM CFO Virtual - Iniciar Sistema Completo
REM Este script inicia Backend + Frontend automaticamente

setlocal enabledelayedexpansion

echo.
echo =====================================
echo   CFO Virtual - Sistema de Clinicas
echo =====================================
echo.

REM Detectar diretório do script
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Instale em: https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js detectado:
node --version

REM Criar pasta de logs
if not exist "logs" mkdir logs

REM Iniciar Backend em nova janela
echo.
echo [INFO] Iniciando Backend na porta 3000...
start "CFO Virtual - Backend" cmd /k "cd packages\backend && npm install >nul 2>&1 && npm run dev"

REM Aguardar um pouco para o backend iniciar
timeout /t 3 /nobreak

REM Iniciar Frontend em nova janela
echo [INFO] Iniciando Frontend na porta 5173...
start "CFO Virtual - Frontend" cmd /k "cd packages\frontend && npm install >nul 2>&1 && npm run dev"

echo.
echo =====================================
echo [OK] Sistema iniciado com sucesso!
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:3000
echo.
echo Dois terminais foram abertos automaticamente.
echo Feche-os quando quiser parar o sistema.
echo =====================================
echo.

REM Manter janela aberta
pause
