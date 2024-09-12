import express from "express";
import errorHandlingMiddleware from "./middlewares/error.handling.middleware.js";
import UsersRouter from "./routes/users.router.js";
import CharRouter from "./routes/char.router.js";
import ItemRouter from "./routes/item.router.js";
import MarketRouter from "./routes/market.router.js";
import EquipRouter from "./routes/equip.router.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3020;

app.use(express.json());

app.use("/api", [
  UsersRouter,
  CharRouter,
  ItemRouter,
  MarketRouter,
  EquipRouter,
]);

app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
