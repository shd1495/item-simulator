import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { throwError } from "../utils/utils.js";
import {
  checkChar,
  checkItem,
  checkInventory,
  checkEquip,
} from "../utils/validations.js";

const router = express.Router();

/**
 * 아이템 장착 API
 */
router.post("/equip/:char_id", authMiddleware, async (req, res, next) => {
  const { char_id } = req.params;
  const { item_code } = req.body;
  const { user } = req;

  try {
    // 캐릭터 존재 여부
    const char = await checkChar(prisma, char_id, user.user_id);

    // 인벤토리 내 아이템 존재 여부
    const inventory = await checkInventory(prisma, char_id, item_code);
    if (!inventory)
      throw throwError("인벤토리 내에 아이템이 존재하지 않습니다.", 404);

    // 아이템 착용 여부
    const alreadyEquip = await checkEquip(prisma, char_id, item_code);
    if (alreadyEquip) throw throwError("이미 착용 중인 아이템입니다.", 409);

    // 아이템 정보 저장
    const item = await checkItem(prisma, item_code);

    const updatedChar = await prisma.$transaction(async (tx) => {
      // 캐릭터 스탯 갱신
      const result = await tx.characters.update({
        data: {
          health: char.health + +item.item_stat.health,
          power: char.power + +item.item_stat.power,
        },
        where: { char_id: +char.char_id, user_id: +char.user_id },
      });

      // 캐릭터가 장착 아이템에 추가
      await tx.character_item.create({
        data: {
          char_id: +char.char_id,
          item_code: +item_code,
        },
      });

      if (inventory.count > 1) {
        // 인벤토리 내 아이템 수량 갱신
        await tx.character_inventory.update({
          data: {
            count: inventory.count - 1,
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
      return result;
    });

    return res.status(200).json({
      message: `${char.name}이/가 ${item.item_name}을/를 장착했습니다.
         health +${item.item_stat.health} 현재 health = ${updatedChar.health}
         power +${item.item_stat.power} 현재 power = ${updatedChar.power}`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 아이템 장착 해제 API
 */
router.post("/unEquip/:char_id", authMiddleware, async (req, res, next) => {
  const { char_id } = req.params;
  const { item_code } = req.body;
  const { user } = req;

  try {
    // 캐릭터 존재 여부
    const char = await checkChar(prisma, char_id, user.user_id);

    // 아이템 착용 여부
    const alreadyEquip = await checkEquip(prisma, char_id, item_code);
    if (!alreadyEquip) throw throwError("장착 중인 아이템이 아닙니다.", 404);

    // 아이템 정보 저장
    const item = await checkItem(prisma, item_code);
    const updatedChar = await prisma.$transaction(async (tx) => {
      // 캐릭터 스탯 갱신
      const result = await tx.characters.update({
        data: {
          health: char.health - +item.item_stat.health,
          power: char.power - +item.item_stat.power,
        },
        where: { char_id: +char.char_id, user_id: +char.user_id },
      });

      // 캐릭터가 장착 아이템에서 제거
      await tx.character_item.delete({
        where: {
          char_id_item_code: {
            char_id: +char_id,
            item_code: +item_code,
          },
        },
      });

      // 인벤토리 내 아이템 존재 여부
      const inventory = await checkInventory(prisma, char_id, item_code);

      if (inventory) {
        // 인벤토리 내 아이템이 존재하면 수량 갱신
        await tx.character_inventory.update({
          data: {
            count: inventory.count + 1,
          },
          where: {
            char_id_item_code: {
              char_id: +char_id,
              item_code: +item_code,
            },
          },
        });
      } else {
        // 인벤토리 내 아이템이 없었으면 생성
        await tx.character_inventory.create({
          data: {
            char_id: +char.char_id,
            item_code: +item_code,
            count: 1,
          },
        });
      }

      return result;
    });

    return res.status(200).json({
      message: `${char.name}이/가 ${item.item_name}을/를 장착 해제했습니다.
         health -${item.item_stat.health} 현재 health = ${updatedChar.health}
         power -${item.item_stat.power} 현재 power = ${updatedChar.power}`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
