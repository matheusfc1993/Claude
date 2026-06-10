import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import googleSheetsService from '../services/google-sheets.service.js';
import { z } from 'zod';
import { HTTPError } from '../middlewares/error.js';

const importSchema = z.object({
  spreadsheetId: z.string(),
  sheetName: z.string(),
  accessToken: z.string(),
  dataType: z.enum(['expenses', 'revenues']),
});

const exportSchema = z.object({
  spreadsheetId: z.string(),
  sheetName: z.string(),
  accessToken: z.string(),
});

export async function importData(req: AuthRequest, res: Response) {
  const body = importSchema.parse(req.body);
  const { clinicId } = req.params;

  if (body.dataType === 'expenses') {
    const result = await googleSheetsService.importExpenses(
      clinicId,
      body.spreadsheetId,
      body.sheetName,
      body.accessToken
    );

    if (result.error) {
      throw new HTTPError(400, `Import failed: ${result.error}`);
    }

    res.json({
      success: true,
      imported: result.imported,
      message: `Successfully imported ${result.imported} expenses`,
    });
  } else if (body.dataType === 'revenues') {
    const result = await googleSheetsService.importRevenues(
      clinicId,
      body.spreadsheetId,
      body.sheetName,
      body.accessToken
    );

    if (result.error) {
      throw new HTTPError(400, `Import failed: ${result.error}`);
    }

    res.json({
      success: true,
      imported: result.imported,
      message: `Successfully imported ${result.imported} revenues`,
    });
  }
}

export async function exportMetrics(req: AuthRequest, res: Response) {
  const body = exportSchema.parse(req.body);
  const { clinicId } = req.params;

  // Get latest metrics
  const metricsResponse = await fetch(
    `http://localhost:${process.env.PORT || 3000}/api/metrics/${clinicId}/summary`,
    {
      headers: {
        Authorization: req.headers.authorization || '',
      },
    }
  );

  if (!metricsResponse.ok) {
    throw new HTTPError(500, 'Failed to fetch metrics');
  }

  const metrics = await metricsResponse.json();

  const result = await googleSheetsService.exportMetrics(
    clinicId,
    body.spreadsheetId,
    body.sheetName,
    body.accessToken,
    metrics
  );

  if (!result.success) {
    throw new HTTPError(400, `Export failed: ${result.error}`);
  }

  res.json({
    success: true,
    message: 'Successfully exported metrics to Google Sheets',
  });
}

export async function testConnection(req: AuthRequest, res: Response) {
  const { accessToken } = req.body;

  if (!accessToken) {
    throw new HTTPError(400, 'Access token is required');
  }

  const isValid = await googleSheetsService.testConnection(accessToken);

  res.json({
    valid: isValid,
    message: isValid ? 'Connection successful' : 'Connection failed',
  });
}
