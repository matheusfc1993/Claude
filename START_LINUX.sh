#!/bin/bash

# CFO Virtual - Iniciar Sistema Completo
# Este script inicia Backend + Frontend automaticamente

echo ""
echo "====================================="
echo "  CFO Virtual - Sistema de Clínicas"
echo "====================================="
echo ""

# Detectar diretório do script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "[ERRO] Node.js não encontrado!"
    echo "Instale em: https://nodejs.org"
    exit 1
fi

echo "[OK] Node.js detectado:"
node --version

# Criar pasta de logs
mkdir -p logs

# Iniciar Backend
echo ""
echo "[INFO] Iniciando Backend na porta 3000..."
cd "$SCRIPT_DIR/packages/backend"
npm install > /dev/null 2>&1
npm run dev > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "[OK] Backend iniciado (PID: $BACKEND_PID)"

# Aguardar um pouco
sleep 3

# Iniciar Frontend
echo "[INFO] Iniciando Frontend na porta 5173..."
cd "$SCRIPT_DIR/packages/frontend"
npm install > /dev/null 2>&1
npm run dev > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "[OK] Frontend iniciado (PID: $FRONTEND_PID)"

echo ""
echo "====================================="
echo "[OK] Sistema iniciado com sucesso!"
echo ""
echo "Frontend:  http://localhost:5173"
echo "Backend:   http://localhost:3000"
echo ""
echo "Logs:"
echo "  Backend:  ./logs/backend.log"
echo "  Frontend: ./logs/frontend.log"
echo ""
echo "Para parar o sistema, execute:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Ou feche este terminal (Ctrl+C)"
echo "====================================="
echo ""

# Manter aberto
wait
