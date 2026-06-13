import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth.js';
import { HTTPError } from '../middlewares/error.js';

const prisma = new PrismaClient();

const fixedExpenseSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  amount: z.string().or(z.number()).pipe(z.coerce.number()),
  dueDay: z.number().int().min(1).max(31),
});

const variableExpenseSchema = z.object({
  date: z.string().or(z.date()),
  category: z.string().min(1),
  description: z.string().optional(),
  amount: z.string().or(z.number()).pipe(z.coerce.number()),
  notes: z.string().optional(),
});

const revenueSchema = z.object({
  date: z.string().or(z.date()),
  professionalId: z.string(),
  serviceId: z.string().optional(),
  amount: z.string().or(z.number()).pipe(z.coerce.number()),
  patientName: z.string().optional(),
});

const professionalSchema = z.object({
  name: z.string().min(1),
  specialty: z.string().min(1),
  cpf: z.string().regex(/^\d{11}$/),
  salary: z.string().or(z.number()).pipe(z.coerce.number()),
  commissionsPercentage: z.number().default(0),
  prorLaborePercentage: z.number().default(0),
});

// Fixed Expenses
export async function createFixedExpense(req: AuthRequest, res: Response) {
  const body = fixedExpenseSchema.parse(req.body);
  const { clinicId } = req.params;

  const expense = await prisma.fixedExpense.create({
    data: {
      clinicId,
      name: body.name,
      category: body.category,
      amount: body.amount,
      dueDay: body.dueDay,
    },
  });

  res.status(201).json(expense);
}

export async function getFixedExpenses(req: AuthRequest, res: Response) {
  const { clinicId } = req.params;

  const expenses = await prisma.fixedExpense.findMany({
    where: {
      clinicId,
      isActive: true,
    },
    orderBy: { dueDay: 'asc' },
  });

  res.json(expenses);
}

export async function updateFixedExpense(req: AuthRequest, res: Response) {
  const body = fixedExpenseSchema.partial().parse(req.body);
  const { clinicId, id } = req.params;

  const expense = await prisma.fixedExpense.updateMany({
    where: { id, clinicId },
    data: body,
  });

  if (expense.count === 0) {
    throw new HTTPError(404, 'Expense not found');
  }

  res.json({ success: true });
}

export async function deleteFixedExpense(req: AuthRequest, res: Response) {
  const { clinicId, id } = req.params;

  await prisma.fixedExpense.updateMany({
    where: { id, clinicId },
    data: { isActive: false },
  });

  res.json({ success: true });
}

// Variable Expenses
export async function createVariableExpense(req: AuthRequest, res: Response) {
  const body = variableExpenseSchema.parse(req.body);
  const { clinicId } = req.params;

  const expense = await prisma.variableExpense.create({
    data: {
      clinicId,
      date: new Date(body.date),
      category: body.category,
      description: body.description || null,
      amount: body.amount,
      notes: body.notes || null,
    },
  });

  res.status(201).json(expense);
}

export async function getVariableExpenses(req: AuthRequest, res: Response) {
  const { clinicId } = req.params;
  const { startDate, endDate } = req.query;

  const where: any = { clinicId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  const expenses = await prisma.variableExpense.findMany({
    where,
    orderBy: { date: 'desc' },
  });

  res.json(expenses);
}

// Revenues
export async function createRevenue(req: AuthRequest, res: Response) {
  const body = revenueSchema.parse(req.body);
  const { clinicId } = req.params;

  const revenue = await prisma.revenue.create({
    data: {
      clinicId,
      date: new Date(body.date),
      professionalId: body.professionalId,
      serviceId: body.serviceId || null,
      amount: body.amount,
      patientName: body.patientName || null,
    },
  });

  res.status(201).json(revenue);
}

export async function getRevenues(req: AuthRequest, res: Response) {
  const { clinicId } = req.params;
  const { startDate, endDate } = req.query;

  const where: any = { clinicId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  const revenues = await prisma.revenue.findMany({
    where,
    include: { professional: true, service: true },
    orderBy: { date: 'desc' },
  });

  res.json(revenues);
}

// Professionals
export async function createProfessional(req: AuthRequest, res: Response) {
  const body = professionalSchema.parse(req.body);
  const { clinicId } = req.params;

  const professional = await prisma.professional.create({
    data: {
      clinicId,
      ...body,
    },
  });

  res.status(201).json(professional);
}

export async function getProfessionals(req: AuthRequest, res: Response) {
  const { clinicId } = req.params;

  const professionals = await prisma.professional.findMany({
    where: { clinicId, isActive: true },
    orderBy: { name: 'asc' },
  });

  res.json(professionals);
}

export async function updateProfessional(req: AuthRequest, res: Response) {
  const body = professionalSchema.partial().parse(req.body);
  const { clinicId, id } = req.params;

  const professional = await prisma.professional.updateMany({
    where: { id, clinicId },
    data: body,
  });

  if (professional.count === 0) {
    throw new HTTPError(404, 'Professional not found');
  }

  res.json({ success: true });
}
