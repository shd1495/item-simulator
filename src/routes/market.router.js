import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { buyItem, sellItem } from "../controllers/market.controller.js";

const router = express.Router();

/**
 * 아이템 구매 API
 */
router.post("/buy/:char_id", authMiddleware, buyItem);

/**
 * 아이템 판매 API
 */
router.post("/sell/:char_id", authMiddleware, sellItem);
export default router;
