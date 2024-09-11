import { prisma } from "../utils/prisma/index.js";
import { throwError } from "../utils/utils.js";
import { checkChar } from "../utils/validations.js";

/**
 * 캐릭터 생성 로직
 * @param {object} req - Express 요청
 * @param {object} res - Express 응답
 * @param {function} next - 다음 미들웨어 호출
 * @returns {object} Express 응답
 * @throws {Error}
 */
export const createCharacter = async (req, res, next) => {
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
};

/**
 * 캐릭터 상세 조회 로직
 * @param {object} req - Express 요청
 * @param {object} res - Express 응답
 * @param {function} next - 다음 미들웨어 호출
 * @returns {object} Express 응답
 * @throws {Error}
 */
export const getCharacterDetail = async (req, res, next) => {
  const { char_id } = req.params;
  const { user } = req;

  try {
    // 캐릭터 존재 여부
    const char = await prisma.characters.findFirst({
      where: { char_id: +char_id }, // user_id 제외
    });
    if (!char) throw throwError("캐릭터가 존재하지 않습니다.", 404);

    // 인증 여부에 따른 정보 전달
    if (user.user_id === char.user_id) {
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
};

/**
 * 캐릭터 삭제 로직
 * @param {object} req - Express 요청
 * @param {object} res - Express 응답
 * @param {function} next - 다음 미들웨어 호출
 * @returns {object} Express 응답
 * @throws {Error}
 */
export const deleteCharacter = async (req, res, next) => {
  const { char_id } = req.params;
  const { user } = req;

  try {
    // 캐릭터 존재 여부
    const char = await checkChar(prisma, char_id, user.user_id);

    // 캐릭터 삭제
    const deletedChar = await prisma.characters.delete({
      where: { char_id: +char_id, user_id: +user.user_id },
    });

    return res
      .status(200)
      .json({ message: ` ${deletedChar.name} 캐릭터가 삭제되었습니다.` });
  } catch (error) {
    next(error);
  }
};

/**
 * 캐릭터 인벤토리의 아이템 목록 조회 로직
 * @param {object} req - Express 요청
 * @param {object} res - Express 응답
 * @param {function} next - 다음 미들웨어 호출
 * @returns {object} Express 응답
 * @throws {Error}
 */
export const getCharacterInventory = async (req, res, next) => {
  const { char_id } = req.params;
  const { user } = req;

  try {
    // 캐릭터 존재 여부
    const char = await checkChar(prisma, char_id, user.user_id);

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
};

/**
 * 장착한 아이템 목록 조회 로직
 * @param {object} req - Express 요청
 * @param {object} res - Express 응답
 * @param {function} next - 다음 미들웨어 호출
 * @returns {object} Express 응답
 * @throws {Error}
 */
export const getCharacterEquip = async (req, res, next) => {
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
};

/**
 * 게임 머니 획득 로직
 * @param {object} req - Express 요청
 * @param {object} res - Express 응답
 * @param {function} next - 다음 미들웨어 호출
 * @returns {object} Express 응답
 * @throws {Error}
 */
export const getMoney = async (req, res, next) => {
  const { char_id } = req.params;
  const { user } = req;

  try {
    // 캐릭터 존재 여부
    const char = await checkChar(prisma, char_id, user.user_id);

    const updatedChar = await prisma.characters.update({
      data: {
        money: +char.money + 100,
      },
      where: { char_id: +char_id },
    });

    return res.status(200).json({
      message: `100 gold를 획득하여 ${updatedChar.money} gold가 되었습니다.`,
    });
  } catch (error) {
    next(error);
  }
};
