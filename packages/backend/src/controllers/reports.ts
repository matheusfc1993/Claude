import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.js';

const prisma = new PrismaClient();

export async function getDailyReport(req: AuthRequest, res: Response) {
  const { clinicId } = req.params;
  const { date } = req.query;

  const where: any = { clinicId };

  if (date) {
    const reportDate = new Date(date as string);
    where.reportDate = {
      gte: new Date(reportDate.setHours(0, 0, 0, 0)),
      lt: new Date(reportDate.setHours(24, 0, 0, 0)),
    };
  } else {
    const today = new Date();
    where.reportDate = {
      gte: new Date(today.setHours(0, 0, 0, 0)),
      lt: new Date(today.setHours(24, 0, 0, 0)),
    };
  }

  const report = await prisma.executiveReport.findFirst({
    where,
    orderBy: { createdAt: 'desc' },
  });

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  res.json({
    ...report,
    metrics: JSON.parse(report.metrics),
  });
}

export async function getReportsHistory(req: AuthRequest, res: Response) {
  const { clinicId } = req.params;
  const { limit = 30 } = req.query;

  const reports = await prisma.executiveReport.findMany({
    where: { clinicId },
    orderBy: { reportDate: 'desc' },
    take: parseInt(limit as string),
  });

  res.json(
    reports.map((r) => ({
      ...r,
      metrics: JSON.parse(r.metrics),
    }))
  );
}

export async function getLatestReport(req: AuthRequest, res: Response) {
  const { clinicId } = req.params;

  const report = await prisma.executiveReport.findFirst({
    where: { clinicId },
    orderBy: { reportDate: 'desc' },
  });

  if (!report) {
    return res.status(404).json({ error: 'No reports found' });
  }

  res.json({
    ...report,
    metrics: JSON.parse(report.metrics),
  });
}
