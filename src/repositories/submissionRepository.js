import pool from "../config/database.js";

export const submissionRepository = {
  async createSubmissionWithPhotos({ visitor_name, visitor_group, message, photos }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Insere a submissão pai
      const insertSubmissionQuery = `
        INSERT INTO submissions (visitor_name, visitor_group, message)
        VALUES ($1, $2, $3)
        RETURNING id, visitor_name, visitor_group, message, created_at;
      `;
      const submissionResult = await client.query(insertSubmissionQuery, [visitor_name, visitor_group, message]);
      const newSubmission = submissionResult.rows[0];

      // 2. Insere as mídias associadas (fotos ou vídeos)
      const insertPhotoQuery = `
        INSERT INTO photos (submission_id, storage_path, media_type)
        VALUES ($1, $2, $3)
        RETURNING id, storage_path, media_type, created_at;
      `;

      const createdPhotos = [];
      for (const photo of photos) {
        const photoResult = await client.query(insertPhotoQuery, [
          newSubmission.id,
          photo.storage_path,
          photo.media_type || "image", // Fallback para 'image' se vier ausente
        ]);
        createdPhotos.push(photoResult.rows[0]);
      }

      await client.query("COMMIT");

      return {
        ...newSubmission,
        photos: createdPhotos,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};
