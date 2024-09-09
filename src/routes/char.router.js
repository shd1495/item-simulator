import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import optionalAuthMiddleware from '../middlewares/optional.auth.middleware.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * 캐릭터 생성 API
 */
router.post('/char', authMiddleware, async (req, res, next) => {
  const { name } = req.body;
  const { user } = req;

  const isExistName = await prisma.characters.findFirst({
    where: { name: name, user_id: user.user_id },
  });

  if (isExistName) return res.status(400).json({ message: '이미 존재하는 캐릭터명입니다.' });

  const char = await prisma.characters.create({
    data: {
      name: name,
      user_id: +user.user_id,
    },
  });

  return res.status(201).json({ message: '캐릭터 생성에 성공했습니다.', char_id: char.char_id });
});

/**
 * 캐릭터 상세 조회 API
 */
router.get('/char/:char_id', optionalAuthMiddleware, async (req, res, next) => {
  const { char_id } = req.params;
  const user = req.user;

  const char = await prisma.characters.findFirst({
    where: { char_id: +char_id },
  });
  if (!char) return res.status(400).json({ message: '캐릭터가 존재하지 않습니다.' });

  if (user.user_id === char.user_id) {
    return res
      .status(200)
      .json({ name: char.name, health: char.health, power: char.power, money: char.money });
  } else {
    return res.status(200).json({ name: char.name, health: char.health, power: char.power });
  }
});

export default router;
