import { Router } from 'express';
import {
  getAvailableBlocks,
  getBlocksForDateRange,
  getBlockStatistics,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getPatientAppointments,
  getAppointmentById,
} from '../controllers/time-blocks.js';
import { auth } from '../middlewares/auth.js';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(auth);

// Time block endpoints
router.get('/blocks/available', getAvailableBlocks);
router.get('/blocks/range', getBlocksForDateRange);
router.get('/blocks/statistics', getBlockStatistics);

// Appointment endpoints
router.post('/appointments', createAppointment);
router.get('/appointments/:appointmentId', getAppointmentById);
router.patch('/appointments/:appointmentId', updateAppointment);
router.delete('/appointments/:appointmentId', cancelAppointment);

// Patient appointments
router.get('/patients/:patientId/appointments', getPatientAppointments);

export default router;
