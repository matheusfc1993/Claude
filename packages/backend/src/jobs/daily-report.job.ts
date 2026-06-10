import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import aiAssistantService from '../services/ai-assistant.service.js';

const prisma = new PrismaClient();

export function initializeDailyReportJob() {
  // Schedule for 20:00 (8 PM) every day (Monday-Friday)
  // Format: minute hour day-of-month month day-of-week
  // 0 20 * * 1-5 = 20:00 weekdays
  cron.schedule('0 20 * * 1-5', async () => {
    console.log('[CRON] Starting daily report generation...');

    try {
      // Get all active clinics
      const clinics = await prisma.clinic.findMany();

      for (const clinic of clinics) {
        try {
          console.log(`[REPORT] Generating report for clinic: ${clinic.name}`);

          // Generate report
          const report = await aiAssistantService.generateDailyReport(clinic.id);

          console.log(
            `[REPORT] ✓ Report generated for ${clinic.name}: ${report.id}`
          );

          // Log execution
          await logScheduledTask(clinic.id, 'DAILY_REPORT', 'SUCCESS', null);
        } catch (error: any) {
          console.error(
            `[REPORT] ✗ Failed to generate report for ${clinic.name}:`,
            error.message
          );

          await logScheduledTask(
            clinic.id,
            'DAILY_REPORT',
            'FAILED',
            error.message
          );
        }
      }

      console.log('[CRON] Daily report generation completed');
    } catch (error: any) {
      console.error('[CRON] Failed to start daily report job:', error.message);
    }
  });

  console.log('✓ Daily report job scheduled for 20:00 (weekdays)');
}

async function logScheduledTask(
  clinicId: string,
  taskType: string,
  status: string,
  errorMessage: string | null
) {
  // Could be implemented to track job execution
  // For now, just logging to console
  console.log(
    `[LOG] Clinic: ${clinicId} | Task: ${taskType} | Status: ${status}`,
    errorMessage ? `| Error: ${errorMessage}` : ''
  );
}

// Additional scheduled jobs can be added here

export function initializeAllScheduledJobs() {
  console.log('Initializing scheduled jobs...');
  initializeDailyReportJob();
  console.log('All scheduled jobs initialized ✓');
}
