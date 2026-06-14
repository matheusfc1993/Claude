import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import timeBlockService from '../services/time-block.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAvailableBlocks(req: AuthRequest, res: Response) {
  try {
    const { clinicId } = req.params;
    const { date, professionalId } = req.query;

    if (!date || !professionalId) {
      return res.status(400).json({ error: 'date and professionalId are required' });
    }

    const blockDate = new Date(date as string);
    const blocks = await timeBlockService.getAvailableBlocks(
      clinicId,
      professionalId as string,
      blockDate,
      false
    );

    res.json({ blocks, date: blockDate.toISOString().split('T')[0] });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function getBlocksForDateRange(req: AuthRequest, res: Response) {
  try {
    const { clinicId } = req.params;
    const { startDate, endDate, professionalId } = req.query;

    if (!startDate || !endDate || !professionalId) {
      return res.status(400).json({ error: 'startDate, endDate, and professionalId are required' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const blocks = await timeBlockService.getBlocksForDateRange(
      clinicId,
      professionalId as string,
      start,
      end
    );

    res.json({ blocks, startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function getBlockStatistics(req: AuthRequest, res: Response) {
  try {
    const { clinicId } = req.params;
    const { date, professionalId } = req.query;

    if (!date || !professionalId) {
      return res.status(400).json({ error: 'date and professionalId are required' });
    }

    const blockDate = new Date(date as string);
    const stats = await timeBlockService.getBlockStatistics(
      clinicId,
      professionalId as string,
      blockDate
    );

    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function createAppointment(req: AuthRequest, res: Response) {
  try {
    const { clinicId } = req.params;
    const { patientId, professionalId, serviceId, timeBlockId, date, notes } = req.body;

    if (!patientId || !professionalId || !date) {
      return res.status(400).json({ error: 'patientId, professionalId, and date are required' });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        clinicId,
        patientId,
        professionalId,
        serviceId,
        timeBlockId,
        date: new Date(date),
        status: 'SCHEDULED',
        notes,
      },
      include: {
        patient: { select: { name: true } },
        professional: { select: { name: true } },
        service: { select: { name: true, defaultPrice: true } },
        timeBlock: { select: { startTime: true, endTime: true } },
      },
    });

    // Mark block as reserved if provided
    if (timeBlockId) {
      await timeBlockService.reserveBlock(timeBlockId, appointment.id);
    }

    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function updateAppointment(req: AuthRequest, res: Response) {
  try {
    const { clinicId, appointmentId } = req.params;
    const { status, notes, serviceId, newTimeBlockId } = req.body;

    const currentAppointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, clinicId },
      select: { timeBlockId: true },
    });

    if (!currentAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Release old block
    if (currentAppointment.timeBlockId) {
      await timeBlockService.releaseBlock(currentAppointment.timeBlockId);
    }

    // Reserve new block
    if (newTimeBlockId) {
      await timeBlockService.reserveBlock(newTimeBlockId, appointmentId);
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
        notes,
        serviceId,
        timeBlockId: newTimeBlockId,
      },
      include: {
        patient: { select: { name: true } },
        professional: { select: { name: true } },
        service: { select: { name: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function cancelAppointment(req: AuthRequest, res: Response) {
  try {
    const { clinicId, appointmentId } = req.params;

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, clinicId },
      select: { timeBlockId: true },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Release block
    if (appointment.timeBlockId) {
      await timeBlockService.releaseBlock(appointment.timeBlockId);
    }

    const cancelled = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
    });

    res.json(cancelled);
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function getPatientAppointments(req: AuthRequest, res: Response) {
  try {
    const { clinicId, patientId } = req.params;
    const { status = 'SCHEDULED', limit = 50 } = req.query;

    const appointments = await prisma.appointment.findMany({
      where: {
        clinicId,
        patientId,
        ...(status && { status: status as string }),
      },
      include: {
        professional: { select: { name: true } },
        service: { select: { name: true } },
        timeBlock: { select: { startTime: true, endTime: true } },
      },
      orderBy: { date: 'desc' },
      take: parseInt(limit as string) || 50,
    });

    res.json(appointments);
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function getAppointmentById(req: AuthRequest, res: Response) {
  try {
    const { clinicId, appointmentId } = req.params;

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, clinicId },
      include: {
        patient: true,
        professional: true,
        service: true,
        timeBlock: true,
        revenues: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}
