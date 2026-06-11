#!/usr/bin/env python3
"""
Monitor Econômico e Reajuste de Valor-Hora
Calcula o valor hora de fisioterapia baseado em R$50/h de agosto/2018
"""

import json
from datetime import datetime
from pathlib import Path

class EconomicMonitor:
    def __init__(self, json_file="economic_monitor.json"):
        self.json_file = Path(json_file)
        self.data = self._load_data()

    def _load_data(self):
        if self.json_file.exists():
            with open(self.json_file, 'r') as f:
                return json.load(f)
        return {"indices_economicos": [], "calculos_valor_hora": []}

    def _save_data(self):
        with open(self.json_file, 'w') as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)

    def calcular_valor_hora(self, ipca_acum=None, inpc_acum=None,
                           salario_br=None, salario_pa=None):
        """Calcula valor hora corrigido por diferentes métodos"""
        base = 50.00

        calculos = {
            "data": datetime.now().strftime("%Y-%m-%d"),
            "metodo_ipca": round(base * (1 + (ipca_acum/100)), 2) if ipca_acum else None,
            "metodo_inpc": round(base * (1 + (inpc_acum/100)), 2) if inpc_acum else None,
            "metodo_salario_nacional": None,
            "metodo_porto_alegre": None,
            "premium_recomendado": None,
            "notas": []
        }

        # Cálculo por salário médio
        if salario_br:
            # Salário 2018 era aprox R$ 2.300
            salario_2018 = 2300
            evolucao = (salario_br / salario_2018 - 1) * 100
            valor_salario = round(base * (1 + (evolucao/100)), 2)
            calculos["metodo_salario_nacional"] = valor_salario
            calculos["notas"].append(f"Evolução salário BR: +{evolucao:.1f}%")

        if salario_pa:
            # Porto Alegre tem tipicamente 5-10% acima da média
            valor_pa = round(salario_pa / 44 * 8, 2)  # ~8h/dia
            calculos["metodo_porto_alegre"] = valor_pa

        # Premium sugerido (média + inflação + 15% valorização profissional)
        valores_validos = [v for v in [
            calculos["metodo_ipca"],
            calculos["metodo_inpc"],
            calculos["metodo_salario_nacional"]
        ] if v]

        if valores_validos:
            media = sum(valores_validos) / len(valores_validos)
            premium = round(media * 1.15, 2)  # +15% de valorização profissional
            calculos["premium_recomendado"] = premium

        return calculos

    def gerar_relatorio(self):
        """Gera relatório formatado"""
        if not self.data["indices_economicos"]:
            print("⚠️  Nenhum dado econômico coletado ainda.")
            return

        ultimo = self.data["indices_economicos"][-1]

        print("\n" + "="*60)
        print("📊 MONITOR ECONÔMICO - VALOR HORA FISIOTERAPIA")
        print("="*60)
        print(f"\n📅 Data: {ultimo['data']}")
        print(f"💰 Base: R$ 50/h (agosto/2018)")

        print("\n--- INDICADORES ECONÔMICOS ---")
        print(f"IPCA (12m): {ultimo.get('ipca_12m', 'N/A')}%")
        print(f"IPCA (YTD): {ultimo.get('ipca_ytd', 'N/A')}%")
        print(f"Selic: {ultimo.get('selic', 'N/A')}%")
        print(f"Salário Médio BR: R$ {ultimo.get('salario_medio_br', 'N/A'):.2f}")

        if self.data["calculos_valor_hora"]:
            calc = self.data["calculos_valor_hora"][-1]
            print("\n--- VALOR HORA RECALCULADO ---")

            valores = []
            if calc.get("metodo_ipca"):
                print(f"✓ Por IPCA: R$ {calc['metodo_ipca']:.2f}")
                valores.append(calc["metodo_ipca"])
            if calc.get("metodo_inpc"):
                print(f"✓ Por INPC: R$ {calc['metodo_inpc']:.2f}")
                valores.append(calc["metodo_inpc"])
            if calc.get("metodo_salario_nacional"):
                print(f"✓ Por Salário BR: R$ {calc['metodo_salario_nacional']:.2f}")
                valores.append(calc["metodo_salario_nacional"])
            if calc.get("metodo_porto_alegre"):
                print(f"✓ Porto Alegre: R$ {calc['metodo_porto_alegre']:.2f}")

            if calc.get("premium_recomendado"):
                print(f"\n🎯 PREMIUM RECOMENDADO: R$ {calc['premium_recomendado']:.2f}")

        print("\n" + "="*60)

if __name__ == "__main__":
    monitor = EconomicMonitor()
    monitor.gerar_relatorio()
