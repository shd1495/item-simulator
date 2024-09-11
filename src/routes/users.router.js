import express from "express";
import { createAccount, login } from "../controllers/users.controller.js";

const router = express.Router();

/**
 * 회원 가입 API
 */
router.post("/sign_up", createAccount);

/**
 * 로그인 API
 */
router.post("/sign_in", login);

export default router;
