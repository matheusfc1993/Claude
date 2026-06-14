@echo off
setlocal enabledelayedexpansion
chcp 65001 > nul

echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║   CFO Virtual - Criar Portável para Pen Drive     ║
echo ║                                                   ║
echo ║  Este script cria um arquivo ZIP pronto para      ║
echo ║  usar em qualquer computador com Node.js         ║
echo ╚═══════════════════════════════════════════════════╝
echo.

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Verificar Node.js
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ ERRO: Node.js não encontrado!
    echo.
    echo Instale em: https://nodejs.org
    echo.
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

REM Instalar dependências se necessário
echo.
echo [2/5] Preparando backend...
if not exist "packages\backend\node_modules" (
    echo   Instalando dependências (pode levar alguns minutos)...
    cd packages\backend
    call npm install >nul 2>&1
    cd ..\..
)
echo ✓ Backend pronto

echo.
echo [3/5] Preparando frontend...
if not exist "packages\frontend\node_modules" (
    echo   Instalando dependências (pode levar alguns minutos)...
    cd packages\frontend
    call npm install >nul 2>&1
    cd ..\..
)
echo ✓ Frontend pronto

REM Criar estrutura portável
echo.
echo [4/5] Compactando arquivos...
if exist "CFO_Virtual_Portatil" rmdir /s /q CFO_Virtual_Portatil >nul 2>&1
mkdir CFO_Virtual_Portatil\packages\backend >nul 2>&1
mkdir CFO_Virtual_Portatil\packages\frontend >nul 2>&1

REM Copiar backend
xcopy /E /I /Y packages\backend\src CFO_Virtual_Portatil\packages\backend\src >nul 2>&1
xcopy /E /I /Y packages\backend\node_modules CFO_Virtual_Portatil\packages\backend\node_modules >nul 2>&1
copy packages\backend\package.json CFO_Virtual_Portatil\packages\backend\ >nul 2>&1
copy packages\backend\.env.example CFO_Virtual_Portatil\packages\backend\.env >nul 2>&1
copy packages\backend\tsconfig.json CFO_Virtual_Portatil\packages\backend\ >nul 2>&1
copy packages\backend\tsconfig.node.json CFO_Virtual_Portatil\packages\backend\ >nul 2>&1

REM Copiar frontend
xcopy /E /I /Y packages\frontend\src CFO_Virtual_Portatil\packages\frontend\src >nul 2>&1
xcopy /E /I /Y packages\frontend\public CFO_Virtual_Portatil\packages\frontend\public >nul 2>&1
xcopy /E /I /Y packages\frontend\node_modules CFO_Virtual_Portatil\packages\frontend\node_modules >nul 2>&1
copy packages\frontend\package.json CFO_Virtual_Portatil\packages\frontend\ >nul 2>&1
copy packages\frontend\.env.example CFO_Virtual_Portatil\packages\frontend\.env >nul 2>&1
copy packages\frontend\vite.config.ts CFO_Virtual_Portatil\packages\frontend\ >nul 2>&1
copy packages\frontend\index.html CFO_Virtual_Portatil\packages\frontend\ >nul 2>&1

REM Copiar scripts
copy START_WINDOWS.bat CFO_Virtual_Portatil\INICIAR.bat >nul 2>&1
copy START_README.md CFO_Virtual_Portatil\LEIA_PRIMEIRO.txt >nul 2>&1

REM Criar README portável
(
    echo ╔═════════════════════════════════════════════════════╗
    echo ║     CFO Virtual - Portável para Pen Drive           ║
    echo ╚═════════════════════════════════════════════════════╝
    echo.
    echo 📋 COMO USAR:
    echo.
    echo 1. Duplo-clique em: INICIAR.bat
    echo 2. Aguarde 10 segundos
    echo 3. Abra navegador: http://localhost:5173
    echo 4. Crie sua conta
    echo.
    echo ⚙️  REQUISITOS:
    echo - Node.js 18+ instalado
    echo - Download: https://nodejs.org
    echo.
    echo 📁 ARQUIVO DO ZIP:
    echo - Pode ser copiado para pen drive
    echo - Pode ser enviado por email
    echo - Pode ser executado em qualquer PC
    echo.
    echo 🆘 PROBLEMAS?
    echo - Verifique LEIA_PRIMEIRO.txt
    echo - Reinicie o PC
    echo - Tente novamente
) > CFO_Virtual_Portatil\README.txt

REM Compactar
echo   Criando arquivo ZIP...
powershell -NoProfile -Command "Compress-Archive -Path 'CFO_Virtual_Portatil' -DestinationPath 'CFO_Virtual_Portatil.zip' -Force" >nul 2>&1

REM Limpeza
rmdir /s /q CFO_Virtual_Portatil >nul 2>&1

echo ✓ Portável criado

echo.
echo ╔═════════════════════════════════════════════════════╗
echo ║  ✓ SUCESSO!                                         ║
echo ╠═════════════════════════════════════════════════════╣
echo ║                                                     ║
echo ║  Arquivo criado: CFO_Virtual_Portatil.zip          ║
echo ║                                                     ║
echo ║  📌 PRÓXIMAS ETAPAS:                               ║
echo ║                                                     ║
echo ║  1. Conecte seu pen drive                          ║
echo ║  2. Copie o arquivo para o pen drive              ║
echo ║  3. Em outro PC, extraia o arquivo                ║
echo ║  4. Duplo-clique em INICIAR.bat                   ║
echo ║  5. Pronto! ✓                                       ║
echo ║                                                     ║
echo ║  O arquivo está em:                               ║
echo ║  %SCRIPT_DIR%CFO_Virtual_Portatil.zip             ║
echo ║                                                     ║
echo ╚═════════════════════════════════════════════════════╝
echo.

pause
