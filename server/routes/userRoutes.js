import express from "express";
import {
  createUser,
  resendEmailVerification,
} from "../controllers/userController.js";

const router = express.Router();

router.route("/").post(createUser);
router.route("/resend-verification").post(resendEmailVerification);

export default router;
