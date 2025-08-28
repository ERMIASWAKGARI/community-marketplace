import express from "express";
import {
  createUser,
  getUserById,
  deleteUserById,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(createUser);
router.route("/:id").get(protect, getUserById).delete(protect, deleteUserById);

export default router;
