import { prisma } from "../utils/prisma/index.js";
import { throwError } from "../utils/utils.js";
import { checkItem } from "../utils/validations.js";
import Joi from "joi";

/**
 * 아이템 생성 로직
 * @param {object} req - Express 요청
 * @param {object} res - Express 응답
 * @param {function} next - 다음 미들웨어 호출
 * @returns {object} Express 응답
 * @throws {Error}
 */
export const CreateItem = async (req, res, next) => {
  const { item_name, item_stat, item_price } = req.body;

  try {
    // 유효성 검사
    const schema = Joi.object({
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
    if (error) throw throwError("양식에 맞게 내용을 입력해주세요.", 400);

    const item = await prisma.items.create({
      data: {
        item_name,
        item_stat,
        item_price: +item_price,
      },
    });

    return res.status(201).json({ data: item });
  } catch (error) {
    next(error);
  }
};

/**
 * 아이템 수정 로직
 * @param {object} req - Express 요청
 * @param {object} res - Express 응답
 * @param {function} next - 다음 미들웨어 호출
 * @returns {object} Express 응답
 * @throws {Error}
 */
export const updateItem = async (req, res, next) => {
  const { item_code } = req.params;
  const { item_name, item_stat } = req.body;

  try {
    // 아이템 존재 여부
    const item = await checkItem(prisma, item_code);

    const schema = Joi.object({
      item_name: Joi.string()
        .pattern(/^[가-힣\s]+$/) // 한글과 공백만 입력 가능
        .min(2)
        .max(12)
        .required(),
      item_stat: Joi.object({
        health: Joi.number().integer().required(), // 정수만 입력 가능
        power: Joi.number().integer().required(), // 정수만 입력 가능
      }),
    });

    const { error } = schema.validate(req.body); // 양식 검증
    if (error) throw throwError("양식에 맞게 내용을 입력해주세요.", 400);

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
};

/**
 * 아이템 목록 조회 로직
 * @param {object} res - Express 응답
 * @param {function} next - 다음 미들웨어 호출
 * @returns {object} Express 응답
 * @throws {Error}
 */
export const getItemList = async (req, res, next) => {
  try {
    // 생성된 아이템 목록 조회
    const items = await prisma.items.findMany({
      select: {
        item_code: true,
        item_name: true,
        item_price: true,
      },
      orderBy: {
        item_code: "desc", // 코드가 높은 순으로 정렬
      },
    });

    return res.status(200).json({ data: items });
  } catch (error) {
    next(error);
  }
};

/**
 * 아이템 상세 정보 조회 로직
 * @param {object} req - Express 요청
 * @param {object} res - Express 응답
 * @param {function} next - 다음 미들웨어 호출
 * @returns {object} Express 응답
 * @throws {Error}
 */
export const getItemDetail = async (req, res, next) => {
  try {
    const { item_code } = req.params;

    // 아이템 존재 여부
    const item = await checkItem(prisma, item_code);

    return res.status(200).json({ data: item });
  } catch (error) {
    next(error);
  }
};
asdasd;
