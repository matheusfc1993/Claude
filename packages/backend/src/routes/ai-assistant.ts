import { Router } from 'express';
import { authMiddleware, clinicAuthMiddleware } from '../middlewares/auth.js';
import { chat, getConversationHistory } from '../controllers/ai-assistant.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(authMiddleware);

router.post('/:clinicId/chat', clinicAuthMiddleware, asyncHandler(chat));
router.get('/:clinicId/history', clinicAuthMiddleware, asyncHandler(getConversationHistory));

export default router;
