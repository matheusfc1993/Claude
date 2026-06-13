export type PoliticalPosition = 'VEREADOR' | 'DEPUTADO_ESTADUAL' | 'DEPUTADO_FEDERAL' | 'SENADOR' | 'PRESIDENTE'

export type GameStatus = 'ACTIVE' | 'PAUSED' | 'ENDED'

export interface Ideology {
  economia: number
  educacao: number
  saude: number
  seguranca: number
}

export interface GameMetrics {
  reputationChange: number
  fundsChange: number
  ideologyShift: Partial<Ideology>
  newAllies: string[]
}

export interface PoliticalGame {
  id: string
  userId: string
  currentTurn: number
  currentPosition: PoliticalPosition
  status: GameStatus
  reputation: number
  campaignFunds: number
  ideology: Ideology
  allies: string[]
  decisionHistory: any[]
  createdAt: string
  updatedAt: string
}

export interface GameChoice {
  text: string
  expectedImpact: string
}

export interface GameTurn {
  id: string
  gameId: string
  turnNumber: number
  situation: string
  choices: GameChoice[]
  chosenIndex: number | null
  consequence: string | null
  createdAt: string
}

export interface GameDecision {
  id: string
  gameId: string
  turnNumber: number
  chosenText: string
  tokensUsed: number
  reputationChange: number
  fundsChange: number
  ideologyShift: Partial<Ideology>
  newAllies: string[]
  createdAt: string
}
