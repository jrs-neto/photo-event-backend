import jwt from "jsonwebtoken";

export const adminAuthService = {
  async login({ email, password }) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminEmail || !adminPassword || !jwtSecret) {
      throw new Error("Configurações de autenticação ausentes no servidor.");
    }

    // Validação direta das credenciais contra variáveis de ambiente
    if (email !== adminEmail || password !== adminPassword) {
      const error = new Error("Credenciais inválidas.");
      error.statusCode = 401;
      throw error;
    }

    // Geração do token JWT com validade de 1 hora
    const token = jwt.sign({ email: adminEmail, role: "admin" }, jwtSecret, { expiresIn: "1h" });

    return { token };
  },
};
