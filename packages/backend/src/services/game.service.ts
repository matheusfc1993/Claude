import { PrismaClient, PoliticalGame, GameTurn, GameDecision, PoliticalPosition } from '@prisma/client'
import { FableService } from './fable.service'
import logger from '../utils/logger'

const prisma = new PrismaClient()

export class GameService {
  private fableService: FableService

  constructor() {
    this.fableService = new FableService()
  }

  async startGame(userId: string, startingPosition: PoliticalPosition): Promise<PoliticalGame> {
    const existingGame = await prisma.politicalGame.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    })

    if (existingGame) {
      throw new Error('User already has an active game')
    }

    const game = await prisma.politicalGame.create({
      data: {
        userId,
        currentPosition: startingPosition,
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
      },
    })

    // Generate first turn
    await this.generateNextTurn(game)

    return game
  }

  async getGameState(gameId: string): Promise<PoliticalGame | null> {
    return prisma.politicalGame.findUnique({
      where: { id: gameId },
    })
  }

  async generateNextTurn(game: PoliticalGame): Promise<GameTurn> {
    const nextTurnNumber = game.currentTurn + 1

    // Check if turn already exists
    const existingTurn = await prisma.gameTurn.findUnique({
      where: {
        gameId_turnNumber: {
          gameId: game.id,
          turnNumber: nextTurnNumber,
        },
      },
    })

    if (existingTurn) {
      return existingTurn
    }

    // Generate situation using Fable
    const { situation, choices } = await this.fableService.generateSituation(game)

    const turn = await prisma.gameTurn.create({
      data: {
        gameId: game.id,
        turnNumber: nextTurnNumber,
        situation,
        choices,
      },
    })

    logger.info(`Generated turn ${nextTurnNumber} for game ${game.id}`)
    return turn
  }

  async makeDecision(gameId: string, chosenOptionIndex: number): Promise<GameDecision> {
    const game = await this.getGameState(gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    // Get current turn
    const currentTurn = await prisma.gameTurn.findUnique({
      where: {
        gameId_turnNumber: {
          gameId,
          turnNumber: game.currentTurn,
        },
      },
    })

    if (!currentTurn) {
      throw new Error('Current turn not found')
    }

    if (currentTurn.chosenIndex !== null) {
      throw new Error('Turn already has a decision')
    }

    if (!Array.isArray(currentTurn.choices) || chosenOptionIndex >= currentTurn.choices.length) {
      throw new Error('Invalid choice index')
    }

    const chosenOption = (currentTurn.choices as any[])[chosenOptionIndex]

    // Generate consequence using Fable
    const consequence = await this.fableService.generateConsequence(game, chosenOption.text)

    // Update turn with decision
    await prisma.gameTurn.update({
      where: { id: currentTurn.id },
      data: {
        chosenIndex: chosenOptionIndex,
        consequence: consequence.consequence,
      },
    })

    // Create decision record
    const decision = await prisma.gameDecision.create({
      data: {
        gameId,
        turnNumber: game.currentTurn,
        chosenText: chosenOption.text,
        tokensUsed: consequence.tokensUsed,
        reputationChange: consequence.reputationChange,
        fundsChange: consequence.fundsChange,
        ideologyShift: consequence.ideologyShift,
        newAllies: consequence.newAllies,
      },
    })

    // Update game state
    const newReputation = Math.max(0, Math.min(100, game.reputation + consequence.reputationChange))
    const newFunds = game.campaignFunds + consequence.fundsChange
    const newIdeology = this.mergeIdeology(game.ideology as any, consequence.ideologyShift as any)
    const newAllies = Array.isArray(game.allies) ? game.allies : []
    const updatedAllies = [...newAllies, ...consequence.newAllies]

    // Add to decision history
    const decisionHistory = Array.isArray(game.decisionHistory) ? game.decisionHistory : []
    decisionHistory.push({
      turn: game.currentTurn,
      choice: chosenOption.text,
      consequences: {
        reputationChange: consequence.reputationChange,
        fundsChange: consequence.fundsChange,
        newAllies: consequence.newAllies,
      },
    })

    await prisma.politicalGame.update({
      where: { id: gameId },
      data: {
        currentTurn: game.currentTurn + 1,
        reputation: newReputation,
        campaignFunds: newFunds,
        ideology: newIdeology,
        allies: updatedAllies,
        decisionHistory,
      },
    })

    // Generate next turn
    const updatedGame = await this.getGameState(gameId)
    if (updatedGame) {
      await this.generateNextTurn(updatedGame)
    }

    logger.info(`Decision made for game ${gameId}: ${chosenOption.text}`)
    return decision
  }

  private mergeIdeology(current: any, shift: any): any {
    const merged = { ...current }
    for (const key in shift) {
      if (merged[key] !== undefined) {
        merged[key] = Math.max(0, Math.min(1, merged[key] + shift[key]))
      }
    }
    return merged
  }

  async getTurnHistory(gameId: string, limit = 10): Promise<GameTurn[]> {
    return prisma.gameTurn.findMany({
      where: { gameId },
      orderBy: { turnNumber: 'desc' },
      take: limit,
    })
  }

  async listPlayerGames(userId: string): Promise<PoliticalGame[]> {
    return prisma.politicalGame.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }
}

export const gameService = new GameService()
