import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import aiAssistantService from '../services/ai-assistant.service.js';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional(),
});

export async function chat(req: AuthRequest, res: Response) {
  const { clinicId } = req.params;
  const body = chatSchema.parse(req.body);

  const response = await aiAssistantService.chat(
    clinicId,
    req.user!.id,
    body.message,
    body.conversationHistory || []
  );

  res.json({
    message: response.message,
    tokensUsed: response.tokensUsed,
  });
}

export async function getConversationHistory(req: AuthRequest, res: Response) {
  const { clinicId } = req.params;

  // This would fetch from database
  // For now, return empty for frontend to manage history
  res.json({
    history: [],
  });
}
