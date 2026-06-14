import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createPatient(req: AuthRequest, res: Response) {
  try {
    const { clinicId } = req.params;
    const { name, email, phone, birthDate, document, address, notes } = req.body;

    const patient = await prisma.patient.create({
      data: {
        clinicId,
        name,
        email,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        document,
        address,
        notes,
      },
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function getPatients(req: AuthRequest, res: Response) {
  try {
    const { clinicId } = req.params;
    const { skip = 0, take = 50, search } = req.query;

    const where: any = { clinicId, isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
        { document: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip: parseInt(skip as string) || 0,
        take: parseInt(take as string) || 50,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patient.count({ where }),
    ]);

    res.json({ patients, total, skip, take });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function getPatientById(req: AuthRequest, res: Response) {
  try {
    const { clinicId, patientId } = req.params;

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId },
      include: {
        revenues: {
          select: {
            id: true,
            date: true,
            amount: true,
            service: { select: { name: true } },
          },
          orderBy: { date: 'desc' },
          take: 20,
        },
        appointments: {
          select: {
            id: true,
            date: true,
            status: true,
            service: { select: { name: true } },
          },
          orderBy: { date: 'desc' },
          take: 20,
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function updatePatient(req: AuthRequest, res: Response) {
  try {
    const { clinicId, patientId } = req.params;
    const { name, email, phone, birthDate, document, address, notes, isActive } = req.body;

    const patient = await prisma.patient.updateMany({
      where: { id: patientId, clinicId },
      data: {
        name,
        email,
        phone,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        document,
        address,
        notes,
        isActive,
      },
    });

    if (patient.count === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const updated = await prisma.patient.findUnique({ where: { id: patientId } });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function deletePatient(req: AuthRequest, res: Response) {
  try {
    const { clinicId, patientId } = req.params;

    // Soft delete
    const patient = await prisma.patient.updateMany({
      where: { id: patientId, clinicId },
      data: { isActive: false },
    });

    if (patient.count === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function getPatientsByIds(req: AuthRequest, res: Response) {
  try {
    const { clinicId } = req.params;
    const { ids } = req.body; // Array of patient IDs

    const patients = await prisma.patient.findMany({
      where: {
        id: { in: ids },
        clinicId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    res.json(patients);
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}
