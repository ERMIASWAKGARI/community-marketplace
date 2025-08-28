import express from "express";
import { resendVerificationEmail } from "../controllers/authController.js";

const router = express.Router();

router.route("/resend-verification").post(resendVerificationEmail);

export default router;
