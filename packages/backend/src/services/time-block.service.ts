import { PrismaClient } from '@prisma/client';
import { addDays, eachDayOfInterval, getDay, format } from 'date-fns';

const prisma = new PrismaClient();

interface Block {
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
}

export class TimeBlockService {
  // Generates 50-minute blocks from 7:10 AM to 8:00 PM, Mon-Fri
  private generateDailyBlocks(): Block[] {
    const blocks: Block[] = [];
    const startMinutes = 7 * 60 + 10; // 7:10 AM in minutes
    const endMinutes = 20 * 60; // 8:00 PM in minutes
    const blockDuration = 50; // 50 minutes per block

    let currentStart = startMinutes;
    while (currentStart + blockDuration <= endMinutes) {
      const currentEnd = currentStart + blockDuration;
      blocks.push({
        startTime: this.minutesToTime(currentStart),
        endTime: this.minutesToTime(currentEnd),
        startMinutes: currentStart,
        endMinutes: currentEnd,
      });
      currentStart += blockDuration;
    }

    return blocks;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Generate available blocks for a given date and professional
  async generateBlocksForDate(
    clinicId: string,
    professionalId: string,
    date: Date
  ): Promise<void> {
    // Only generate blocks for Monday-Friday
    const dayOfWeek = getDay(date);
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return; // Skip Sunday (0) and Saturday (6)
    }

    const dailyBlocks = this.generateDailyBlocks();

    // Check if blocks already exist for this date/professional
    const existingBlockCount = await prisma.timeBlock.count({
      where: {
        clinicId,
        professionalId,
        date: {
          equals: new Date(date.toISOString().split('T')[0]),
        },
      },
    });

    if (existingBlockCount > 0) {
      return; // Blocks already exist
    }

    // Create all blocks for the day
    const blockData = dailyBlocks.map((block) => ({
      clinicId,
      professionalId,
      date: new Date(date.toISOString().split('T')[0]),
      startTime: block.startTime,
      endTime: block.endTime,
      isAvailable: true,
    }));

    await prisma.timeBlock.createMany({
      data: blockData,
      skipDuplicates: true,
    });
  }

  // Get available blocks for a date and professional
  async getAvailableBlocks(
    clinicId: string,
    professionalId: string,
    date: Date,
    includeUnavailable: boolean = false
  ): Promise<any[]> {
    // First, ensure blocks exist for this date
    await this.generateBlocksForDate(clinicId, professionalId, date);

    const query = {
      where: {
        clinicId,
        professionalId,
        date: {
          equals: new Date(date.toISOString().split('T')[0]),
        },
        ...(includeUnavailable ? {} : { isAvailable: true }),
      },
      orderBy: { startTime: 'asc' as const },
      include: {
        appointment: {
          select: {
            id: true,
            patient: { select: { name: true } },
          },
        },
      },
    };

    const blocks = await prisma.timeBlock.findMany(query);

    return blocks.map((block) => ({
      id: block.id,
      startTime: block.startTime,
      endTime: block.endTime,
      isAvailable: block.isAvailable,
      appointment: block.appointment,
      date: format(block.date, 'yyyy-MM-dd'),
    }));
  }

  // Get blocks for a date range and professional
  async getBlocksForDateRange(
    clinicId: string,
    professionalId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });

    // Generate blocks for all dates in range
    for (const date of datesInRange) {
      await this.generateBlocksForDate(clinicId, professionalId, date);
    }

    const blocks = await prisma.timeBlock.findMany({
      where: {
        clinicId,
        professionalId,
        date: {
          gte: new Date(startDate.toISOString().split('T')[0]),
          lte: new Date(endDate.toISOString().split('T')[0]),
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      include: {
        appointment: {
          select: {
            id: true,
            patient: { select: { name: true } },
          },
        },
      },
    });

    return blocks.map((block) => ({
      id: block.id,
      startTime: block.startTime,
      endTime: block.endTime,
      date: format(block.date, 'yyyy-MM-dd'),
      isAvailable: block.isAvailable,
      appointment: block.appointment,
    }));
  }

  // Mark a block as reserved by creating/linking an appointment
  async reserveBlock(blockId: string, appointmentId: string): Promise<void> {
    await prisma.timeBlock.update({
      where: { id: blockId },
      data: {
        isAvailable: false,
        appointmentId,
      },
    });
  }

  // Release a block (cancel appointment)
  async releaseBlock(blockId: string): Promise<void> {
    await prisma.timeBlock.update({
      where: { id: blockId },
      data: {
        isAvailable: true,
        appointmentId: null,
      },
    });
  }

  // Get blocks by appointment
  async getBlocksByAppointment(appointmentId: string): Promise<any> {
    return prisma.timeBlock.findFirst({
      where: { appointmentId },
      include: {
        appointment: true,
      },
    });
  }

  // Get statistics about block usage
  async getBlockStatistics(clinicId: string, professionalId: string, date: Date): Promise<any> {
    const blocks = await prisma.timeBlock.findMany({
      where: {
        clinicId,
        professionalId,
        date: {
          equals: new Date(date.toISOString().split('T')[0]),
        },
      },
    });

    const totalBlocks = blocks.length;
    const availableBlocks = blocks.filter((b) => b.isAvailable).length;
    const reservedBlocks = totalBlocks - availableBlocks;

    return {
      totalBlocks,
      availableBlocks,
      reservedBlocks,
      occupancyRate: totalBlocks > 0 ? (reservedBlocks / totalBlocks) * 100 : 0,
    };
  }
}

export default new TimeBlockService();
