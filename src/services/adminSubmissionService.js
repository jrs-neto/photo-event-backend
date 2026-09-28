import { supabase, BUCKET_NAME } from "../config/supabase.js";
import { adminSubmissionRepository } from "../repositories/adminSubmissionRepository.js";

export const adminSubmissionService = {
  /**
   * Lista as submissões paginadas e substitui os caminhos por Signed URLs temporárias.
   */
  async listSubmissions({ page, limit }) {
    const offset = (page - 1) * limit;

    const { submissions, total } = await adminSubmissionRepository.findPaginated({
      limit,
      offset,
    });

    // Mapeia e gera a Signed URL para cada foto das submissões (expira em 3600 segundos / 1 hora)
    const submissionsWithSignedUrls = await Promise.all(
      submissions.map(async (submission) => {
        const photosWithSignedUrls = await Promise.all(
          submission.photos.map(async (photo) => {
            const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(photo.storage_path, 3600);

            return {
              id: photo.id,
              url: error ? null : data.signedUrl,
              created_at: photo.created_at,
            };
          }),
        );

        return {
          ...submission,
          photos: photosWithSignedUrls,
        };
      }),
    );

    return {
      data: submissionsWithSignedUrls,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  /**
   * Executa a remoção primeiro no banco e, subsequentemente, no Supabase Storage.
   */
  async deleteSubmission(id) {
    // 1. Coleta os caminhos dos arquivos antes de excluir do banco
    const photoPaths = await adminSubmissionRepository.findPhotoPathsBySubmissionId(id);

    // 2. Deleta do PostgreSQL (ON DELETE CASCADE limpa as referências na tabela photos)
    const deleted = await adminSubmissionRepository.deleteSubmission(id);

    if (!deleted) {
      const error = new Error("Submissão não encontrada.");
      error.statusCode = 404;
      throw error;
    }

    // 3. Tenta remover os arquivos do Supabase Storage
    if (photoPaths.length > 0) {
      try {
        const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove(photoPaths);

        if (storageError) {
          console.error(
            `⚠️ [ARQUIVO ÓRFÃO DETECTADO] Falha ao deletar arquivos da submissão ${id} no Storage:`,
            storageError.message,
            { paths: photoPaths },
          );
        }
      } catch (err) {
        console.error(
          `⚠️ [ARQUIVO ÓRFÃO DETECTADO] Erro inesperado no Storage ao remover arquivos da submissão ${id}:`,
          err.message,
          { paths: photoPaths },
        );
      }
    }

    return true;
  },
};
