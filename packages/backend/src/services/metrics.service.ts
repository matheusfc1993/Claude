import { PrismaClient, Clinic } from '@prisma/client';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths } from 'date-fns';

const prisma = new PrismaClient();

export interface MetricsData {
  period: string;
  revenue: {
    total: number;
    count: number;
    average: number;
  };
  expenses: {
    fixed: number;
    variable: number;
    total: number;
  };
  netIncome: number;
  profitMargin: number;
  cashFlow: number;
}

export interface DashboardMetrics extends MetricsData {
  comparison: {
    revenueChange: number;
    expenseChange: number;
    profitChange: number;
  };
}

export class MetricsService {
  async getDashboardMetrics(clinicId: string): Promise<DashboardMetrics> {
    const today = new Date();
    const currentMonthStart = startOfMonth(today);
    const currentMonthEnd = endOfMonth(today);
    const previousMonthStart = startOfMonth(subMonths(today, 1));
    const previousMonthEnd = endOfMonth(subMonths(today, 1));

    // Current month metrics
    const currentMetrics = await this.calculateMetrics(
      clinicId,
      currentMonthStart,
      currentMonthEnd
    );

    // Previous month metrics for comparison
    const previousMetrics = await this.calculateMetrics(
      clinicId,
      previousMonthStart,
      previousMonthEnd
    );

    // Calculate percentage changes
    const revenueChange = this.calculateChange(
      previousMetrics.revenue.total,
      currentMetrics.revenue.total
    );

    const expenseChange = this.calculateChange(
      previousMetrics.expenses.total,
      currentMetrics.expenses.total
    );

    const profitChange = this.calculateChange(
      previousMetrics.netIncome,
      currentMetrics.netIncome
    );

    return {
      ...currentMetrics,
      comparison: {
        revenueChange,
        expenseChange,
        profitChange,
      },
    };
  }

  async getMonthlyTrend(clinicId: string, months: number = 12): Promise<MetricsData[]> {
    const result: MetricsData[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(today, i));
      const monthEnd = endOfMonth(subMonths(today, i));

      const metrics = await this.calculateMetrics(clinicId, monthStart, monthEnd);
      result.push(metrics);
    }

    return result;
  }

  async getRevenueByService(clinicId: string, days: number = 30): Promise<any[]> {
    const startDate = subDays(new Date(), days);

    const revenues = await prisma.revenue.groupBy({
      by: ['serviceId'],
      where: {
        clinicId,
        date: { gte: startDate },
      },
      _sum: { amount: true },
      _count: true,
    });

    const enriched = await Promise.all(
      revenues.map(async (rev) => {
        if (!rev.serviceId) {
          return {
            serviceId: null,
            serviceName: 'Without Service',
            revenue: rev._sum.amount || 0,
            count: rev._count,
          };
        }

        const service = await prisma.service.findUnique({
          where: { id: rev.serviceId },
          select: { name: true },
        });

        return {
          serviceId: rev.serviceId,
          serviceName: service?.name || 'Unknown',
          revenue: rev._sum.amount || 0,
          count: rev._count,
        };
      })
    );

    return enriched.sort((a, b) => Number(b.revenue) - Number(a.revenue));
  }

  async getProfessionalMetrics(clinicId: string, days: number = 30): Promise<any[]> {
    const startDate = subDays(new Date(), days);

    const professionals = await prisma.professional.findMany({
      where: { clinicId, isActive: true },
      select: { id: true, name: true },
    });

    const metrics = await Promise.all(
      professionals.map(async (prof) => {
        const revenues = await prisma.revenue.aggregate({
          where: {
            clinicId,
            professionalId: prof.id,
            date: { gte: startDate },
          },
          _sum: { amount: true },
          _count: true,
        });

        return {
          professionalId: prof.id,
          name: prof.name,
          totalRevenue: revenues._sum.amount || 0,
          appointmentCount: revenues._count,
          averageRevenue:
            revenues._count > 0
              ? Number((Number(revenues._sum.amount || 0) / revenues._count).toFixed(2))
              : 0,
        };
      })
    );

    return metrics.sort((a, b) => Number(b.totalRevenue) - Number(a.totalRevenue));
  }

  async getExpenseBreakdown(clinicId: string, days: number = 30): Promise<any[]> {
    const startDate = subDays(new Date(), days);

    const expenses = await prisma.variableExpense.groupBy({
      by: ['category'],
      where: {
        clinicId,
        date: { gte: startDate },
      },
      _sum: { amount: true },
      _count: true,
    });

    const fixedExpenses = await prisma.fixedExpense.aggregate({
      where: { clinicId, isActive: true },
      _sum: { amount: true },
    });

    const breakdown = [
      ...expenses.map((exp) => ({
        category: exp.category,
        amount: exp._sum.amount || 0,
        count: exp._count,
        type: 'variable',
      })),
      {
        category: 'Fixed Expenses (Monthly)',
        amount: fixedExpenses._sum.amount || 0,
        count: 1,
        type: 'fixed',
      },
    ];

    return breakdown.sort((a, b) => Number(b.amount) - Number(a.amount));
  }

  async getKPISummary(clinicId: string, days: number = 30): Promise<any> {
    const startDate = subDays(new Date(), days);

    const [revenues, allExpenses, professionals] = await Promise.all([
      prisma.revenue.aggregate({
        where: { clinicId, date: { gte: startDate } },
        _sum: { amount: true },
        _count: true,
      }),
      this.calculateExpenses(clinicId, startDate, new Date()),
      prisma.professional.count({ where: { clinicId, isActive: true } }),
    ]);

    const totalRevenue = Number(revenues._sum.amount || 0);
    const totalExpenses = allExpenses;
    const netIncome = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    return {
      period: `Last ${days} days`,
      revenue: totalRevenue,
      expenses: totalExpenses,
      netIncome,
      profitMargin: Number(profitMargin.toFixed(2)),
      appointmentCount: revenues._count,
      activeStaff: professionals,
    };
  }

  // Private helper methods

  private async calculateMetrics(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MetricsData> {
    const [revenues, fixedExpenses, variableExpenses] = await Promise.all([
      prisma.revenue.aggregate({
        where: {
          clinicId,
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.fixedExpense.aggregate({
        where: { clinicId, isActive: true },
        _sum: { amount: true },
      }),
      prisma.variableExpense.aggregate({
        where: {
          clinicId,
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = Number(revenues._sum.amount || 0);
    const totalFixed = Number(fixedExpenses._sum.amount || 0);
    const totalVariable = Number(variableExpenses._sum.amount || 0);
    const totalExpenses = totalFixed + totalVariable;
    const netIncome = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    return {
      period: startDate.toISOString().split('T')[0],
      revenue: {
        total: totalRevenue,
        count: revenues._count,
        average: revenues._count > 0 ? totalRevenue / revenues._count : 0,
      },
      expenses: {
        fixed: totalFixed,
        variable: totalVariable,
        total: totalExpenses,
      },
      netIncome,
      profitMargin: Number(profitMargin.toFixed(2)),
      cashFlow: totalRevenue - totalExpenses,
    };
  }

  private async calculateExpenses(clinicId: string, startDate: Date, endDate: Date): Promise<number> {
    const [fixed, variable] = await Promise.all([
      prisma.fixedExpense.aggregate({
        where: { clinicId, isActive: true },
        _sum: { amount: true },
      }),
      prisma.variableExpense.aggregate({
        where: {
          clinicId,
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
    ]);

    return Number(fixed._sum.amount || 0) + Number(variable._sum.amount || 0);
  }

  private calculateChange(previous: number, current: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(2));
  }
}

export default new MetricsService();
