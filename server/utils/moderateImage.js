import modClient from "../config/sightengine.js";
import { AppError } from "./appError.js";

export const moderateImage = async (filePath) => {
  const moderationResult = await modClient
    .check([
      "nudity",
      "offensive",
      "weapon",
      "gore",
      "violence",
      "self-harm",
      "text-content",
    ])
    .set_file(filePath);

  if (moderationResult.status !== "success") {
    console.error("Sightengine moderation failed:", moderationResult);
    throw new AppError("Image moderation failed", 500);
  }

  // 🔹 Define thresholds (tweak as needed)
  const thresholds = {
    nudity: 0.5, // block if > 50% nudity/sexual
    offensive: 0.5, // block offensive gestures/symbols
    weapon: 0.5, // block obvious weapon presence
    gore: 0.5, // block bloody/gore content
    violence: 0.5, // block violent scenes
    selfHarm: 0.5, // block self-harm imagery
  };

  const {
    nudity,
    weapon,
    offensive,
    gore,
    violence,
    ["self-harm"]: selfHarm,
  } = moderationResult;

  // 🔹 Check nudity (multiple subcategories)
  if (
    nudity?.sexual_activity > thresholds.nudity ||
    nudity?.sexual_display > thresholds.nudity ||
    nudity?.erotica > thresholds.nudity ||
    nudity?.very_suggestive > thresholds.nudity ||
    nudity?.suggestive > thresholds.nudity
  ) {
    throw new AppError("Image rejected: nudity/sexual content detected", 400);
  }

  // 🔹 Check weapons
  if (
    (weapon?.classes?.firearm ?? 0) > thresholds.weapon ||
    (weapon?.classes?.knife ?? 0) > thresholds.weapon
  ) {
    throw new AppError("Image rejected: weapons detected", 400);
  }

  // 🔹 Check offensive content
  if (
    Object.values(offensive ?? {}).some((val) => val > thresholds.offensive)
  ) {
    throw new AppError("Image rejected: offensive symbols detected", 400);
  }

  // 🔹 Check gore
  if (gore?.prob > thresholds.gore) {
    throw new AppError("Image rejected: gore/bloody content detected", 400);
  }

  // 🔹 Check violence
  if (violence?.prob > thresholds.violence) {
    throw new AppError("Image rejected: violence detected", 400);
  }

  // 🔹 Check self-harm
  if (selfHarm?.prob > thresholds.selfHarm) {
    throw new AppError("Image rejected: self-harm content detected", 400);
  }

  return true; // ✅ Safe image
};
