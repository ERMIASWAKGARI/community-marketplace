import express from "express";
import {
  loginUser,
  resendVerificationEmail,
} from "../controllers/authController.js";

const router = express.Router();

router.route("/resend-verification").post(resendVerificationEmail);
router.route("/login").post(loginUser);

export default router;
