import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✓';
    console.log(`${statusColor} ${req.method} ${req.path} ${status} ${duration}ms`);
  });

  next();
}
