# 🚀 QUICKSTART - CFO Virtual

## ⚡ Iniciar em 5 Minutos

### **PASSO 1: Iniciar Banco de Dados**

```bash
# Inicie PostgreSQL + Redis via Docker Compose
docker-compose up -d

# Verificar se está rodando
docker-compose ps
# Deve mostrar:
# - clinic_financial_ai_db (postgres)
# - clinic_financial_ai_cache (redis)
```

✅ **Banco de dados pronto!**

---

### **PASSO 2: Setup do Backend**

```bash
cd packages/backend

# Instalar dependências (se não fez ainda)
npm install

# Executar migrations do Prisma
npm run db:push

# Verificar se tudo passou
# Deve aparecer: "✓ Your database is now in sync with your Prisma schema"
```

✅ **Backend pronto!**

---

### **PASSO 3: Iniciar Backend**

**Terminal 1:**
```bash
cd packages/backend
npm run dev

# Deve aparecer:
# ✓ Server running on http://localhost:3000
# ✓ Environment: development
# ✓ Daily report job scheduled for 20:00 (weekdays)
# ✓ All scheduled jobs initialized
```

✅ **Backend rodando em http://localhost:3000**

---

### **PASSO 4: Iniciar Frontend**

**Terminal 2:**
```bash
cd packages/frontend

# Instalar dependências (se não fez ainda)
npm install

# Iniciar servidor
npm run dev

# Deve aparecer:
# Local:   http://localhost:5173/
```

✅ **Frontend rodando em http://localhost:5173**

---

### **PASSO 5: Testar a Aplicação**

1. **Abra no navegador:**
   ```
   http://localhost:5173
   ```

2. **Você verá a página de Login**

3. **Clique em "Register"** e crie uma nova clínica:
   ```
   Nome: Clínica Teste
   Email: teste@clinica.com
   Senha: senha123456 (mínimo 8 caracteres)
   CNPJ: 12345678901234
   ```

4. **Será redirecionado para o Dashboard** (vazio no início)

✅ **Aplicação funcionando!**

---

## 📊 Próximos Passos na App

### 1️⃣ **Adicionar Dados Financeiros**

Clique em **"Financial"** no menu lateral:

- **Despesas Fixas**: Adicione aluguel, internet, etc.
  - Nome: "Aluguel"
  - Categoria: "Rent"
  - Valor: R$ 3.000
  - Dia do vencimento: 1

- **Receitas**: Registre atendimentos
  - Data: hoje
  - Profissional: (será listado depois)
  - Valor: R$ 150

- **Profissionais**: Cadastre sua equipe
  - Nome: "João Silva"
  - Especialidade: "Fisioterapia"
  - CPF: 12345678901
  - Salário: R$ 3.000

### 2️⃣ **Ver Dashboard**

Clique em **"Dashboard"**:

- Verá KPIs calculados automaticamente
- Gráficos de receita, despesas e performance
- Relatório executivo (gerado diariamente às 20h)

### 3️⃣ **Conversar com CFO**

Clique em **"CFO Assistant"**:

```
Pergunte coisas como:
- "Qual é minha margem de lucro?"
- "Meus gastos estão altos?"
- "Recomendações para crescer?"
- "Análise de profitabilidade?"
```

O assistente responderá com base em seus dados! 🤖

### 4️⃣ **Google Sheets (Opcional)**

Se configurar Google OAuth:
- Importe despesas de uma planilha
- Exporte relatórios automaticamente
- Sincronização a cada 4 horas

---

## 🔑 Credenciais de Teste

Se quiser entrar de novo, use:
```
Email: teste@clinica.com
Senha: senha123456
```

---

## 🎯 Checklist de Início

- [ ] Docker Compose rodando (`docker-compose ps` mostra 2 serviços)
- [ ] Backend iniciado (`npm run dev` em `/packages/backend`)
- [ ] Frontend iniciado (`npm run dev` em `/packages/frontend`)
- [ ] Acessar `http://localhost:5173` no navegador
- [ ] Registrar uma clínica
- [ ] Adicionar alguns dados financeiros
- [ ] Ver Dashboard com gráficos
- [ ] Conversar com CFO Assistant

---

## ❌ Se Algo Não Funcionar

### Erro: "Connection refused" no banco

```bash
# Verificar status do Docker
docker-compose ps

# Se não estiver rodando:
docker-compose down
docker-compose up -d

# Se persistir, limpar e reconstruir:
docker-compose down -v
docker-compose up -d
```

### Erro: "Cannot find module" no backend

```bash
cd packages/backend
npm install
```

### Erro: "VITE server failed" no frontend

```bash
cd packages/frontend
npm install
# Se ainda não funcionar, limpar cache:
rm -rf node_modules .turbo
npm install
npm run dev
```

### Erro: "Database connection failed"

```bash
# Verificar variáveis .env
cat packages/backend/.env

# Deve ter:
# DATABASE_URL="postgresql://clinic_user:clinic_password_dev@localhost:5432/clinic_financial_ai"

# Se database não existe:
docker exec clinic_financial_ai_db psql -U clinic_user -c "CREATE DATABASE clinic_financial_ai;"

# Ou rodar migrations de novo:
cd packages/backend
npm run db:push
```

### Erro: "Claude API not responding"

Se não tiver ANTHROPIC_API_KEY configurada, o chat não funcionará. Configure em `packages/backend/.env`:
```
ANTHROPIC_API_KEY="sk-ant-sua-chave-real-aqui"
```

Obtenha em: https://console.anthropic.com/

---

## 📱 URLs Importantes

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Health Check | http://localhost:3000/health |
| Postgres | localhost:5432 |
| Redis | localhost:6379 |

---

## 🔧 Parar Tudo

```bash
# Parar Frontend (Ctrl+C no terminal)

# Parar Backend (Ctrl+C no terminal)

# Parar Docker
docker-compose down

# Parar tudo e limpar dados (cuidado!)
docker-compose down -v
```

---

## 📚 Arquivos Importantes

- **Backend config**: `packages/backend/.env`
- **Frontend config**: `packages/frontend/.env`
- **Database schema**: `packages/backend/src/database/schema.prisma`
- **API routes**: `packages/backend/src/routes/`
- **React components**: `packages/frontend/src/components/`

---

## 🎉 Pronto!

Agora você tem um **sistema de gestão financeira completo com IA** rodando localmente!

### Próximos passos após testar:
1. Configure ANTHROPIC_API_KEY para usar o CFO Assistant com IA
2. Configure Google Sheets para integração (opcional)
3. Convide mais usuários da sua clínica
4. Deploy em produção (veja DEPLOYMENT.md)

**Dúvidas?** Verifique os logs:
```bash
# Terminal do Backend
docker-compose logs postgres
docker-compose logs redis
npm run dev  # mostra logs
```

---

**Divirta-se com o CFO Virtual! 🚀**
