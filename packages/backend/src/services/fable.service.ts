import Anthropic from '@anthropic-ai/sdk'
import { PoliticalGame } from '@prisma/client'
import logger from '../utils/logger'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export class FableService {
  async generateSituation(game: PoliticalGame): Promise<{
    situation: string
    choices: Array<{ text: string; expectedImpact: string }>
  }> {
    const decisionHistory = Array.isArray(game.decisionHistory)
      ? (game.decisionHistory as any[]).slice(-5)
      : []

    const allies = Array.isArray(game.allies) ? game.allies : []
    const ideology = game.ideology as any

    const systemPrompt = `Você é um gerador de cenários políticos para um jogo de estratégia brasileira.

## Contexto do Jogador
- Cargo atual: ${game.currentPosition}
- Reputação: ${game.reputation}/100
- Fundos de campanha: R$ ${game.campaignFunds.toFixed(2)}
- Ideologia: economia=${(ideology.economia * 100).toFixed(0)}%, educação=${(ideology.educacao * 100).toFixed(0)}%, saúde=${(ideology.saude * 100).toFixed(0)}%, segurança=${(ideology.seguranca * 100).toFixed(0)}%
- Aliados: ${allies.length} apoiadores
- Histórico: ${decisionHistory.map((d) => (d as any).choice).join(' → ')}

## Sua Tarefa
Crie uma situação política realista e envolvente (2-3 parágrafos) baseada no contexto do jogador.

## Formato da Resposta
Retorne APENAS JSON válido no seguinte formato (sem explicações adicionais):
{
  "situation": "descrição da situação em 2-3 parágrafos",
  "choices": [
    {"text": "opção 1", "expectedImpact": "impacto esperado"},
    {"text": "opção 2", "expectedImpact": "impacto esperado"},
    {"text": "opção 3", "expectedImpact": "impacto esperado"}
  ]
}

Garanta que:
- A situação seja realista e coerente com o histórico do jogador
- Cada opção tenha consequências claras e diferentes
- As opções reflitam perspectivas políticas variadas
- O tom seja dramatizado mas informativo`

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-fable-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Gere uma nova situação política para o turno ${game.currentTurn}.`,
          },
        ],
      })

      const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      logger.info(`Generated situation for game ${game.id} (turn ${game.currentTurn})`)

      return {
        situation: parsed.situation,
        choices: parsed.choices,
      }
    } catch (error) {
      logger.error('Error generating situation:', error)
      // Fallback to a generic situation
      return this.getFallbackSituation()
    }
  }

  async generateConsequence(
    game: PoliticalGame,
    chosenOption: string
  ): Promise<{
    consequence: string
    reputationChange: number
    fundsChange: number
    ideologyShift: any
    newAllies: string[]
    tokensUsed: number
  }> {
    const ideology = game.ideology as any
    const allies = Array.isArray(game.allies) ? game.allies : []

    const systemPrompt = `Você é um gerador de consequências políticas para um jogo de estratégia.

## Contexto
- Cargo: ${game.currentPosition}
- Reputação: ${game.reputation}/100
- Fundos: R$ ${game.campaignFunds.toFixed(2)}
- Aliados: ${allies.length}

## Escolha do Jogador
"${chosenOption}"

## Sua Tarefa
Gere as consequências realistas dessa escolha.

## Formato da Resposta
Retorne APENAS JSON válido:
{
  "consequence": "descrição das consequências em 1 parágrafo",
  "reputationChange": número entre -20 e 20,
  "fundsChange": número entre -5000 e 10000,
  "ideologyShift": {"economia": -0.1 a 0.1, "educacao": -0.1 a 0.1, "saude": -0.1 a 0.1, "seguranca": -0.1 a 0.1},
  "newAllies": ["nome de possível novo apoiador"]
}

Garanta que:
- As consequências sejam coerentes com a escolha
- Os números sejam realistas
- Os aliados sejam coerentes com a ideologia`

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-fable-20241022',
        max_tokens: 512,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: 'Gere as consequências dessa escolha.',
          },
        ],
      })

      const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        consequence: parsed.consequence,
        reputationChange: parsed.reputationChange,
        fundsChange: parsed.fundsChange,
        ideologyShift: parsed.ideologyShift,
        newAllies: parsed.newAllies || [],
        tokensUsed: Math.ceil((message.usage?.input_tokens || 0 + message.usage?.output_tokens || 0) / 1000),
      }
    } catch (error) {
      logger.error('Error generating consequence:', error)
      // Fallback consequence
      return this.getFallbackConsequence()
    }
  }

  private getFallbackSituation(): { situation: string; choices: any[] } {
    return {
      situation:
        'Um escândalo local emerge quando a oposição questiona a origem dos fundos de sua campanha. A mídia começa a investigar. Você precisa agir rápido para controlar os danos.',
      choices: [
        {
          text: 'Confrontar a oposição publicamente',
          expectedImpact: 'Alto risco, alto retorno de reputação se vencer',
        },
        {
          text: 'Fazer um comunicado transparente explicando os fundos',
          expectedImpact: 'Risco médio, impacto moderado na reputação',
        },
        {
          text: 'Ignorar a questão e focar em políticas',
          expectedImpact: 'Risco baixo, mas pode aumentar desconfiança',
        },
      ],
    }
  }

  private getFallbackConsequence(): {
    consequence: string
    reputationChange: number
    fundsChange: number
    ideologyShift: any
    newAllies: string[]
    tokensUsed: number
  } {
    return {
      consequence: 'Sua ação teve efeito moderado na arena política local.',
      reputationChange: 5,
      fundsChange: -500,
      ideologyShift: { economia: 0, educacao: 0, saude: 0, seguranca: 0 },
      newAllies: [],
      tokensUsed: 0,
    }
  }
}

export const fableService = new FableService()
