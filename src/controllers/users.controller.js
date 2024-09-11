import { prisma } from "../utils/prisma/index.js";
import { throwError } from "../utils/utils.js";
import bcrypt from "bcrypt";
import Joi from "joi";
import jwt from "jsonwebtoken";
/**
 * 회원가입 로직
 * @param {object} req - Express 요청
 * @param {object} res - Express 응답
 * @param {function} next - 다음 미들웨어 호출
 * @returns {object} Express 응답
 * @throws {Error}
 */
export const createAccount = async (req, res, next) => {
  const { user_name, id, password, password_check } = req.body;

  try {
    // 비밀번호 일치 여부
    if (password !== password_check)
      throw throwError("두 비밀번호가 일치하지 않습니다.", 400);

    // 유효성 검사
    const schema = Joi.object({
      user_name: Joi.string()
        .pattern(/^[가-힣]+$/)
        .min(2)
        .max(4)
        .required(),
      id: Joi.string()
        .pattern(/^[a-z0-9]+$/)
        .min(6)
        .max(15)
        .required(),
      password: Joi.string().min(6).max(16).required(),
      password_check: Joi.string().valid(Joi.ref("password")).required(),
    });

    const { error } = schema.validate(req.body);

    if (error) throw throwError("양식에 맞게 내용을 입력해주세요", 400);

    // DB에 같은 ID가 이미 존재하는지 확인
    const isExistUser = await prisma.users.findFirst({
      where: { id },
    });
    if (isExistUser) throw throwError("이미 존재하는 ID입니다.", 409);

    // bcrypt로 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        user_name,
        id,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ message: "회원 가입이 완료되었습니다." });
  } catch (error) {
    next(error);
  }
};

/**
 * 로그인 로직
 * @param {object} req - Express 요청
 * @param {object} res - Express 응답
 * @param {function} next - 다음 미들웨어 호출
 * @returns {object} Express 응답
 * @throws {Error}
 */
export const login = async (req, res, next) => {
  const { id, password } = req.body;

  try {
    // DB의 ID와 일치하는지 확인
    const user = await prisma.users.findFirst({
      where: { id },
    });
    if (!user) throw throwError("존재하지 않는 ID입니다", 404);

    // 해싱된 비밀번호 비교
    if (!(await bcrypt.compare(password, user.password)))
      throw throwError("비밀번호가 일치하지 않습니다", 401);

    const token = jwt.sign(
      { user_id: user.user_id },
      process.env.SESSION_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({ message: "로그인에 성공했습니다.", token });
  } catch (error) {
    next(error);
  }
};
