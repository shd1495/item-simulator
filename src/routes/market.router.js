import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { throwError } from "../utils/utils.js";
import { checkChar, checkItem, checkInventory } from "../utils/validations.js";

const router = express.Router();

/**
 * 아이템 구매 API
 */
router.post("/buy/:char_id", authMiddleware, async (req, res, next) => {
  const { char_id } = req.params;
  const { item_code, count } = req.body;
  const { user } = req.user;

  try {
    // 캐릭터 존재 여부
    const char = await checkChar(prisma, char_id, user);

    // 아이템 존재 여부
    const item = await checkItem(prisma, item_code);

    // 아이템을 살 소지금이 충분한지 판별
    if (char.money < item.item_price * count)
      throw throwError("소지금이 부족합니다.", 400);

    //  인벤토리에 아이템 소지 여부
    const inventory = await checkInventory(prisma, char_id, item_code);

    const money = await prisma.$transaction(async (tx) => {
      // 캐릭터 소지금 변경
      const updateMoney = await tx.characters.update({
        data: { money: char.money - item.item_price * count },
        where: { char_id: +char_id, user_id: +user },
      });

      if (!inventory) {
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
            count: +inventory.count + +count,
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

/**
 * 아이템 판매 API
 */
router.post("/sell/:char_id", authMiddleware, async (req, res, next) => {
  const { char_id } = req.params;
  const { item_code, count } = req.body;
  const { user } = req.user;

  try {
    // 캐릭터 존재 여부
    const char = await checkChar(prisma, char_id, user);

    // 아이템 존재 여부
    const item = await checkItem(prisma, item_code);

    //  인벤토리에 아이템 소지 여부
    const inventory = await checkInventory(prisma, char_id, item_code);

    if (!inventory) {
      throw throwError("아이템을 소지하고 있지 않습니다.", 404);
    } else if (inventory.count < count) {
      throw throwError("수량이 부족합니다.", 400);
    }

    const money = await prisma.$transaction(async (tx) => {
      // 캐릭터 소지금 변경
      const updateMoney = await tx.characters.update({
        data: {
          // 판매시 60%만 정산
          money: char.money + (Math.round(item.item_price * 60) / 100) * count, // 정수 연산
        },
        where: { char_id: +char_id, user_id: +user },
      });

      if (inventory.count > count) {
        // 아이템 수량 갱신
        await tx.character_inventory.update({
          data: {
            count: +inventory.count - +count,
          },
          where: {
            char_id_item_code: {
              char_id: +char_id,
              item_code: +item_code,
            },
          },
        });
      } else {
        // 수량이 0이되면 컬럼 삭제
        await tx.character_inventory.delete({
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

    return res.status(200).json({
      message: `${item.item_name}을 ${count}개 판매하여 ${money} gold가 남았습니다.`,
    });
  } catch (error) {
    next(error);
  }
});
export default router;
