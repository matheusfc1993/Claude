import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import patientMetricsService from '../services/patient-metrics.service.js';

export async function getPatientMetrics(req: AuthRequest, res: Response) {
  try {
    const { clinicId, patientId } = req.params;

    const metrics = await patientMetricsService.getPatientMetrics(clinicId, patientId);
    res.json(metrics);
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function getAllPatientMetrics(req: AuthRequest, res: Response) {
  try {
    const { clinicId } = req.params;
    const { sortBy = 'revenue', limit = 100 } = req.query;

    const metrics = await patientMetricsService.getAllPatientMetrics(
      clinicId,
      (sortBy as 'revenue' | 'visits' | 'profitMargin') || 'revenue',
      parseInt(limit as string) || 100
    );

    res.json(metrics);
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function getPatientSegments(req: AuthRequest, res: Response) {
  try {
    const { clinicId } = req.params;

    const segments = await patientMetricsService.segmentPatients(clinicId);
    res.json(segments);
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function getRetentionMetrics(req: AuthRequest, res: Response) {
  try {
    const { clinicId } = req.params;

    const metrics = await patientMetricsService.getRetentionMetrics(clinicId);
    res.json(metrics);
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}
