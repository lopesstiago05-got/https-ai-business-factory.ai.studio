import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { adminAuth } from './firebase-admin.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'FACTORY_SUPER_SECRET_KEY_2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

// Extende a interface Request do Express para incluir os dados do usuário autenticado
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// Middleware para validar autenticação via JWT Bearer Token (Provedor Híbrido: Firebase Auth ou Local JWT)
export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação ausente ou inválido.' });
  }

  const token = authHeader.split(' ')[1];

  // 1. Tenta validar via Firebase Auth
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      userId: decodedToken.uid,
      email: decodedToken.email || '',
      role: (decodedToken as any).role || 'admin',
    };
    return next();
  } catch (fbErr) {
    // 2. Se falhar, tenta validar via JWT Local
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      return next();
    } catch (jwtErr) {
      return res.status(403).json({ error: 'Acesso negado. Token de autenticação expirado ou inválido.' });
    }
  }
}

// Middleware de autorização baseado em papéis (roles)
export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso proibido. Você não possui as permissões necessárias.' });
    }

    next();
  };
}
