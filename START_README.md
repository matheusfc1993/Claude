# 🚀 CFO Virtual - Iniciar Sistema

Escolha seu sistema operacional para iniciar a aplicação:

---

## 🪟 **Windows**

### Opção 1: Arquivo .bat (Simples)
```bash
# Duplo-clique em:
START_WINDOWS.bat
```
✅ Abre 2 janelas automaticamente (Backend + Frontend)

### Opção 2: PowerShell (Moderno)
```powershell
# Clique direito → Executar com PowerShell
# Ou no PowerShell:
powershell -ExecutionPolicy Bypass -File START_WINDOWS.ps1
```

---

## 🐧 **Linux / Mac**

### Terminal
```bash
# Dar permissão de execução
chmod +x START_LINUX.sh

# Executar
./START_LINUX.sh
```

---

## ✅ O que Acontece

1. **Verifica Node.js** - Se não tiver, pede para instalar
2. **Instala dependências** - `npm install` (automático)
3. **Inicia Backend** - Porta 3000
4. **Inicia Frontend** - Porta 5173
5. **Abre automaticamente** no navegador (Windows) ou exibe URL (Linux/Mac)

---

## 📋 Requisitos

- ✅ **Node.js 18+** - [Download](https://nodejs.org)
- ✅ **npm** - Vem com Node.js
- ✅ **PostgreSQL** (opcional, pode usar Docker)

### Com Docker
```bash
docker-compose up -d
```

---

## 🌐 Acessar

Após iniciar:

| Serviço | URL | O que faz |
|---------|-----|----------|
| **Frontend** | http://localhost:5173 | App web da clínica |
| **Backend** | http://localhost:3000 | API REST |
| **Health Check** | http://localhost:3000/health | Status do servidor |

---

## 🛑 Parar o Sistema

### Windows (.bat)
- Feche as 2 janelas de terminal

### Windows (PowerShell)
- Pressione **Enter** na janela do PowerShell
- Ou: `Stop-Process -Id <PID>`

### Linux/Mac
- Pressione **Ctrl + C** no terminal
- Ou: `kill <PID>`

---

## 🔍 Troubleshooting

### Node.js não encontrado
```bash
# Instale Node.js
https://nodejs.org

# Verifique depois
node --version
npm --version
```

### Porta já em uso
```bash
# Windows - Liberar porta 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux - Liberar porta 3000
lsof -ti:3000 | xargs kill -9
```

### Banco de dados
```bash
# Se não tiver PostgreSQL, use Docker:
docker-compose up -d
```

### Limpeza de cache
```bash
# Deletar node_modules e reinstalar
rm -rf packages/*/node_modules
npm install
```

---

## 📝 Logs

Quando usar scripts:

- **Windows (.bat/.ps1)**: Logs aparecem nas janelas do terminal
- **Linux/Mac**: Logs salvos em `./logs/`
  ```bash
  tail -f logs/backend.log
  tail -f logs/frontend.log
  ```

---

## 🎮 Primeiro Uso

1. **Abrir** http://localhost:5173
2. **Registrar** - Criar conta de clínica
3. **Login** - Entrar na aplicação
4. **Explorar**:
   - 📊 Dashboard
   - 👥 Pacientes
   - 📅 Agendamentos
   - 💰 Financeiro

---

## 🔧 Desenvolvimento

Se quiser modificar código:

```bash
# Backend mudanças recarregam automaticamente
cd packages/backend && npm run dev

# Frontend mudanças recarregam via Vite
cd packages/frontend && npm run dev
```

---

## 📦 Build para Produção

```bash
# Backend
cd packages/backend
npm run build

# Frontend
cd packages/frontend
npm run build
```

Resultado em `packages/frontend/dist/`

---

## 🆘 Precisa de Help?

1. Verifique **SETUP.md** para documentação completa
2. Verifique logs para erros
3. Certifique-se Node.js está instalado
4. Tente deletar node_modules e reinstalar

---

**Desenvolvido com ❤️ para clínicas**
