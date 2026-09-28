import express from "express";
import cors from "cors";
import submissionRoutes from "./routes/submissionRoutes.js";
import adminSubmissionRoutes from "./routes/adminSubmissionRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminPhotoRoutes from "./routes/adminPhotoRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rotas públicas
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin/auth", adminAuthRoutes);

// Rotas administrativas protegidas
app.use("/api/admin/submissions", adminSubmissionRoutes);
app.use("/api/admin/photos", adminPhotoRoutes);

app.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok", timestamp: new Date() });
});

export default app;
