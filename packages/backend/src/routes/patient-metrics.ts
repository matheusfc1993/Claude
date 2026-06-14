import { Router } from 'express';
import {
  getPatientMetrics,
  getAllPatientMetrics,
  getPatientSegments,
  getRetentionMetrics,
} from '../controllers/patient-metrics.js';
import { auth } from '../middlewares/auth.js';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(auth);

// Patient metrics endpoints
router.get('/patients/:patientId', getPatientMetrics);
router.get('/patients', getAllPatientMetrics);
router.get('/segments', getPatientSegments);
router.get('/retention', getRetentionMetrics);

export default router;
