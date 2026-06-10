import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const sheets = google.sheets('v4');

export class GoogleSheetsService {
  private getAuthClient(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/google/callback`
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    return oauth2Client;
  }

  async importExpenses(
    clinicId: string,
    spreadsheetId: string,
    sheetName: string,
    accessToken: string
  ) {
    try {
      const authClient = this.getAuthClient(accessToken);

      const response = await sheets.spreadsheets.values.get({
        auth: authClient,
        spreadsheetId,
        range: sheetName,
      });

      const rows = response.data.values || [];
      if (rows.length < 2) return { imported: 0, error: null };

      const headers = rows[0];
      const nameIdx = headers.findIndex((h: string) => h.toLowerCase().includes('name'));
      const categoryIdx = headers.findIndex((h: string) => h.toLowerCase().includes('category'));
      const amountIdx = headers.findIndex((h: string) => h.toLowerCase().includes('amount'));
      const dueDayIdx = headers.findIndex((h: string) => h.toLowerCase().includes('due'));

      let imported = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[nameIdx] || !row[amountIdx]) continue;

        try {
          await prisma.fixedExpense.create({
            data: {
              clinicId,
              name: row[nameIdx],
              category: row[categoryIdx] || 'other',
              amount: parseFloat(row[amountIdx]),
              dueDay: dueDayIdx >= 0 ? parseInt(row[dueDayIdx]) : 15,
            },
          });
          imported++;
        } catch (error) {
          console.error(`Error importing row ${i}:`, error);
        }
      }

      return { imported, error: null };
    } catch (error: any) {
      return { imported: 0, error: error.message };
    }
  }

  async importRevenues(
    clinicId: string,
    spreadsheetId: string,
    sheetName: string,
    accessToken: string
  ) {
    try {
      const authClient = this.getAuthClient(accessToken);

      const response = await sheets.spreadsheets.values.get({
        auth: authClient,
        spreadsheetId,
        range: sheetName,
      });

      const rows = response.data.values || [];
      if (rows.length < 2) return { imported: 0, error: null };

      const headers = rows[0];
      const dateIdx = headers.findIndex((h: string) => h.toLowerCase().includes('date'));
      const amountIdx = headers.findIndex((h: string) => h.toLowerCase().includes('amount'));
      const professionalIdx = headers.findIndex(
        (h: string) => h.toLowerCase().includes('professional')
      );

      const professionals = await prisma.professional.findMany({
        where: { clinicId },
      });

      let imported = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[amountIdx]) continue;

        try {
          const professionalName = row[professionalIdx] || 'Unknown';
          const professional =
            professionals.find(
              (p) => p.name.toLowerCase() === professionalName.toLowerCase()
            ) || professionals[0];

          if (!professional) continue;

          await prisma.revenue.create({
            data: {
              clinicId,
              date: new Date(row[dateIdx] || new Date()),
              professionalId: professional.id,
              amount: parseFloat(row[amountIdx]),
              patientName: row[professionalIdx] ? undefined : 'Imported',
            },
          });
          imported++;
        } catch (error) {
          console.error(`Error importing revenue row ${i}:`, error);
        }
      }

      return { imported, error: null };
    } catch (error: any) {
      return { imported: 0, error: error.message };
    }
  }

  async exportMetrics(
    clinicId: string,
    spreadsheetId: string,
    sheetName: string,
    accessToken: string,
    metrics: any
  ) {
    try {
      const authClient = this.getAuthClient(accessToken);

      const data = [
        ['Metric', 'Value'],
        ['Revenue', metrics.revenue],
        ['Expenses', metrics.expenses],
        ['Net Income', metrics.netIncome],
        ['Profit Margin %', metrics.profitMargin],
        ['Date', new Date().toLocaleDateString('pt-BR')],
      ];

      const response = await sheets.spreadsheets.values.update({
        auth: authClient,
        spreadsheetId,
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: data,
        },
      });

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async testConnection(accessToken: string): Promise<boolean> {
    try {
      const authClient = this.getAuthClient(accessToken);
      const response = await sheets.spreadsheets.get({
        auth: authClient,
        spreadsheetId: 'test',
      });
      return false; // If it doesn't error, connection works
    } catch (error: any) {
      // Expected to fail with invalid sheet ID, but proves auth works
      return error.message.includes('404') || error.message.includes('not found');
    }
  }
}

export default new GoogleSheetsService();
