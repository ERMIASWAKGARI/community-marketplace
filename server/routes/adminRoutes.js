import express from "express";

import User from "../models/userModel.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
  getUsers,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from "../controllers/adminController.js";
import paginate from "../middlewares/paginateAndFilter.js";

const router = express.Router();

router.get(
  "/users",
  protect,
  adminOnly,
  paginate(User, {
    searchFields: ["name", "email"],
    select: "name email role providerVerification createdAt",
  }),
  getUsers
);

router.get(
  "/verifications/pending",
  protect,
  adminOnly,
  paginate(User, {
    searchFields: ["name", "email"],
    select: "name email role providerVerification createdAt",
    filter: { "providerVerification.status": "pending" },
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
