import express from "express";

import { protect } from "../middlewares/authMiddleware.js";
import { updateAvatar } from "../controllers/userController.js";
import { uploadAvatar, uploadDocs } from "../middlewares/uploadMiddleware.js";

import {
  createUser,
  getUserById,
  deleteUserById,
  requestProviderVerification,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", createUser);

router.route("/:id").get(protect, getUserById).delete(protect, deleteUserById);

router.put("/avatar", protect, uploadAvatar.single("avatar"), updateAvatar);

router.post(
  "/upgrade-provider",
  protect,
  uploadDocs.array("documents", 5),
  requestProviderVerification
);

export default router;
