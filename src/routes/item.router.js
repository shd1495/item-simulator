import express from "express";
import {
  CreateItem,
  updateItem,
  getItemList,
  getItemDetail,
} from "../controllers/item.controller.js";

const router = express.Router();

/**
 * 아이템 생성 API
 */
router.post("/items", CreateItem);

/**
 * 아이템 수정 API
 */
router.patch("/items/:item_code", updateItem);

/**
 * 아이템 목록 조회 API
 */
router.get("/items", getItemList);

/**
 * 아이템 상세 조회 API
 */
router.get("/items/:item_code", getItemDetail);

export default router;
