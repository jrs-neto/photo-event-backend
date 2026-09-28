import { adminAuthService } from "../services/adminAuthService.js";

export const adminAuthController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios." });
      }

      const result = await adminAuthService.login({ email, password });

      return res.status(200).json({
        message: "Login realizado com sucesso.",
        token: result.token,
      });
    } catch (error) {
      if (error.statusCode === 401) {
        return res.status(401).json({ error: error.message });
      }

      console.error("❌ Erro no processo de login administrativo:", error.message);
      return res.status(500).json({ error: "Erro interno ao realizar o login." });
    }
  },
};
