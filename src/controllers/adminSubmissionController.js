import { adminSubmissionService } from "../services/adminSubmissionService.js";

// Regex para validação de UUID v4 (36 caracteres hexadecimal formatados)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const adminSubmissionController = {
  async list(req, res) {
    try {
      const pageParam = req.query.page ?? "1";
      const limitParam = req.query.limit ?? "20";

      const page = Number(pageParam);
      const limit = Number(limitParam);

      if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({
          error:
            'Parâmetros de paginação inválidos. "page" e "limit" devem ser inteiros positivos e "limit" não pode exceder 100.',
        });
      }

      const result = await adminSubmissionService.listSubmissions({ page, limit });

      return res.status(200).json(result);
    } catch (error) {
      console.error("❌ Erro na listagem de submissões administrativas:", error.message);
      return res.status(500).json({ error: "Erro interno ao listar submissões." });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      // Validação de UUID no parâmetro antes de consultar o banco
      if (!UUID_REGEX.test(id)) {
        return res.status(400).json({
          error: "O ID informado não é um UUID válido.",
        });
      }

      await adminSubmissionService.deleteSubmission(id);

      return res.status(200).json({
        message: "Submissão e fotos associadas excluídas com sucesso.",
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({ error: error.message });
      }

      console.error(`❌ Erro ao excluir submissão ${req.params.id}:`, error.message);
      return res.status(500).json({ error: "Erro interno ao excluir submissão." });
    }
  },
};
