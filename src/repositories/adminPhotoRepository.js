import pool from "../config/database.js";

class AdminPhotoRepository {
  /**
   * Busca os dados de uma foto pelo seu ID
   */
  async findById(id) {
    const query = `
      SELECT id, submission_id, storage_path, created_at
      FROM photos
      WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  /**
   * Remove o registro de uma foto do PostgreSQL pelo seu ID
   */
  async deleteById(id) {
    const query = `
      DELETE FROM photos
      WHERE id = $1
      RETURNING id, submission_id, storage_path, created_at;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  /**
   * Reinsere uma foto no banco de dados (mecanismo de compensação/rollback)
   */
  async restorePhoto({ id, submission_id, storage_path, created_at }) {
    const query = `
      INSERT INTO photos (id, submission_id, storage_path, created_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING;
    `;
    await pool.query(query, [id, submission_id, storage_path, created_at]);
  }
}

export default new AdminPhotoRepository();
