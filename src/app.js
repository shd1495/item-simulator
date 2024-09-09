import express from "express";
import expressSession from "express-session";
import expressMySQLSession from "express-mysql-session";
import errorHandlingMiddleware from "./middlewares/error.handling.middleware.js";
import cookieParser from "cookie-parser";
import UsersRouter from "./routes/users.router.js";
import CharRouter from "./routes/char.router.js";
import ItemRouter from "./routes/item.router.js";
import MarketRouter from "./routes/market.router.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3020;

// MySQLStore를 Express-Session을 이용해 생성합니다.
const MySQLStore = expressMySQLSession(expressSession);
const sessionStore = new MySQLStore({
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  expiration: 1000 * 60 * 60 * 24, // 세션의 만료 기간을 1일
  createDatabaseTable: true,
});

app.use(express.json());
app.use(cookieParser());
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET_KEY, // 세션을 암호화하는 비밀 키를 설정
    resave: false, // 클라이언트의 요청이 올 때마다 세션을 새롭게 저장할 지 설정, 변경사항이 없어도 다시 저장
    saveUninitialized: false, // 세션이 초기화되지 않았을 때 세션을 저장할 지 설정
    cookie: {
      // 세션 쿠키 설정
      maxAge: 1000 * 60 * 60 * 24, // 쿠키의 만료 기간을 1일로 설정합니다.
    },
    store: sessionStore, // 외부 세션 스토리지를 sessionStore로 설정
  })
);

app.use("/api", [UsersRouter, CharRouter, ItemRouter, MarketRouter]);

app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
