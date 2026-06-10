import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HTTPError } from './error.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    clinicId: string;
    email: string;
    role: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPError(401, 'Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET || 'default-secret';

  try {
    const decoded = jwt.verify(token, secret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    throw new HTTPError(401, 'Invalid or expired token');
  }
}

export function clinicAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const clinicId = req.params.clinicId;

  if (!req.user) {
    throw new HTTPError(401, 'Not authenticated');
  }

  if (req.user.clinicId !== clinicId && req.user.role !== 'ADMIN') {
    throw new HTTPError(403, 'Insufficient permissions');
  }

  next();
}

export function authorize(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new HTTPError(401, 'Not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new HTTPError(403, 'Insufficient permissions');
    }

    next();
  };
}
