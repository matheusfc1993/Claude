import { Router } from 'express'
import {
  startGame,
  getGameState,
  makeDecision,
  listPlayerGames,
  getTurnHistory,
} from '../controllers/political-game.js'
import { authMiddleware } from '../middlewares/auth.js'
import { asyncHandler } from '../utils/async-handler.js'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Game management
router.post('/start', asyncHandler(startGame))
router.get('/', asyncHandler(listPlayerGames))
router.get('/:gameId', asyncHandler(getGameState))

// Turn and decision management
router.post('/:gameId/decide', asyncHandler(makeDecision))
router.get('/:gameId/history', asyncHandler(getTurnHistory))

export default router
