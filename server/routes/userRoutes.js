import express from "express";
import { createUser, getUserById } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(createUser);
router.route("/:id").get(protect, getUserById);

export default router;
