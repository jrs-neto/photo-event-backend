import app from "./app.js";
import pool from "./config/database.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await pool.query("SELECT NOW()");
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Falha ao iniciar o servidor devido a erro no banco:", error);
    process.exit(1);
  }
}

startServer();
