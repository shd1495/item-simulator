import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { equipItem, unEquipItem } from "../controllers/equip.controller.js";

const router = express.Router();

/**
 * 아이템 장착 API
 */
router.post("/equip/:char_id", authMiddleware, equipItem);

/**
 * 아이템 장착 해제 API
 */
router.post("/unEquip/:char_id", authMiddleware, unEquipItem);

export default router;
