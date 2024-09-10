import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import optionalAuthMiddleware from "../middlewares/optional.auth.middleware.js";
import { throwError } from "../utils/utils.js";
import { checkChar } from "../utils/validations.js";

const router = express.Router();

/**
 * 캐릭터 생성 API
 */
router.post("/char", authMiddleware, async (req, res, next) => {
  const { name } = req.body;
  const { user } = req;

  try {
    // 캐릭터명 중복 여부
    const isExistName = await prisma.characters.findFirst({
      where: { name: name, user_id: +user.user_id },
    });
    if (isExistName) throw throwError("이미 존재하는 캐릭터명입니다.", 409);

    const char = await prisma.characters.create({
      data: {
        name: name,
        user_id: +user.user_id,
      },
    });

    return res
      .status(201)
      .json({ message: "캐릭터 생성에 성공했습니다.", char_id: char.char_id });
  } catch (error) {
    next(error);
  }
});

/**
 * 캐릭터 상세 조회 API
 */
router.get("/char/:char_id", optionalAuthMiddleware, async (req, res, next) => {
  const { char_id } = req.params;
  const { user } = req;

  try {
    // 캐릭터 존재 여부
    const char = await prisma.characters.findFirst({
      where: { char_id: +char_id }, // user_id 제외
    });
    if (!char) throw throwError("캐릭터가 존재하지 않습니다.", 404);

    // 인증 여부에 따른 정보 전달
    if (user === char.user_id) {
      return res.status(200).json({
        name: char.name,
        health: char.health,
        power: char.power,
        money: char.money,
      });
    } else {
      return res
        .status(200)
        .json({ name: char.name, health: char.health, power: char.power });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * 캐릭터 삭제 API
 */
router.delete("/char/:char_id", authMiddleware, async (req, res, next) => {
  const { char_id } = req.params;
  const { user } = req;

  try {
    // 캐릭터 존재 여부
    const char = await checkChar(prisma, char_id, user.user_id);
    if (!char) throw throwError("캐릭터 정보가 없거나 권한이 없습니다.", 403);

    // 캐릭터 삭제
    const deletedChar = await prisma.characters.delete({
      where: { char_id: +char_id, user_id: user.user_id },
    });

    return res
      .status(200)
      .json({ message: ` ${deletedChar.name} 캐릭터가 삭제되었습니다.` });
  } catch (error) {
    next(error);
  }
});

/**
 * 캐릭터 인벤토리의 아이템 목록 조회 API
 */
router.get(
  "/char/inventory/:char_id",
  authMiddleware,
  async (req, res, next) => {
    const { char_id } = req.params;
    const { user } = req;

    try {
      // 캐릭터 존재 여부
      await checkChar(prisma, char_id, user.user_id);

      // 인벤토리의 아이템 목록 조회
      const inventory = await prisma.character_inventory.findMany({
        where: { char_id: +char_id },
        select: {
          item_code: true,
          item: {
            select: {
              item_name: true,
            },
          },
          count: true,
        },
      });
      // 인벤토리 데이터 가공
      const result = inventory.map((x) => ({
        item_code: x.item_code,
        item_name: x.item.item_name,
        count: x.count,
      }));

      return res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 장착한 아이템 목록 조회 API
 */
router.get("/char/equip/:char_id", async (req, res, next) => {
  const { char_id } = req.params;

  try {
    // 캐릭터 존재 여부
    await prisma.characters.findFirst({
      where: { char_id: +char_id },
    });

    // 장착한 아이템 목록 조회
    const equip = await prisma.character_item.findMany({
      where: { char_id: +char_id },
      select: {
        item_code: true,
        item: {
          select: {
            item_name: true,
          },
        },
      },
    });

    // 장착한 아이템 데이터 가공
    const result = equip.map((x) => ({
      item_code: x.item_code,
      item_name: x.item.item_name,
    }));

    return res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
});
export default router;
