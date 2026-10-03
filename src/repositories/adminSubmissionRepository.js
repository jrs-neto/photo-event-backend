import pool from "../config/database.js";

export const adminSubmissionRepository = {
  async findPaginated({ limit, offset }) {
    const query = `
      SELECT 
        s.id,
        s.visitor_name,
        s.visitor_group,
        s.message,
        s.created_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', p.id,
              'storage_path', p.storage_path,
              'media_type', p.media_type,
              'created_at', p.created_at
            )
          ) FILTER (WHERE p.id IS NOT NULL), '[]'
        ) AS photos
      FROM submissions s
      LEFT JOIN photos p ON p.submission_id = s.id
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    const countQuery = `SELECT COUNT(*) AS total FROM submissions;`;

    const [dataResult, countResult] = await Promise.all([pool.query(query, [limit, offset]), pool.query(countQuery)]);

    return {
      submissions: dataResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  },

  async findPhotoPathsBySubmissionId(id) {
    const query = `
      SELECT storage_path 
      FROM photos 
      WHERE submission_id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows.map((row) => row.storage_path);
  },

  async deleteSubmission(id) {
    const query = `
      DELETE FROM submissions 
      WHERE id = $1 
      RETURNING id;
    `;
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  },
};
