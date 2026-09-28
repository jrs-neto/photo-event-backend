import adminPhotoService from "../services/adminPhotoService.js";

// Regex do padrão UUID v4 utilizado nas rotas administrativas
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class AdminPhotoController {
  async deletePhoto(req, res) {
    try {
      const { id } = req.params;

      if (!id || !UUID_REGEX.test(id)) {
        return res.status(400).json({ error: "ID de foto inválido. Formato UUID esperado." });
      }

      const result = await adminPhotoService.deletePhoto(id);

      return res.status(200).json(result);
    } catch (error) {
      console.error("[AdminPhotoController] Erro:", error.message);

      const statusCode = error.statusCode || 500;
      const message = error.message || "Erro interno do servidor ao excluir a foto.";

      return res.status(statusCode).json({ error: message });
    }
  }
}

export default new AdminPhotoController();
