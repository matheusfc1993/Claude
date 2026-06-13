import type { PoliticalGame, GameTurn, GameDecision, PoliticalPosition } from '../types/game'

const GAMES_KEY = 'political_games'
const TURNS_KEY = 'game_turns'
const DECISIONS_KEY = 'game_decisions'

export interface StoredGame extends PoliticalGame {
  id: string
}

export const localGameStorage = {
  // Games Management
  createGame: (userId: string, startingPosition: PoliticalPosition): StoredGame => {
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const game: StoredGame = {
      id: gameId,
      userId,
      currentTurn: 1,
      currentPosition: startingPosition,
      status: 'ACTIVE',
      reputation: 50,
      campaignFunds: 10000,
      ideology: {
        economia: 0.5,
        educacao: 0.5,
        saude: 0.5,
        seguranca: 0.5,
      },
      allies: [],
      decisionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const games = localGameStorage.getAllGames(userId)
    games.push(game)
    localStorage.setItem(`${GAMES_KEY}_${userId}`, JSON.stringify(games))

    return game
  },

  getGame: (gameId: string): StoredGame | null => {
    const allGames = localStorage.getItem(GAMES_KEY) || '{}'
    const gamesObj = JSON.parse(allGames)

    for (const games of Object.values(gamesObj) as StoredGame[][]) {
      const game = (games as StoredGame[]).find((g) => g.id === gameId)
      if (game) return game
    }

    return null
  },

  updateGame: (game: StoredGame): void => {
    const games = localGameStorage.getAllGames(game.userId)
    const index = games.findIndex((g) => g.id === game.id)

    if (index !== -1) {
      game.updatedAt = new Date().toISOString()
      games[index] = game
      localStorage.setItem(`${GAMES_KEY}_${game.userId}`, JSON.stringify(games))
    }
  },

  getAllGames: (userId: string): StoredGame[] => {
    const stored = localStorage.getItem(`${GAMES_KEY}_${userId}`)
    return stored ? JSON.parse(stored) : []
  },

  // Turns Management
  createTurn: (gameId: string, turnNumber: number, situation: string, choices: any[]): GameTurn => {
    const turnId = `turn_${gameId}_${turnNumber}`

    const turn: GameTurn = {
      id: turnId,
      gameId,
      turnNumber,
      situation,
      choices,
      chosenIndex: null,
      consequence: null,
      createdAt: new Date().toISOString(),
    }

    const turns = localGameStorage.getTurns(gameId)
    turns.push(turn)
    localStorage.setItem(`${TURNS_KEY}_${gameId}`, JSON.stringify(turns))

    return turn
  },

  getTurns: (gameId: string): GameTurn[] => {
    const stored = localStorage.getItem(`${TURNS_KEY}_${gameId}`)
    return stored ? JSON.parse(stored) : []
  },

  getTurn: (gameId: string, turnNumber: number): GameTurn | null => {
    const turns = localGameStorage.getTurns(gameId)
    return turns.find((t) => t.turnNumber === turnNumber) || null
  },

  updateTurn: (turn: GameTurn): void => {
    const turns = localGameStorage.getTurns(turn.gameId)
    const index = turns.findIndex((t) => t.id === turn.id)

    if (index !== -1) {
      turns[index] = turn
      localStorage.setItem(`${TURNS_KEY}_${turn.gameId}`, JSON.stringify(turns))
    }
  },

  // Decisions Management
  createDecision: (gameDecision: GameDecision): GameDecision => {
    const decisions = localGameStorage.getDecisions(gameDecision.gameId)
    decisions.push(gameDecision)
    localStorage.setItem(`${DECISIONS_KEY}_${gameDecision.gameId}`, JSON.stringify(decisions))

    return gameDecision
  },

  getDecisions: (gameId: string): GameDecision[] => {
    const stored = localStorage.getItem(`${DECISIONS_KEY}_${gameId}`)
    return stored ? JSON.parse(stored) : []
  },

  // Clear data
  clearGame: (gameId: string): void => {
    localStorage.removeItem(`${TURNS_KEY}_${gameId}`)
    localStorage.removeItem(`${DECISIONS_KEY}_${gameId}`)
  },
}
