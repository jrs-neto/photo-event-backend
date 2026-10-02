import { fileTypeFromBuffer } from "file-type";
import { v4 as uuidv4 } from "uuid";
import { supabase, BUCKET_NAME } from "../config/supabase.js";
import { submissionRepository } from "../repositories/submissionRepository.js";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

// Mapeamento de MIMEs permitidos e seu respetivo media_type
const ALLOWED_MIMES = {
  // Imagens
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/heic": "image",
  // Vídeos
  "video/mp4": "video",
  "video/quicktime": "video",
  "video/webm": "video",
};

export const submissionService = {
  async createSubmission({ visitor_name, visitor_group, message, files }) {
    if (!files || files.length === 0) {
      throw new Error("Pelo menos um arquivo deve ser enviado.");
    }

    if (files.length > 10) {
      throw new Error("Você pode enviar no máximo 10 arquivos por submissão.");
    }

    const validatedFiles = [];

    // 1. Validação de segurança, extração do Magic Number e verificação de tamanho
    for (const file of files) {
      const detectedType = await fileTypeFromBuffer(file.buffer);

      if (!detectedType || !ALLOWED_MIMES[detectedType.mime]) {
        throw new Error(`O arquivo "${file.originalname}" possui um formato incompatível ou corrompido.`);
      }

      const mediaType = ALLOWED_MIMES[detectedType.mime];

      // Validação de tamanho individual baseada no tipo de mídia
      if (mediaType === "image" && file.size > MAX_IMAGE_SIZE) {
        throw new Error(`A imagem "${file.originalname}" excede o limite máximo permitido de 10 MB.`);
      }

      if (mediaType === "video" && file.size > MAX_VIDEO_SIZE) {
        throw new Error(`O vídeo "${file.originalname}" excede o limite máximo permitido de 50 MB.`);
      }

      validatedFiles.push({
        buffer: file.buffer,
        ext: detectedType.ext,
        mime: detectedType.mime,
        mediaType,
      });
    }

    const uploadedStoragePaths = [];

    try {
      // 2. Upload para o Supabase Storage
      const photoPayloads = [];

      for (const file of validatedFiles) {
        const uniqueFileName = `${uuidv4()}.${file.ext}`;
        const storagePath = `events/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, file.buffer, {
          contentType: file.mime, // MIME real detectado pelo file-type
          upsert: false,
        });

        if (uploadError) {
          throw new Error(`Falha no upload para o Storage: ${uploadError.message}`);
        }

        uploadedStoragePaths.push(storagePath);

        // Inclui media_type no payload do registro da foto/vídeo
        photoPayloads.push({
          storage_path: storagePath,
          media_type: file.mediaType,
        });
      }

      // 3. Persistência transacional no PostgreSQL
      const submissionResult = await submissionRepository.createSubmissionWithPhotos({
        visitor_name,
        visitor_group,
        message,
        photos: photoPayloads,
      });

      return submissionResult;
    } catch (error) {
      // 4. Mecanismo de compensação (Rollback do Storage)
      if (uploadedStoragePaths.length > 0) {
        console.warn("⚠️ Ocorreu uma falha. Limpando arquivos enviados ao Supabase Storage...");
        await supabase.storage.from(BUCKET_NAME).remove(uploadedStoragePaths);
      }

      throw error;
    }
  },
};
