import { fileTypeFromBuffer } from "file-type";
import { v4 as uuidv4 } from "uuid";
import { supabase, BUCKET_NAME } from "../config/supabase.js";
import { submissionRepository } from "../repositories/submissionRepository.js";

export const submissionService = {
  async createSubmission({ visitor_name, visitor_group, message, files }) {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];

    // Mapeamento preliminar para garantir validação de conteúdo dos arquivos
    const validatedFiles = [];

    // 1. Validação de segurança e extração do tipo real por Magic Number
    for (const file of files) {
      const detectedType = await fileTypeFromBuffer(file.buffer);

      if (!detectedType || !allowedMimeTypes.includes(detectedType.mime)) {
        throw new Error(`O arquivo "${file.originalname}" possui um formato incompatível ou corrompido.`);
      }

      validatedFiles.push({
        buffer: file.buffer,
        ext: detectedType.ext,
        mime: detectedType.mime,
      });
    }

    const uploadedStoragePaths = [];

    try {
      // 2. Upload para o Supabase Storage usando dados REAIS do arquivo
      const photoPayloads = [];

      for (const file of validatedFiles) {
        // Nome derivado da extensão real detectada pelos bytes
        const uniqueFileName = `${uuidv4()}.${file.ext}`;
        const storagePath = `events/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, file.buffer, {
          contentType: file.mime, // Usa o MIME real do file-type
          upsert: false,
        });

        if (uploadError) {
          throw new Error(`Falha no upload para o Storage: ${uploadError.message}`);
        }

        uploadedStoragePaths.push(storagePath);
        photoPayloads.push({ storage_path: storagePath });
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
