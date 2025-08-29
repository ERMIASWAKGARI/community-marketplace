import express from "express";
import {
  createUser,
  getUserById,
  deleteUserById,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { updateAvatar } from "../controllers/userController.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.route("/").post(createUser);
router.route("/:id").get(protect, getUserById).delete(protect, deleteUserById);
router.put("/avatar", protect, upload.single("avatar"), updateAvatar);

export default router;
