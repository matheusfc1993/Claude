#!/bin/bash

# SessionStart Hook - Executa quando a sessão do Claude Code inicia

echo "🚀 Iniciando CFO Virtual no Claude Code..."

# Verificar se Docker está rodando
if ! docker ps > /dev/null 2>&1; then
    echo "📦 Iniciando Docker Compose..."
    docker-compose up -d
    sleep 3
fi

# Verificar se backend tem dependências
if [ ! -d "packages/backend/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd packages/backend
    npm install
    npm run db:push
    cd ../..
fi

# Verificar se frontend tem dependências
if [ ! -d "packages/frontend/node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    cd packages/frontend
    npm install
    cd ../..
fi

echo "✅ Setup completo!"
echo ""
echo "📝 Próximas etapas:"
echo "1. Terminal 1: cd packages/backend && npm run dev"
echo "2. Terminal 2: cd packages/frontend && npm run dev"
echo "3. Abra: http://localhost:5173"
