import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import optionalAuthMiddleware from "../middlewares/optional.auth.middleware.js";
import {
  createCharacter,
  getCharacterDetail,
  deleteCharacter,
  getCharacterInventory,
  getCharacterEquip,
  getMoney,
} from "../controllers/char.controller.js";

const router = express.Router();

/**
 * 캐릭터 생성 API
 */
router.post("/char", authMiddleware, createCharacter);

/**
 * 캐릭터 상세 조회 API
 */
router.get("/char/:char_id", optionalAuthMiddleware, getCharacterDetail);

/**
 * 캐릭터 삭제 API
 */
router.delete("/char/:char_id", authMiddleware, deleteCharacter);

/**
 * 캐릭터 인벤토리의 아이템 목록 조회 API
 */
router.get("/char/inventory/:char_id", authMiddleware, getCharacterInventory);

/**
 * 장착한 아이템 목록 조회 API
 */
router.get("/char/equip/:char_id", getCharacterEquip);

/**
 * 게임 머니 획득 API
 */
router.patch("/char/:char_id", authMiddleware, getMoney);

export default router;
