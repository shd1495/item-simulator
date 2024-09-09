import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import Joi from 'joi';

const router = express.Router();

/**
 * 아이템 생성 API
 */
router.post('/items', async (req, res, next) => {
  const { item_code, item_name, item_stat, item_price } = req.body;

  try {
    // 유효성 검사
    const schema = Joi.object({
      item_code: Joi.number().integer().required(), // 정수만 입력 가능
      item_name: Joi.string()
        .pattern(/^[가-힣\s]+$/) // 한글과 공백만 입력 가능
        .min(2)
        .max(12)
        .required(),
      item_stat: Joi.object({
        health: Joi.number().integer().required(), // 정수만 입력 가능
        power: Joi.number().integer().required(), // 정수만 입력 가능
      }),
      item_price: Joi.number().integer().required(), // 정수만 입력 가능
    });

    const { error } = schema.validate(req.body); // 양식 검증

    if (error) throw Object.assign(new Error('양식에 맞게 내용을 입력해주세요.'), { status: 400 });

    const item = await prisma.items.create({
      data: {
        item_code: +item_code,
        item_name,
        item_stat,
        item_price: +item_price,
      },
    });

    return res.status(201).json({ data: item });
  } catch (error) {
    next(error);
  }
});

export default router;
