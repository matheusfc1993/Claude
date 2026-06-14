# CFO Virtual - Sistema de Gestão Financeira para Clínicas

## 🎯 Visão Geral

Sistema completo **offline-first** de gestão financeira com análise por paciente, blocos de atendimento (50 minutos) e sincronização automática de dados.

### ✨ Características Principais

- **100% Offline**: PWA que funciona completamente sem internet
- **Blocos de 50 min**: Agendamentos automáticos de 7:10 até 20:00 (seg-sex)
- **Análise por Paciente**: Receita, despesas, lucro e margem por paciente
- **Gráficos Completos**: Tendências mensais, distribuição por serviço
- **Sincronização Automática**: Fila de mudanças offline que sincroniza online
- **Dashboard Intuitivo**: Visão completa com KPIs e segmentação

## 🚀 Setup Inicial

### Backend

```bash
cd packages/backend

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Executar migrations do Prisma
npm run db:push

# Iniciar servidor
npm run dev
```

**Servidor rodará em**: http://localhost:3000

### Frontend

```bash
cd packages/frontend

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env

# Iniciar dev server
npm run dev
```

**App rodará em**: http://localhost:5173

### Docker (Recomendado)

```bash
# Volta para raiz do projeto
cd ../..

# Inicia banco de dados e Redis
docker-compose up -d

# Setup do backend
cd packages/backend
npm run db:push
npm run dev

# Em outro terminal, frontend
cd packages/frontend
npm run dev
```

## 📚 Guia de Uso

### 1. **Criar Pacientes**
- Vá para `/patients`
- Clique em "+ Novo Paciente"
- Preencha nome, email, telefone, CPF
- Salve

### 2. **Agendar Consultas**
- Vá para `/schedule`
- Selecione profissional e data
- Clique em "+ Novo Agendamento"
- Selecione paciente e horário (blocos de 50 min)
- Confirme

### 3. **Visualizar Métricas por Paciente**
- Vá para `/patients`
- Clique em "Ver detalhes" de um paciente
- Visualize:
  - Total gasto e número de visitas
  - Gráfico de tendência mensal
  - Receita por serviço
  - Histórico de atendimentos

### 4. **Dashboard Geral**
- `/dashboard` mostra:
  - KPIs de receita/despesa/lucro
  - Gráficos de tendência mensal
  - Top 5 pacientes por receita
  - Segmentação de pacientes (High/Medium/Low value)
  - Métricas de retenção

## 🔌 API Endpoints

### Pacientes
```
POST   /api/financial/:clinicId/patients               # Criar
GET    /api/financial/:clinicId/patients               # Listar
GET    /api/financial/:clinicId/patients/:patientId    # Detalhe
PATCH  /api/financial/:clinicId/patients/:patientId    # Atualizar
DELETE /api/financial/:clinicId/patients/:patientId    # Deletar
```

### Agendamentos & Blocos
```
GET    /api/schedule/:clinicId/blocks/available                  # Blocos disponíveis
GET    /api/schedule/:clinicId/blocks/range                      # Blocos em período
POST   /api/schedule/:clinicId/appointments                      # Criar agendamento
PATCH  /api/schedule/:clinicId/appointments/:appointmentId       # Atualizar
DELETE /api/schedule/:clinicId/appointments/:appointmentId       # Cancelar
GET    /api/schedule/:clinicId/patients/:patientId/appointments  # Agendamentos do paciente
```

### Métricas por Paciente
```
GET /api/metrics/:clinicId/patient-metrics/patients/:patientId      # Métricas de um paciente
GET /api/metrics/:clinicId/patient-metrics/patients                  # Todos os pacientes
GET /api/metrics/:clinicId/patient-metrics/segments                  # Segmentação
GET /api/metrics/:clinicId/patient-metrics/retention                 # Retenção
```

## 🛠️ Tecnologias

### Backend
- **Node.js + Express** - Servidor
- **TypeScript** - Type safety
- **Prisma** - ORM + Migrations
- **PostgreSQL** - Banco de dados
- **Redis** - Cache (opcional)

### Frontend
- **React 18** - UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Query** - Data fetching
- **Recharts** - Visualizações
- **IndexedDB** - Armazenamento local
- **Service Worker** - PWA offline

## 📱 PWA (Progressive Web App)

A aplicação é uma PWA completa:

1. **Instalável**: Pode ser instalada como app nativo
2. **Offline**: Funciona 100% sem internet
3. **Sincronização**: Sincroniza mudanças quando volta online
4. **Cache**: Assets estáticos em cache de 30 dias

### Para instalar:
- Chrome/Edge: Menu → "Instalar app"
- Safari (iOS): Compartilhar → "Adicionar à Tela Inicial"

## 🔄 Sincronização Offline

1. **Modo Offline Detectado**: Indicador visual mostra status
2. **Fila de Alterações**: Mudanças são enfileiradas no IndexedDB
3. **Volta Online**: Sincroniza automaticamente (ou clique "Sincronizar agora")
4. **Conflitos**: Política de "servidor vence" (último envio prevalece)

## 📊 Blocos de Tempo

Sistema automático de 50 minutos:

- **7:10** - 8:00
- **8:00** - 8:50
- **8:50** - 9:40
- ... (até 20:00)
- **Total**: 11 blocos por dia × 5 dias = **55 blocos/semana**

Finais de semana automaticamente excludentes.

## 🔐 Segurança

- JWT authentication
- Roles: ADMIN, ACCOUNTANT, MANAGER, STAFF
- LGPD compliant
- Dados encriptados em trânsito (HTTPS)

## 📈 Performance

- Lazy loading de componentes
- React Query caching inteligente
- IndexedDB para queries offline
- Service Worker cache-first para assets

## 🐛 Troubleshooting

### Service Worker não registra
```javascript
// main.tsx deve ter:
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
}
```

### Blocos não aparecem
- Verificar se profissional está selecionado
- Verificar data (apenas seg-sex)
- IndexedDB pode estar vazio - sincronize

### Offline não funciona
- Verificar se manifest.json existe
- Debugar Service Worker em DevTools
- Limpar cache: DevTools → Application → Clear site data

## 📞 Contato & Suporte

Para issues ou sugestões, abra um GitHub Issue.

---

**Versão**: 1.0.0  
**Última atualização**: Jun 14, 2026  
**Licença**: Proprietary
