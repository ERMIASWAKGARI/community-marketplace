import express from "express";
import userRouter from "./routes/userRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import authRouter from "./routes/authRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);

app.use(errorHandler);

export default app;
