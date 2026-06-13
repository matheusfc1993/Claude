import type { PoliticalGame, GameChoice } from '../types/game'

interface SituationData {
  situation: string
  choices: GameChoice[]
}

interface ConsequenceData {
  consequence: string
  reputationChange: number
  fundsChange: number
  ideologyShift: Record<string, number>
  newAllies: string[]
}

// Database of political situations based on player context
const SITUATION_TEMPLATES = {
  vereador: [
    {
      situation:
        'A prefeitura propõe aumentar os impostos locais para financiar uma nova escola. Os moradores estão divididos. Você, como vereador, tem voz importante nessa decisão. A mídia local já está cobrindo a história.',
      choices: [
        {
          text: 'Apoiar o aumento de impostos para educação',
          expectedImpact: '+10 reputação, -2000 fundos, mais educação',
        },
        {
          text: 'Propor alternativa: parcerias público-privadas',
          expectedImpact: '+5 reputação, novos aliados',
        },
        {
          text: 'Votar contra: proteger o bolso dos eleitores',
          expectedImpact: '+15 reputação junto a comerciantes, menos apoio de progressistas',
        },
      ],
    },
    {
      situation:
        'Um escândalo de corrupção é descoberto na câmara municipal. Seus colegas vereadores estão envolvidos. A população cobra posicionamento claro.',
      choices: [
        {
          text: 'Denunciar publicamente e propor investigação',
          expectedImpact: '+20 reputação, ganhar inimigos poderosos',
        },
        {
          text: 'Apoiar reforma administrativa interna',
          expectedImpact: '+8 reputação, manter status quo',
        },
        {
          text: 'Manter silêncio estratégico',
          expectedImpact: '-10 reputação, evitar conflitos',
        },
      ],
    },
    {
      situation:
        'Uma empresa quer construir um shopping no centro da cidade. Trará empregos mas pode prejudicar o comércio local. Moradores estão mobilizados.',
      choices: [
        {
          text: 'Aprovar com exigências ambientais rigorosas',
          expectedImpact: '+5 reputação, +3000 fundos',
        },
        {
          text: 'Bloquear completamente o projeto',
          expectedImpact: '+8 reputação com progressistas, -2000 fundos',
        },
        {
          text: 'Negociar um acordo com compensações sociais',
          expectedImpact: '+12 reputação, ganhar aliados',
        },
      ],
    },
  ],
  deputado_estadual: [
    {
      situation:
        'O governador propõe uma reforma tributária que afeta pequenas cidades. Como deputado estadual, você tem influência. A população de sua região está preocupada.',
      choices: [
        {
          text: 'Negociar exceções para sua região',
          expectedImpact: '+15 reputação local, +5000 fundos',
        },
        {
          text: 'Votar contra a reforma',
          expectedImpact: '+10 reputação, fazer inimigos no governo',
        },
        {
          text: 'Apoiar a reforma completa',
          expectedImpact: '+8 reputação estadual, -5 reputação local',
        },
      ],
    },
    {
      situation:
        'Há denúncias de violência policial em comunidades carentes. A mídia estadual cobra posicionamento dos deputados. É um momento crítico para sua carreira.',
      choices: [
        {
          text: 'Propor lei de accountability para a polícia',
          expectedImpact: '+12 reputação, apoio de ONGs',
        },
        {
          text: 'Equilibrar: defender polícia mas exigir treinamento',
          expectedImpact: '+5 reputação, manter aliados de segurança',
        },
        {
          text: 'Ficar neutro e focar em outros temas',
          expectedImpact: '-5 reputação, evitar conflitos',
        },
      ],
    },
  ],
  deputado_federal: [
    {
      situation:
        'Há votação sobre uma lei de descriminalização de drogas. É um tema divisor. A sociedade está polarizada. Você precisa decidir seu voto.',
      choices: [
        {
          text: 'Votar a favor de descriminalização',
          expectedImpact: '+10 reputação progressista, -5 conservadora',
        },
        {
          text: 'Votar contra e defender combate ao tráfico',
          expectedImpact: '+10 reputação conservadora, -5 progressista',
        },
        {
          text: 'Propor solução intermediária: tratamento em vez de prisão',
          expectedImpact: '+8 ambos os lados',
        },
      ],
    },
    {
      situation:
        'Há disputa entre dois blocos políticos sobre orçamento federal. Você é o voto de minerva que pode decidir. Ambos os lados oferecem apoio para sua carreira.',
      choices: [
        {
          text: 'Votar com a coligação que apoia sua base',
          expectedImpact: '+10 reputação, +7000 fundos',
        },
        {
          text: 'Votar com o bloco que tem melhor proposta para o país',
          expectedImpact: '+12 reputação, menos fundos',
        },
        {
          text: 'Negociar emendas para sua região',
          expectedImpact: '+8 reputação, +5000 fundos regionais',
        },
      ],
    },
  ],
}

export const localGameEngine = {
  generateSituation: (game: PoliticalGame): SituationData => {
    const templates =
      SITUATION_TEMPLATES[game.currentPosition.toLowerCase() as keyof typeof SITUATION_TEMPLATES] ||
      SITUATION_TEMPLATES.vereador

    // Select based on turn number for variety
    const index = game.currentTurn % templates.length
    const template = templates[index]

    return {
      situation: template.situation,
      choices: template.choices,
    }
  },

  generateConsequence: (game: PoliticalGame, chosenText: string): ConsequenceData => {
    // Simulate consequence based on choice text and game ideology
    const isProgressive = game.ideology.educacao + game.ideology.saude > 1
    const isConservative = game.ideology.economia + game.ideology.seguranca > 1

    let reputationChange = 5
    let fundsChange = 0
    let ideologyShift: Record<string, number> = {}
    let newAllies: string[] = []

    // Analyze choice keywords to determine impact
    if (chosenText.toLowerCase().includes('educação') || chosenText.toLowerCase().includes('progressista')) {
      reputationChange += isProgressive ? 8 : -3
      ideologyShift = { educacao: 0.05, saude: 0.03 }
      newAllies = ['ONGs Sociais', 'Sindicato de Educadores']
    } else if (
      chosenText.toLowerCase().includes('segurança') ||
      chosenText.toLowerCase().includes('polícia') ||
      chosenText.toLowerCase().includes('conservador')
    ) {
      reputationChange += isConservative ? 8 : -3
      ideologyShift = { seguranca: 0.05, economia: 0.03 }
      newAllies = ['Associação Comercial', 'Sindicato de Polícia']
    } else if (
      chosenText.toLowerCase().includes('negociar') ||
      chosenText.toLowerCase().includes('acordo') ||
      chosenText.toLowerCase().includes('intermediária')
    ) {
      reputationChange += 10
      ideologyShift = { economia: 0.02, saude: 0.02 }
      newAllies = ['Mediadores Políticos']
      fundsChange = 2000
    }

    // Random variance
    reputationChange += Math.floor(Math.random() * 6) - 2
    fundsChange += Math.floor(Math.random() * 2000) - 500

    return {
      consequence:
        `Sua decisão gerou reações na população. Apoiadores da sua posição o elogiam, enquanto críticos questionam sua escolha. A mídia local noticiou sua ação. ` +
        (newAllies.length > 0 ? `Você ganhou apoio de ${newAllies.join(', ')}.` : 'Sua reputação oscilou com a comunidade política.'),
      reputationChange: Math.max(-20, Math.min(20, reputationChange)),
      fundsChange: Math.max(-5000, Math.min(10000, fundsChange)),
      ideologyShift,
      newAllies,
    }
  },
}
