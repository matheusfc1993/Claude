@echo off
REM Criar versão portável para pen drive
REM Este script prepara a aplicação para rodar em qualquer lugar

setlocal enabledelayedexpansion

echo.
echo =====================================
echo  CFO Virtual - Criar Portável
echo =====================================
echo.

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Criar pasta portável
echo [INFO] Criando pasta portável...
if exist "CFO_Virtual_Portable" rmdir /s /q CFO_Virtual_Portable
mkdir CFO_Virtual_Portable
mkdir CFO_Virtual_Portable\packages
mkdir CFO_Virtual_Portable\packages\backend
mkdir CFO_Virtual_Portable\packages\frontend

echo [OK] Pasta criada

REM Copiar estrutura
echo [INFO] Copiando arquivos do backend...
xcopy /E /I /Y packages\backend\src CFO_Virtual_Portable\packages\backend\src
xcopy /E /I /Y packages\backend\node_modules CFO_Virtual_Portable\packages\backend\node_modules 2>nul || echo [AVISO] node_modules não encontrado - será instalado na primeira execução
copy packages\backend\package.json CFO_Virtual_Portable\packages\backend\
copy packages\backend\package-lock.json CFO_Virtual_Portable\packages\backend\ 2>nul
copy packages\backend\tsconfig.json CFO_Virtual_Portable\packages\backend\ 2>nul
copy packages\backend\.env.example CFO_Virtual_Portable\packages\backend\.env

echo [INFO] Copiando arquivos do frontend...
xcopy /E /I /Y packages\frontend\src CFO_Virtual_Portable\packages\frontend\src
xcopy /E /I /Y packages\frontend\public CFO_Virtual_Portable\packages\frontend\public
xcopy /E /I /Y packages\frontend\node_modules CFO_Virtual_Portable\packages\frontend\node_modules 2>nul || echo [AVISO] node_modules não encontrado
copy packages\frontend\package.json CFO_Virtual_Portable\packages\frontend\
copy packages\frontend\package-lock.json CFO_Virtual_Portable\packages\frontend\ 2>nul
copy packages\frontend\vite.config.ts CFO_Virtual_Portable\packages\frontend\
copy packages\frontend\tsconfig.json CFO_Virtual_Portable\packages\frontend\ 2>nul
copy packages\frontend\index.html CFO_Virtual_Portable\packages\frontend\
copy packages\frontend\.env.example CFO_Virtual_Portable\packages\frontend\.env

REM Copiar scripts de inicialização
echo [INFO] Copiando scripts...
copy START_WINDOWS.bat CFO_Virtual_Portable\INICIAR.bat
copy START_README.md CFO_Virtual_Portable\LEIA_PRIMEIRO.txt
copy SETUP.md CFO_Virtual_Portable\

REM Criar arquivo README portável
echo [INFO] Criando instruções...
(
echo CFO Virtual - Versao Portatil
echo.
echo Como usar em pen drive ou qualquer lugar:
echo.
echo 1. Extraia este arquivo em qualquer pasta
echo 2. Duplo-clique em: INICIAR.bat
echo 3. Aguarde 10 segundos
echo 4. Abra navegador em: http://localhost:5173
echo.
echo Requisitos: Node.js 18+ instalado no PC
echo Download: https://nodejs.org
echo.
echo Leia LEIA_PRIMEIRO.txt para mais detalhes
) > CFO_Virtual_Portable\README.txt

REM Criar ZIP
echo [INFO] Compactando para ZIP...
powershell -NoProfile -Command "Compress-Archive -Path 'CFO_Virtual_Portable' -DestinationPath 'CFO_Virtual_Portable.zip' -Force"

echo.
echo =====================================
echo [OK] Portável criado com sucesso!
echo.
echo Arquivo: CFO_Virtual_Portable.zip
echo Tamanho: (verificar na pasta)
echo.
echo Próximas etapas:
echo 1. Copie CFO_Virtual_Portable.zip para seu pen drive
echo 2. Em outro PC, extraia o arquivo
echo 3. Duplo-clique em INICIAR.bat
echo.
echo =====================================
echo.

pause
