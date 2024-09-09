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

/**
 * 아이템 수정 API
 */
router.patch('/items/:item_code', async (req, res, next) => {
  const { item_code } = req.params;
  const { item_name, item_stat } = req.body;

  try {
    // 아이템 존재 여부
    const item = await prisma.items.findFirst({
      where: { item_code: +item_code },
    });

    if (!item) throw Object.assign(new Error('아이템이 존재하지 않습니다.'), { status: 404 });

    // 수정 사항 반영
    const updatedItem = await prisma.items.update({
      data: {
        item_name,
        item_stat,
      },
      where: {
        item_code: +item.item_code,
      },
    });

    return res.status(200).json({ data: updatedItem });
  } catch (error) {
    next(error);
  }
});

export default router;
