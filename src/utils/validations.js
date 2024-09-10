import { throwError } from "../utils/utils.js";

/**
 * 캐릭터 존재 여부
 * @param {*} prisma
 * @param {*} char_id
 * @param {*} user
 * @returns { object }
 */
export async function checkChar(prisma, char_id, user_id) {
  const char = await prisma.characters.findFirst({
    where: { char_id: +char_id, user_id: +user_id },
  });
  return char;
}

/**
 * 아이템 존재 여부
 * @param {*} prisma
 * @param {*} item_code
 * @returns { object }
 */
export async function checkItem(prisma, item_code) {
  const item = await prisma.items.findFirst({
    where: { item_code: +item_code },
  });

  if (!item) throw throwError("아이템이 존재하지 않습니다.", 404);
  return item;
}

/**
 * 인벤토리 내 아이템 소지 여부
 * @param {*} prisma
 * @param {*} char_id
 * @param {*} item_code
 * @returns { object }
 */
export async function checkInventory(prisma, char_id, item_code) {
  const isExistItem = await prisma.character_inventory.findFirst({
    where: { char_id: +char_id, item_code: +item_code },
  });
  return isExistItem;
}

/**
 * 아이템 착용 여부
 * @param {*} prisma
 * @param {*} char_id
 * @param {*} item_code
 * @returns
 */
export async function checkEquip(prisma, char_id, item_code) {
  const alreadyEquip = await prisma.character_item.findFirst({
    where: { char_id: +char_id, item_code: +item_code },
  });
  return alreadyEquip;
}
