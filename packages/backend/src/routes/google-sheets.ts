import { Router } from 'express';
import { authMiddleware, clinicAuthMiddleware } from '../middlewares/auth.js';
import {
  importData,
  exportMetrics,
  testConnection,
} from '../controllers/google-sheets.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(authMiddleware);

router.post('/:clinicId/import', clinicAuthMiddleware, asyncHandler(importData));
router.post('/:clinicId/export', clinicAuthMiddleware, asyncHandler(exportMetrics));
router.post('/test-connection', asyncHandler(testConnection));

export default router;
