import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateToken = (userId, secret, expiresIn = "1d") => {
  return jwt.sign({ id: userId }, secret, {
    expiresIn,
  });
};

export const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash it to store in DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  return { resetToken, hashedToken };
};
