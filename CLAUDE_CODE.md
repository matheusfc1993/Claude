# 🎯 Como Usar no Claude Code

O **Claude Code** é o ambiente integrado de desenvolvimento da Anthropic. Aqui está como usar o CFO Virtual nele.

## 📋 Pré-requisitos

- Claude Code CLI instalado: `npm install -g @anthropic-ai/claude-code`
- Acesso ao repositório
- Docker disponível no ambiente

## 🚀 Iniciando no Claude Code

### **Método 1: Via Claude Code CLI (Mais Rápido)**

```bash
# Dentro do diretório do projeto
cd /home/user/Claude

# Abra com Claude Code
claude code .
```

Automaticamente:
- ✅ Carrega o workspace
- ✅ Aplica configurações de `.claude/`
- ✅ Executa hooks de inicialização
- ✅ Prepara ambiente para desenvolvimento

### **Método 2: Via Web Interface**

1. Acesse: **https://claude.ai/code**
2. Clique em **"New Session"**
3. Selecione **"Open Repository"**
4. Cole a URL:
```
http://local_proxy@127.0.0.1:42505/git/matheusfc1993/Claude
```
5. Selecione branch: `claude/clinic-financial-ai-cfo-7p4jgq`
6. ✅ Sessão inicia automaticamente

### **Método 3: Abrir a Pasta Existente**

Se já tem a pasta no seu sistema:

```bash
# Navegar até o projeto
cd /home/user/Claude

# Abrir com Claude Code
code .  # Se tiver VS Code CLI
# ou
claude code .
```

---

## 🎮 Usando o Claude Code

### **1. Explorer (Explorador de Arquivos)**

```
├── packages/
│   ├── backend/          ← APIs (Express + TypeScript)
│   └── frontend/         ← UI (React + Vite)
├── docker-compose.yml    ← Infraestrutura
├── QUICKSTART.md         ← Guia rápido
└── DEPLOYMENT.md         ← Deploy em produção
```

Clique em qualquer arquivo para editar no editor integrado.

### **2. Terminal Integrado**

Abre novo terminal com:
```
Ctrl + ` (backtick)
```

**Terminal 1 - Backend:**
```bash
cd packages/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd packages/frontend
npm run dev
```

### **3. Git Integration**

Claude Code mostra:
- 📝 Mudanças não commitadas
- 🔄 Diferenças (diff)
- 📌 Branches disponíveis

Fazer commit:
```bash
git add -A
git commit -m "mensagem"
git push origin claude/clinic-financial-ai-cfo-7p4jgq
```

### **4. Run/Debug**

Criar configuração de debug em `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Backend Debug",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/packages/backend/dist/main.js",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/packages/backend/dist/**/*.js"]
    }
  ]
}
```

---

## ⚡ Workflow Recomendado no Claude Code

### **Passo 1: Setup Inicial**
```bash
# Terminal 1
bash start.sh
```

Espera completar (~2-3 min)

### **Passo 2: Iniciar Serviços**

**Terminal 2:**
```bash
cd packages/backend
npm run dev
```

**Terminal 3:**
```bash
cd packages/frontend
npm run dev
```

### **Passo 3: Editar Código**

Abra arquivos no editor:
- Modifique código
- Hot reload funciona automaticamente
- Veja mudanças em tempo real

### **Passo 4: Commit & Push**

No terminal integrado:
```bash
git add <arquivo>
git commit -m "descrição"
git push origin claude/clinic-financial-ai-cfo-7p4jgq
```

---

## 🔌 Extensões Úteis para Claude Code

Instale no seu VS Code (integrado):

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension prisma.prisma
code --install-extension bradlc.vscode-tailwindcss
```

---

## 📊 Estrutura do Projeto Visível

```
CFO Virtual/
├── 📁 packages/
│   ├── 📁 backend/
│   │   ├── 📁 src/
│   │   │   ├── 📁 controllers/     ← Lógica das rotas
│   │   │   ├── 📁 services/        ← Lógica de negócio
│   │   │   ├── 📁 routes/          ← Definição de rotas
│   │   │   ├── 📁 middlewares/     ← Auth, validação
│   │   │   ├── 📁 database/        ← Prisma schema
│   │   │   └── 📁 jobs/            ← Tarefas agendadas
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── 📁 frontend/
│       ├── 📁 src/
│       │   ├── 📁 components/      ← UI components
│       │   ├── 📁 pages/           ← Páginas
│       │   ├── 📁 hooks/           ← React hooks
│       │   ├── 📁 stores/          ← Zustand stores
│       │   └── 📁 services/        ← API calls
│       ├── package.json
│       └── vite.config.ts
│
├── 📄 docker-compose.yml    ← PostgreSQL + Redis
├── 📄 QUICKSTART.md         ← Guia rápido
├── 📄 DEPLOYMENT.md         ← Deploy
└── 📄 CLAUDE_CODE.md        ← Este arquivo
```

---

## 🐛 Debugging no Claude Code

### **Backend Debug (Node.js)**

```bash
# Terminal com debug
cd packages/backend
node --inspect-brk=9229 node_modules/.bin/tsx src/main.ts
```

Acessa debugger em: `chrome://inspect`

### **Frontend Debug (Chrome DevTools)**

Já funciona automaticamente com Vite:
1. Abre http://localhost:5173
2. F12 ou DevTools
3. Vê console, network, sources

### **Ver Logs em Tempo Real**

```bash
# Backend logs
docker-compose logs -f backend

# Frontend build logs
tail -f packages/frontend/npm-debug.log

# Database logs
docker-compose logs -f postgres
```

---

## 📱 Acessar a Aplicação

Enquanto roda no Claude Code:

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Health Check | http://localhost:3000/health |

---

## 🔄 Workflow de Desenvolvimento

### **1. Fazer Mudança no Código**
Edita arquivo → salva (Ctrl+S)

### **2. Ver Resultado**
- Backend: Reinicia automaticamente (tsx watch)
- Frontend: Hot reload instantâneo (Vite)

### **3. Testar Manualmente**
- Abra http://localhost:5173
- Teste a mudança

### **4. Fazer Commit**
```bash
git add .
git commit -m "descrição clara"
git push origin claude/clinic-financial-ai-cfo-7p4jgq
```

---

## 💡 Dicas Úteis

### **Atalhos Claude Code**

| Comando | Atalho |
|---------|--------|
| Abrir Terminal | Ctrl + ` |
| Buscar Arquivo | Ctrl + P |
| Buscar Texto | Ctrl + F |
| Replace | Ctrl + H |
| Git Commit | Ctrl + Shift + G |
| Format Code | Shift + Alt + F |

### **Comandos Úteis**

```bash
# Limpar cache de build
rm -rf packages/backend/dist packages/frontend/dist

# Resetar banco de dados
docker-compose down -v
docker-compose up -d
cd packages/backend && npm run db:push

# Ver logs em tempo real
docker-compose logs -f

# Parar tudo
docker-compose down
```

---

## ⚠️ Erros Comuns no Claude Code

### **Erro: "Cannot find module"**
```bash
# Solução
cd packages/<backend|frontend>
npm install
```

### **Erro: "Port 3000 already in use"**
```bash
# Ver o que está usando a porta
lsof -i :3000

# Matar o processo
kill -9 <PID>
```

### **Erro: "Database connection refused"**
```bash
# Verificar Docker
docker-compose ps

# Reiniciar
docker-compose restart postgres
```

---

## 📚 Documentação no Claude Code

Documentos disponíveis:
- `QUICKSTART.md` - Setup rápido
- `DEPLOYMENT.md` - Deploy em produção
- `CLAUDE_CODE.md` - Este documento
- `README.md` - Overview geral

Abra qualquer um para ler:
```bash
# No terminal
cat QUICKSTART.md
```

---

## 🎯 Próximos Passos

Agora que está tudo configurado:

1. ✅ Abra no Claude Code
2. ✅ Execute `bash start.sh`
3. ✅ Inicie os servidores
4. ✅ Acesse http://localhost:5173
5. ✅ Registre uma clínica
6. ✅ Teste as funcionalidades

---

## 🤝 Colaboração

Se trabalhando em equipe no Claude Code:

```bash
# Puxar últimas mudanças
git pull origin claude/clinic-financial-ai-cfo-7p4jgq

# Criar branch para sua feature
git checkout -b feature/minha-feature

# Após terminar
git push origin feature/minha-feature
# Abrir Pull Request no GitHub
```

---

## 📞 Suporte

Se tiver problemas no Claude Code:

1. Verifique `QUICKSTART.md` → Troubleshooting
2. Execute `bash verify.sh` para diagnosticar
3. Veja os logs: `docker-compose logs`
4. Verifique `.claude/settings.json`

---

**Aproveite desenvolvendo no Claude Code! 🚀**

O ambiente está totalmente configurado para desenvolvimento produtivo.
