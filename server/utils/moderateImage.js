import modClient from "../config/sightengine.js";
import { AppError } from "./appError.js";

export const moderateImage = async (filePath) => {
  const moderationResult = await modClient
    .check([
      "nudity-2.1",
      "weapon",
      "offensive-2.0",
      "gore-2.0",
      "violence",
      "self-harm",
      "alcohol",
      "recreational_drug",
      "text-content",
    ])
    .set_file(filePath);

  if (moderationResult.status !== "success") {
    console.error("Sightengine moderation failed:", moderationResult);
    throw new AppError("Image moderation failed", 500);
  }

  // 🔹 Define thresholds (fine-tuned)
  const thresholds = {
    nudity: 0.5,
    erotic: 0.8,
    sexual_display: 0.85,
    suggestive: 0.9,
    violence: 0.5,
    gore: 0.5,
    selfHarm: 0.5,
    firearm: 0.3,
    knife: 0.5,
    alcohol: 0.7,
    drugs: 0.5,
    offensive: 0.7,
    hate_symbol: 0.6,
  };

  const {
    nudity,
    weapon,
    offensive,
    gore,
    violence,
    alcohol,
    recreational_drug,
    ["self-harm"]: selfHarm,
  } = moderationResult;

  // 🔹 Nudity & Suggestive
  if (
    nudity?.sexual_activity > thresholds.nudity ||
    nudity?.sexual_display > thresholds.sexual_display ||
    nudity?.erotica > thresholds.erotic ||
    nudity?.very_suggestive > thresholds.suggestive ||
    nudity?.suggestive > thresholds.suggestive
  ) {
    throw new AppError("Image rejected: nudity/sexual content detected", 400);
  }

  // 🔹 Violence
  if (violence?.prob > thresholds.violence) {
    throw new AppError("Image rejected: violence detected", 400);
  }

  // 🔹 Gore
  if (gore?.prob > thresholds.gore) {
    throw new AppError("Image rejected: gore/bloody content detected", 400);
  }

  // 🔹 Self-harm
  if (selfHarm?.prob > thresholds.selfHarm) {
    throw new AppError("Image rejected: self-harm content detected", 400);
  }

  // 🔹 Weapons
  if (
    (weapon?.classes?.firearm ?? 0) > thresholds.firearm ||
    (weapon?.classes?.knife ?? 0) > thresholds.knife
  ) {
    throw new AppError("Image rejected: weapons detected", 400);
  }

  // 🔹 Offensive / Hate
  if (
    (offensive?.nazi ?? 0) > thresholds.hate_symbol ||
    (offensive?.confederate ?? 0) > thresholds.hate_symbol ||
    (offensive?.supremacist ?? 0) > thresholds.hate_symbol ||
    (offensive?.terrorist ?? 0) > thresholds.hate_symbol ||
    (offensive?.middle_finger ?? 0) > thresholds.offensive
  ) {
    throw new AppError("Image rejected: offensive/hate symbols detected", 400);
  }

  // 🔹 Alcohol
  if (alcohol?.prob > thresholds.alcohol) {
    throw new AppError("Image rejected: alcohol content detected", 400);
  }

  // 🔹 Drugs
  if (
    recreational_drug?.prob > thresholds.drugs ||
    (recreational_drug?.classes?.cannabis ?? 0) > thresholds.drugs
  ) {
    throw new AppError("Image rejected: drug-related content detected", 400);
  }

  return true; // ✅ Safe image
};
