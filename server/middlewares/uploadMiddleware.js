import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/tmp"); // temporary folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "avatar") {
    const allowedExt = [".jpg", ".jpeg", ".png", ".webp"];
    if (!allowedExt.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error("Only image files are allowed for avatar"), false);
    }
  } else if (file.fieldname === "documents") {
    const allowedExt = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    if (!allowedExt.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(
        new Error("Only images and PDFs are allowed for documents"),
        false
      );
    }
  }
  cb(null, true);
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export const uploadDocs = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
