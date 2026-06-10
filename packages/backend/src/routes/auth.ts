import { Router } from 'express';
import { register, login } from '../controllers/auth.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

export default router;
