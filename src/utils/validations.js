import { throwError } from "../utils/utils.js";

/**
 * 캐릭터 존재 여부
 * @param {*} prisma
 * @param {*} char_id
 * @param {*} user
 * @returns { object }
 */
export async function checkChar(prisma, char_id, user) {
  const char = await prisma.characters.findFirst({
    where: { char_id: +char_id, user_id: user },
  });
  if (!char) throw throwError("캐릭터가 존재하지 않습니다.", 404);
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
