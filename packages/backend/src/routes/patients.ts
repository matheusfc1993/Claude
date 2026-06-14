import { Router } from 'express';
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientsByIds,
} from '../controllers/patients.js';
import { auth } from '../middlewares/auth.js';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(auth);

// Patient CRUD endpoints
router.post('/', createPatient);
router.get('/', getPatients);
router.get('/:patientId', getPatientById);
router.patch('/:patientId', updatePatient);
router.delete('/:patientId', deletePatient);

// Bulk endpoint
router.post('/bulk/by-ids', getPatientsByIds);

export default router;
