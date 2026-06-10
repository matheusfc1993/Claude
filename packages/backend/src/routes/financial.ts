import { Router } from 'express';
import { authMiddleware, clinicAuthMiddleware } from '../middlewares/auth.js';
import {
  createFixedExpense,
  getFixedExpenses,
  updateFixedExpense,
  deleteFixedExpense,
  createVariableExpense,
  getVariableExpenses,
  createRevenue,
  getRevenues,
  createProfessional,
  getProfessionals,
  updateProfessional,
} from '../controllers/financial.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

// Apply auth to all routes
router.use(authMiddleware);

// Fixed Expenses
router.post('/:clinicId/fixed-expenses', clinicAuthMiddleware, asyncHandler(createFixedExpense));
router.get('/:clinicId/fixed-expenses', clinicAuthMiddleware, asyncHandler(getFixedExpenses));
router.patch('/:clinicId/fixed-expenses/:id', clinicAuthMiddleware, asyncHandler(updateFixedExpense));
router.delete('/:clinicId/fixed-expenses/:id', clinicAuthMiddleware, asyncHandler(deleteFixedExpense));

// Variable Expenses
router.post('/:clinicId/variable-expenses', clinicAuthMiddleware, asyncHandler(createVariableExpense));
router.get('/:clinicId/variable-expenses', clinicAuthMiddleware, asyncHandler(getVariableExpenses));

// Revenues
router.post('/:clinicId/revenues', clinicAuthMiddleware, asyncHandler(createRevenue));
router.get('/:clinicId/revenues', clinicAuthMiddleware, asyncHandler(getRevenues));

// Professionals
router.post('/:clinicId/professionals', clinicAuthMiddleware, asyncHandler(createProfessional));
router.get('/:clinicId/professionals', clinicAuthMiddleware, asyncHandler(getProfessionals));
router.patch('/:clinicId/professionals/:id', clinicAuthMiddleware, asyncHandler(updateProfessional));

export default router;
