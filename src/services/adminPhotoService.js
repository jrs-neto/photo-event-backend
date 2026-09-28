import adminPhotoRepository from "../repositories/adminPhotoRepository.js";
import { supabase, BUCKET_NAME } from "../config/supabase.js";

class AdminPhotoService {
  /**
   * Exclui uma única foto do banco de dados e do Supabase Storage
   * com mecanismo de compensação em caso de falha no Storage.
   */
  async deletePhoto(id) {
    // 1. Verificar se a foto existe no PostgreSQL
    const photo = await adminPhotoRepository.findById(id);

    if (!photo) {
      const error = new Error("Foto não encontrada.");
      error.statusCode = 404;
      throw error;
    }

    // 2. Excluir o registro no PostgreSQL primeiro
    const deletedPhoto = await adminPhotoRepository.deleteById(id);

    if (!deletedPhoto) {
      const error = new Error("Falha ao remover a foto do banco de dados.");
      error.statusCode = 500;
      throw error;
    }

    // 3. Tentar remover o arquivo do Supabase Storage
    if (photo.storage_path) {
      const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([photo.storage_path]);

      if (storageError) {
        console.error(`[AdminPhotoService] Erro ao remover arquivo no Storage (${photo.storage_path}):`, storageError);

        // Compensação: Tenta restaurar a foto no banco para manter consistência
        try {
          await adminPhotoRepository.restorePhoto(deletedPhoto);
          console.info(`[AdminPhotoService] Registro no banco restaurado para photo ID: ${id}`);
        } catch (rollbackError) {
          console.error(`[AdminPhotoService] CRÍTICO: Falha na compensação/rollback da foto ID ${id}:`, rollbackError);
        }

        const error = new Error("Falha ao remover o arquivo do armazenamento. A alteração foi desfeita.");
        error.statusCode = 500;
        throw error;
      }
    }

    return { message: "Foto excluída com sucesso.", id };
  }
}

export default new AdminPhotoService();
