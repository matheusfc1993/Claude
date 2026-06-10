#!/bin/bash

# Verificação de status do CFO Virtual

echo "🔍 Verificando status do CFO Virtual...\n"

echo "1. Docker Services:"
docker-compose ps 2>/dev/null || echo "   ❌ Docker não está rodando"

echo -e "\n2. Backend Health:"
curl -s http://localhost:3000/health > /dev/null 2>&1 && echo "   ✅ Backend online" || echo "   ❌ Backend offline"

echo -e "\n3. Frontend Health:"
curl -s http://localhost:5173 > /dev/null 2>&1 && echo "   ✅ Frontend online" || echo "   ❌ Frontend offline"

echo -e "\n4. Database Connection:"
psql -h localhost -U clinic_user -d clinic_financial_ai -c "SELECT 1" 2>/dev/null && echo "   ✅ PostgreSQL online" || echo "   ❌ PostgreSQL offline"

echo -e "\n5. Redis Connection:"
redis-cli -h localhost ping > /dev/null 2>&1 && echo "   ✅ Redis online" || echo "   ❌ Redis offline"

echo -e "\n✅ Verificação completa!"
