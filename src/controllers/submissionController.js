import { submissionService } from "../services/submissionService.js";

export const submissionController = {
  async create(req, res) {
    try {
      const { visitor_name, visitor_group, message } = req.body;
      const files = req.files;

      const newSubmission = await submissionService.createSubmission({
        visitor_name,
        visitor_group,
        message,
        files,
      });

      return res.status(201).json({
        message: "Submissão realizada com sucesso!",
        data: newSubmission,
      });
    } catch (error) {
      console.error("❌ Erro no processamento da submissão:", error.message);

      return res.status(500).json({
        error: error.message || "Erro interno ao processar a submissão.",
      });
    }
  },
};
