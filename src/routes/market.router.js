import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { throwError } from "../utils/utils.js";

const router = express.Router();

/**
 * 아이템 구매 API
 */
router.post("/buy/:char_id", authMiddleware, async (req, res, next) => {
  const { char_id } = req.params;
  const { item_code, count } = req.body;
  const { user } = req;

  try {
    // 캐릭터 존재 여부
    const char = await prisma.characters.findFirst({
      where: { char_id: +char_id, user_id: +user.user_id },
    });

    if (!char) throw throwError("캐릭터가 존재하지 않습니다.", 404);

    // 아이템 존재 여부
    const item = await prisma.items.findFirst({
      where: { item_code: +item_code },
    });

    if (!item) throw throwError("아이템이 존재하지 않습니다.", 404);

    // 아이템을 살 소지금이 충분한지 판별
    if (char.money < item.item_price * count)
      throw throwError("소지금이 부족합니다.", 400);

    const money = await prisma.$transaction(async (tx) => {
      // 캐릭터 소지금 변경
      const updateMoney = await tx.characters.update({
        data: { money: char.money - item.item_price * count },
        where: { char_id: +char_id, user_id: +user.user_id },
      });

      // 아이템 소지 여부
      const isExistItem = await tx.character_inventory.findFirst({
        where: { item_code: +item_code },
      });

      if (!isExistItem) {
        // 아이템을 소지하고 있지 않을 경우 생성
        await tx.character_inventory.create({
          data: {
            char_id: +char.char_id,
            item_code: +item_code,
            count: +count,
          },
        });
      } else {
        // 아이템을 이미 소지하고 있을 경우 수량 갱신
        await tx.character_inventory.update({
          data: {
            count: +isExistItem.count + +count,
          },
          where: {
            char_id_item_code: {
              char_id: +char_id,
              item_code: +item_code,
            },
          },
        });
      }
      return updateMoney.money;
    });

    return res.status(201).json({
      message: `${item.item_name}을 ${count}개 구입하여 ${money} gold가 남았습니다.`,
    });
  } catch (error) {
    next(error);
  }
});
export default router;
