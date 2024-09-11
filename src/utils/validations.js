import { throwError } from "../utils/utils.js";

/**
 * 캐릭터 존재 여부
 * @param {object} prisma
 * @param {number} char_id
 * @param {number} user_id
 * @returns { object|null }
 */
export async function checkChar(prisma, char_id, user_id) {
  // 본인 계정의 캐릭터가 맞는지 검증
  const char = await prisma.characters.findFirst({
    where: { char_id: +char_id, user_id: +user_id },
  });
  // 본인 계정이 아닐 경우 에러 처리를 위한 분기
  if (!char) {
    const exist = await prisma.characters.findUnique({
      where: { char_id: +char_id },
    });
    if (!exist) {
      throw throwError("캐릭터를 찾을 수 없습니다.", 404);
    } else {
      throw throwError("권한이 없습니다.", 403);
    }
  }
  return char;
}

/**
 * 아이템 존재 여부
 * @param {object} prisma
 * @param {number} item_code
 * @returns { object|null }
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
 * @param {object} prisma
 * @param {number} char_id
 * @param {number} item_code
 * @returns { object|null }
 */
export async function checkInventory(prisma, char_id, item_code) {
  const isExistItem = await prisma.character_inventory.findFirst({
    where: { char_id: +char_id, item_code: +item_code },
  });
  return isExistItem;
}

/**
 * 아이템 착용 여부
 * @param {object} prisma
 * @param {number} char_id
 * @param {number} item_code
 * @returns { object|null }
 */
export async function checkEquip(prisma, char_id, item_code) {
  const alreadyEquip = await prisma.character_item.findFirst({
    where: { char_id: +char_id, item_code: +item_code },
  });
  return alreadyEquip;
}
