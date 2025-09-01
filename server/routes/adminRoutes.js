import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
  getUsers,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from "../controllers/adminController.js";
import paginateAndFilter from "../middlewares/paginateAndFilter.js";
import User from "../models/userModel.js";

const router = express.Router();

router.get(
  "/users",
  protect,
  adminOnly,
  paginateAndFilter(User, {
    searchFields: ["name", "email"],
    select: "name email providerVerification createdAt",
  }),
  getUsers
);

router.get(
  "/verifications/pending",
  protect,
  adminOnly,
  paginateAndFilter(User, {
    searchFields: ["name", "email"],
    select: "name email providerVerification createdAt",
  }),
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
