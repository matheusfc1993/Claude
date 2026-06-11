# 📊 Monitor Econômico - Valor Hora Fisioterapia

## Objetivo
Acompanhar diariamente dados econômicos relevantes do Brasil e Porto Alegre/RS, recalculando o valor da hora de trabalho com base em **R$50/h em agosto de 2018**.

## Dados Monitorados Diariamente
- **IPCA** - Inflação oficial
- **INPC** - Inflação para trabalhadores
- **IGP-M** - Inflação de preços
- **Selic** - Taxa básica de juros
- **Salário médio brasileiro** - Renda média nacional
- **Rendimento médio Porto Alegre/RS** - Renda local
- **Custos de saúde** - Impacto na demanda
- **Mercado de fisioterapia** - Tendências de preços

## Estrutura de Dados

### `economic_monitor.json`
Arquivo central que armazena:
- Baseline de agosto/2018
- Série histórica de índices econômicos
- Cálculos mensais de valor hora
- Tendências econômicas

### `calculate_hour_value.py`
Script Python que:
- Carrega dados do JSON
- Calcula valor hora por 4 métodos
- Gera relatório formatado
- Persiste dados

## Cálculos de Valor Hora

| Método | Fórmula | Base |
|--------|---------|------|
| INPC | R$ 50 × (1 + INPC%) | Piso econômico |
| IPCA | R$ 50 × (1 + IPCA%) | Valor real |
| Salário BR | Evolução renda média nacional | Mercado |
| Porto Alegre | Evolução renda local | Local |
| **Premium** | **Média + 15% valorização** | **Recomendado** |

## Como Usar

### Gerar Relatório
```bash
python3 calculate_hour_value.py
```

### Adicionar Dados Manualmente
```python
from calculate_hour_value import EconomicMonitor

monitor = EconomicMonitor()
# ... adicionar dados ...
monitor._save_data()
```

## Automação Recorrente
Use `/loop 7d` para executar verificação semanal de novos dados econômicos.

---
**Última atualização:** 2026-06-11  
**Próxima coleta programada:** 2026-06-18
