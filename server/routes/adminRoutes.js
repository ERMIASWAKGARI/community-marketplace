import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
  getUsers,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", protect, adminOnly, getUsers);

router.get(
  "/verifications/pending",
  protect,
  adminOnly,
  getPendingVerifications
);
router.put(
  "/verifications/:userId/approve",
  protect,
  adminOnly,
  approveVerification
);
router.put(
  "/verifications/:userId/reject",
  protect,
  adminOnly,
  rejectVerification
);

export default router;
