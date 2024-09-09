import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';

export default async function (req, res, next) {
  const authorization = req.headers['authorization'];

  // 토큰 존재 여부
  if (!authorization) return next();

  // 토큰 타입 확인
  const [tokenType, token] = authorization.split(' ');
  if (tokenType !== 'Bearer') return next();

  try {
    const user = jwt.verify(token, 'custom-secret-key');
    req.user = user;
  } catch {
    req.user = undefined;
  }

  next();
}
