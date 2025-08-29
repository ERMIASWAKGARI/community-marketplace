import express from "express";
import {
  loginUser,
  resendVerificationEmail,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/resend-verification", resendVerificationEmail);
router.post("/login", loginUser);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
