import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import metricsService from '../services/metrics.service.js';

export async function getDashboardMetrics(req: AuthRequest, res: Response) {
  const { clinicId } = req.params;
  const metrics = await metricsService.getDashboardMetrics(clinicId);
  res.json(metrics);
}

export async function getMonthlyTrend(req: AuthRequest, res: Response) {
  const { clinicId } = req.params;
  const { months = 12 } = req.query;
  const trend = await metricsService.getMonthlyTrend(clinicId, parseInt(months as string));
  res.json(trend);
}

export async function getRevenueByService(req: AuthRequest, res: Response) {
  const { clinicId } = req.params;
  const { days = 30 } = req.query;
  const data = await metricsService.getRevenueByService(clinicId, parseInt(days as string));
  res.json(data);
}

export async function getProfessionalMetrics(req: AuthRequest, res: Response) {
  const { clinicId } = req.params;
  const { days = 30 } = req.query;
  const data = await metricsService.getProfessionalMetrics(clinicId, parseInt(days as string));
  res.json(data);
}

export async function getExpenseBreakdown(req: AuthRequest, res: Response) {
  const { clinicId } = req.params;
  const { days = 30 } = req.query;
  const data = await metricsService.getExpenseBreakdown(clinicId, parseInt(days as string));
  res.json(data);
}

export async function getKPISummary(req: AuthRequest, res: Response) {
  const { clinicId } = req.params;
  const { days = 30 } = req.query;
  const data = await metricsService.getKPISummary(clinicId, parseInt(days as string));
  res.json(data);
}
