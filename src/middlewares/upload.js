import multer from "multer";

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de arquivo inválido. Formatos aceitos: JPG, PNG, WEBP, HEIC, MP4, MOV, WEBM."), false);
  }
};

const limits = {
  fileSize: 50 * 1024 * 1024,
  files: 10,
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits,
});
