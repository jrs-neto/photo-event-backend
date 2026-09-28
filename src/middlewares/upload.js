import multer from "multer";

// 1. Armazenamento temporário na memória RAM (Buffer)
const storage = multer.memoryStorage();

// 2. Filtro estrito para permitir apenas tipos MIME de imagens conhecidos
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de arquivo inválido. Apenas imagens (JPEG, PNG, WEBP, HEIC) são permitidas."), false);
  }
};

// 3. Limites de segurança por requisição
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB por foto
  files: 10, // Máximo de 10 fotos por submissão
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits,
});
