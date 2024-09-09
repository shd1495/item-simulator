import express from 'express';
import expressMySQLSession from 'express-mysql-session';
import cookieParser from 'cookie-parser';
import UsersRouter from './routes/users.router.js';
import CharRouter from './routes/char.router.js';
import dotenv from 'dotenv';

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

app.use('/api', [UsersRouter, CharRouter]);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
