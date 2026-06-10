import { Router } from 'express';
import { authMiddleware, clinicAuthMiddleware } from '../middlewares/auth.js';
import {
  getDailyReport,
  getReportsHistory,
  getLatestReport,
} from '../controllers/reports.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(authMiddleware);

router.get('/:clinicId/daily', clinicAuthMiddleware, asyncHandler(getDailyReport));
router.get('/:clinicId/history', clinicAuthMiddleware, asyncHandler(getReportsHistory));
router.get('/:clinicId/latest', clinicAuthMiddleware, asyncHandler(getLatestReport));

export default router;
