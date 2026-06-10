import { Router } from 'express';
import { authMiddleware, clinicAuthMiddleware } from '../middlewares/auth.js';
import {
  getDashboardMetrics,
  getMonthlyTrend,
  getRevenueByService,
  getProfessionalMetrics,
  getExpenseBreakdown,
  getKPISummary,
} from '../controllers/metrics.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(authMiddleware);

router.get('/:clinicId/dashboard', clinicAuthMiddleware, asyncHandler(getDashboardMetrics));
router.get('/:clinicId/trend', clinicAuthMiddleware, asyncHandler(getMonthlyTrend));
router.get('/:clinicId/revenue-by-service', clinicAuthMiddleware, asyncHandler(getRevenueByService));
router.get('/:clinicId/professionals', clinicAuthMiddleware, asyncHandler(getProfessionalMetrics));
router.get('/:clinicId/expenses', clinicAuthMiddleware, asyncHandler(getExpenseBreakdown));
router.get('/:clinicId/summary', clinicAuthMiddleware, asyncHandler(getKPISummary));

export default router;
