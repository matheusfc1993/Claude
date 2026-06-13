import { Response } from 'express'
import { z } from 'zod'
import { gameService } from '../services/game.service'
import { AuthRequest } from '../middlewares/auth'
import logger from '../utils/logger'

// Schemas
const startGameSchema = z.object({
  startingPosition: z.enum(['VEREADOR', 'DEPUTADO_ESTADUAL', 'DEPUTADO_FEDERAL', 'SENADOR']),
})

const makeDecisionSchema = z.object({
  chosenOptionIndex: z.number().int().min(0).max(3),
})

export async function startGame(req: AuthRequest, res: Response) {
  try {
    const body = startGameSchema.parse(req.body)
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const game = await gameService.startGame(userId, body.startingPosition)

    // Fetch the first turn
    const turns = await gameService.getTurnHistory(game.id, 1)

    res.status(201).json({
      game,
      currentTurn: turns[0] || null,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    logger.error('Error starting game:', error)
    res.status(500).json({ error: 'Failed to start game' })
  }
}

export async function getGameState(req: AuthRequest, res: Response) {
  try {
    const gameId = req.params.gameId
    const game = await gameService.getGameState(gameId)

    if (!game) {
      return res.status(404).json({ error: 'Game not found' })
    }

    // Verify ownership
    if (game.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // Get current turn
    const turns = await gameService.getTurnHistory(gameId, 1)

    res.json({
      game,
      currentTurn: turns[0] || null,
    })
  } catch (error) {
    logger.error('Error getting game state:', error)
    res.status(500).json({ error: 'Failed to get game state' })
  }
}

export async function makeDecision(req: AuthRequest, res: Response) {
  try {
    const gameId = req.params.gameId
    const body = makeDecisionSchema.parse(req.body)

    // Verify game ownership
    const game = await gameService.getGameState(gameId)
    if (!game) {
      return res.status(404).json({ error: 'Game not found' })
    }

    if (game.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const decision = await gameService.makeDecision(gameId, body.chosenOptionIndex)

    // Get updated game state and current turn
    const updatedGame = await gameService.getGameState(gameId)
    const turns = await gameService.getTurnHistory(gameId, 1)

    res.status(201).json({
      decision,
      game: updatedGame,
      currentTurn: turns[0] || null,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    logger.error('Error making decision:', error)
    res.status(500).json({ error: 'Failed to make decision' })
  }
}

export async function listPlayerGames(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const games = await gameService.listPlayerGames(userId)

    res.json({ games })
  } catch (error) {
    logger.error('Error listing games:', error)
    res.status(500).json({ error: 'Failed to list games' })
  }
}

export async function getTurnHistory(req: AuthRequest, res: Response) {
  try {
    const gameId = req.params.gameId
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100)

    // Verify game ownership
    const game = await gameService.getGameState(gameId)
    if (!game) {
      return res.status(404).json({ error: 'Game not found' })
    }

    if (game.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const turns = await gameService.getTurnHistory(gameId, limit)

    res.json({ turns })
  } catch (error) {
    logger.error('Error getting turn history:', error)
    res.status(500).json({ error: 'Failed to get turn history' })
  }
}
