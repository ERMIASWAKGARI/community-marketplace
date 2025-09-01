import express from "express";
import userRouter from "./routes/userRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import authRouter from "./routes/authRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import serviceRouter from "./routes/serviceRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/services", serviceRouter);
app.use("/api/v1/categories", categoryRouter);

app.use(errorHandler);

export default app;
