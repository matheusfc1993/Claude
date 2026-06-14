import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, subMonths, subDays } from 'date-fns';

const prisma = new PrismaClient();

export interface PatientMetrics {
  patientInfo: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    lastVisit?: Date;
  };
  revenue: {
    totalSpent: number;
    visitCount: number;
    averagePerVisit: number;
    totalByService: Array<{
      serviceName: string;
      total: number;
      count: number;
    }>;
    monthlyTrend: Array<{
      month: string;
      total: number;
      count: number;
    }>;
  };
  expenses: {
    attributable: number;
    totalInvested: number;
  };
  profitMargin: number;
  appointmentHistory: Array<{
    id: string;
    date: Date;
    serviceName?: string;
    professionalName: string;
    amount: number;
    status: string;
  }>;
}

export interface PatientSegment {
  segment: string;
  count: number;
  percentOfTotal: number;
  avgRevenuePerPatient: number;
}

export class PatientMetricsService {
  // Get comprehensive metrics for a single patient
  async getPatientMetrics(clinicId: string, patientId: string): Promise<PatientMetrics> {
    // Get patient basic info
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!patient) {
      throw new Error(`Patient ${patientId} not found`);
    }

    // Get last visit
    const lastAppointment = await prisma.appointment.findFirst({
      where: {
        clinicId,
        patientId,
        status: 'COMPLETED',
      },
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    // Get all revenues for this patient
    const revenues = await prisma.revenue.findMany({
      where: { clinicId, patientId },
      include: {
        service: { select: { name: true } },
        appointment: {
          select: {
            status: true,
            professional: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate totals
    const totalSpent = revenues.reduce((sum, r) => sum + Number(r.amount), 0);
    const visitCount = revenues.length;
    const averagePerVisit = visitCount > 0 ? totalSpent / visitCount : 0;

    // Revenue by service
    const revenueByService = await this.calculateRevenueByService(clinicId, patientId);

    // Monthly trend (last 12 months)
    const monthlyTrend = await this.calculateMonthlyTrend(clinicId, patientId, 12);

    // Attributable expenses (simplified: use service cost)
    const attributableExpenses = await this.calculateAttributableExpenses(revenues);

    // Profit margin
    const profitMargin = totalSpent > 0 ? ((totalSpent - attributableExpenses) / totalSpent) * 100 : 0;

    // Appointment history
    const appointmentHistory = revenues.map((r) => ({
      id: r.id,
      date: r.date,
      serviceName: r.service?.name,
      professionalName: r.appointment?.professional?.name || 'Unknown',
      amount: Number(r.amount),
      status: r.appointment?.status || 'UNKNOWN',
    }));

    return {
      patientInfo: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        lastVisit: lastAppointment?.date,
      },
      revenue: {
        totalSpent,
        visitCount,
        averagePerVisit: Number(averagePerVisit.toFixed(2)),
        totalByService: revenueByService,
        monthlyTrend,
      },
      expenses: {
        attributable: attributableExpenses,
        totalInvested: attributableExpenses,
      },
      profitMargin: Number(profitMargin.toFixed(2)),
      appointmentHistory,
    };
  }

  // Get all patients with their metrics
  async getAllPatientMetrics(
    clinicId: string,
    sortBy: 'revenue' | 'visits' | 'profitMargin' = 'revenue',
    limit: number = 100
  ): Promise<any[]> {
    const patients = await prisma.patient.findMany({
      where: { clinicId, isActive: true },
      select: { id: true },
    });

    const metricsData: any[] = [];

    for (const patient of patients) {
      try {
        const metrics = await this.getPatientMetrics(clinicId, patient.id);
        metricsData.push({
          patientId: metrics.patientInfo.id,
          name: metrics.patientInfo.name,
          email: metrics.patientInfo.email,
          phone: metrics.patientInfo.phone,
          totalRevenue: metrics.revenue.totalSpent,
          visitCount: metrics.revenue.visitCount,
          averagePerVisit: metrics.revenue.averagePerVisit,
          profitMargin: metrics.profitMargin,
          lastVisit: metrics.patientInfo.lastVisit,
        });
      } catch (error) {
        // Skip patients with errors
        continue;
      }
    }

    // Sort by requested field
    switch (sortBy) {
      case 'visits':
        metricsData.sort((a, b) => b.visitCount - a.visitCount);
        break;
      case 'profitMargin':
        metricsData.sort((a, b) => b.profitMargin - a.profitMargin);
        break;
      case 'revenue':
      default:
        metricsData.sort((a, b) => b.totalRevenue - a.totalRevenue);
    }

    return metricsData.slice(0, limit);
  }

  // Segment patients by value and engagement
  async segmentPatients(clinicId: string): Promise<PatientSegment[]> {
    const allPatients = await this.getAllPatientMetrics(clinicId, 'revenue', 1000);

    if (allPatients.length === 0) {
      return [];
    }

    const totalRevenue = allPatients.reduce((sum, p) => sum + p.totalRevenue, 0);
    const avgRevenue = totalRevenue / allPatients.length;

    // Define segments
    const highValuePatients = allPatients.filter((p) => p.totalRevenue > avgRevenue * 1.5);
    const mediumValuePatients = allPatients.filter(
      (p) => p.totalRevenue > avgRevenue * 0.5 && p.totalRevenue <= avgRevenue * 1.5
    );
    const lowValuePatients = allPatients.filter((p) => p.totalRevenue <= avgRevenue * 0.5);

    const segments: PatientSegment[] = [
      {
        segment: 'High Value',
        count: highValuePatients.length,
        percentOfTotal: (highValuePatients.length / allPatients.length) * 100,
        avgRevenuePerPatient:
          highValuePatients.length > 0
            ? highValuePatients.reduce((sum, p) => sum + p.totalRevenue, 0) / highValuePatients.length
            : 0,
      },
      {
        segment: 'Medium Value',
        count: mediumValuePatients.length,
        percentOfTotal: (mediumValuePatients.length / allPatients.length) * 100,
        avgRevenuePerPatient:
          mediumValuePatients.length > 0
            ? mediumValuePatients.reduce((sum, p) => sum + p.totalRevenue, 0) / mediumValuePatients.length
            : 0,
      },
      {
        segment: 'Low Value',
        count: lowValuePatients.length,
        percentOfTotal: (lowValuePatients.length / allPatients.length) * 100,
        avgRevenuePerPatient:
          lowValuePatients.length > 0
            ? lowValuePatients.reduce((sum, p) => sum + p.totalRevenue, 0) / lowValuePatients.length
            : 0,
      },
    ];

    return segments;
  }

  // Calculate patient retention metrics
  async getRetentionMetrics(clinicId: string): Promise<any> {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const sixtyDaysAgo = subDays(today, 60);

    // Patients active in last 30 days
    const activeLastMonth = await prisma.appointment.groupBy({
      by: ['patientId'],
      where: {
        clinicId,
        date: { gte: thirtyDaysAgo },
        status: 'COMPLETED',
      },
    });

    // Patients active in 30-60 days (churning)
    const churnRisk = await prisma.appointment.groupBy({
      by: ['patientId'],
      where: {
        clinicId,
        date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        status: 'COMPLETED',
      },
    });

    // New patients (first visit in last 30 days)
    const newPatients = await prisma.patient.findMany({
      where: {
        clinicId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { id: true },
    });

    return {
      activeLastMonth: activeLastMonth.length,
      churnRisk: churnRisk.length,
      newPatients: newPatients.length,
      churnRate: activeLastMonth.length > 0 ? (churnRisk.length / activeLastMonth.length) * 100 : 0,
    };
  }

  // Private helper methods

  private async calculateRevenueByService(
    clinicId: string,
    patientId: string
  ): Promise<Array<{ serviceName: string; total: number; count: number }>> {
    const revenues = await prisma.revenue.groupBy({
      by: ['serviceId'],
      where: { clinicId, patientId },
      _sum: { amount: true },
      _count: true,
    });

    const result = await Promise.all(
      revenues.map(async (rev) => {
        let serviceName = 'Without Service';
        if (rev.serviceId) {
          const service = await prisma.service.findUnique({
            where: { id: rev.serviceId },
            select: { name: true },
          });
          serviceName = service?.name || 'Unknown';
        }

        return {
          serviceName,
          total: Number(rev._sum.amount || 0),
          count: rev._count,
        };
      })
    );

    return result.sort((a, b) => b.total - a.total);
  }

  private async calculateMonthlyTrend(
    clinicId: string,
    patientId: string,
    months: number = 12
  ): Promise<Array<{ month: string; total: number; count: number }>> {
    const trend = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(today, i));
      const monthEnd = endOfMonth(subMonths(today, i));

      const revenues = await prisma.revenue.aggregate({
        where: {
          clinicId,
          patientId,
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
        _count: true,
      });

      trend.push({
        month: monthStart.toISOString().substring(0, 7), // YYYY-MM format
        total: Number(revenues._sum.amount || 0),
        count: revenues._count,
      });
    }

    return trend;
  }

  private async calculateAttributableExpenses(revenues: any[]): Promise<number> {
    // Simplified calculation: 20% of revenue (can be customized per clinic)
    const totalRevenue = revenues.reduce((sum, r) => sum + Number(r.amount), 0);
    return totalRevenue * 0.2; // 20% as default cost ratio
  }
}

export default new PatientMetricsService();
