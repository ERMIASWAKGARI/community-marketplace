import express from "express";
import {
  loginUser,
  resendVerificationEmail,
  verifyEmail,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/resend-verification", resendVerificationEmail);
router.post("/login", loginUser);
router.get("/verify-email", verifyEmail);

export default router;
