import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { HTTPError } from '../middlewares/error.js';

const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  clinicName: z.string().min(2),
  clinicCnpj: z.string().regex(/^\d{14}$/),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function register(req: Request, res: Response) {
  const body = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingUser) {
    throw new HTTPError(409, 'Email already registered');
  }

  const hashedPassword = await bcryptjs.hash(body.password, 10);

  const clinic = await prisma.clinic.create({
    data: {
      name: body.clinicName,
      cnpj: body.clinicCnpj,
    },
  });

  const user = await prisma.user.create({
    data: {
      clinicId: clinic.id,
      email: body.email,
      password: hashedPassword,
      name: body.name,
      role: 'ADMIN',
    },
  });

  const token = jwt.sign(
    {
      id: user.id,
      clinicId: clinic.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: process.env.JWT_EXPIRATION || '24h' }
  );

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      clinic: {
        id: clinic.id,
        name: clinic.name,
      },
    },
    token,
  });
}

export async function login(req: Request, res: Response) {
  const body = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: body.email },
    include: { clinic: true },
  });

  if (!user) {
    throw new HTTPError(401, 'Invalid credentials');
  }

  const validPassword = await bcryptjs.compare(body.password, user.password);

  if (!validPassword) {
    throw new HTTPError(401, 'Invalid credentials');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const token = jwt.sign(
    {
      id: user.id,
      clinicId: user.clinicId,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: process.env.JWT_EXPIRATION || '24h' }
  );

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clinic: {
        id: user.clinic.id,
        name: user.clinic.name,
      },
    },
    token,
  });
}
