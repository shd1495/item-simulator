import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * 회원 가입 API
 */
router.post('/sign_up', async (req, res, next) => {
  const { user_name, id, password, password_check } = req.body;

  // 비밀번호 일치 여부
  if (password !== password_check)
    return res.status(400).json({ message: '두 비밀번호가 일치하지 않습니다.' });

  // 유효성 검사
  const schema = Joi.object({
    user_name: Joi.string()
      .pattern(/^[가-힣]+$/)
      .min(2)
      .max(4)
      .required(),
    id: Joi.string()
      .pattern(/^[a-z0-9]+$/)
      .min(6)
      .max(15)
      .required(),
    password: Joi.string().min(6).max(16).required(),
    password_check: Joi.string().valid(Joi.ref('password')).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    console.error(error.details);
    return res.status(400).json({ message: '양식에 맞게 내용을 입력해주세요.' });
  }

  // DB에 같은 ID가 이미 존재하는지 확인
  const isExistUser = await prisma.users.findFirst({
    where: { id },
  });

  if (isExistUser) return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });

  // bcrypt로 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      user_name,
      id,
      password: hashedPassword,
    },
  });

  return res.status(201).json({ message: '회원 가입이 완료되었습니다.' });
});

/**
 * 로그인 API
 */
router.post('/sign_in', async (req, res, next) => {
  const { id, password } = req.body;

  // DB의 ID와 일치하는지 확인
  const user = await prisma.users.findFirst({
    where: { id },
  });

  if (!user) return res.status(401).json({ message: '존재하지 않는 ID입니다.' });

  // 해싱된 비밀번호 비교
  if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

  const token = jwt.sign({ user_id: user.user_id }, 'custom-secret-key', { expiresIn: '1h' });

  return res.status(200).json({ message: '로그인에 성공했습니다.', token });
});

export default router;
