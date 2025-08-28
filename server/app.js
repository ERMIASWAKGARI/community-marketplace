import express from "express";
import userRouter from "./routes/userRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(express.json());

app.use("/api/v1/users", userRouter);

app.use(errorHandler);

export default app;
