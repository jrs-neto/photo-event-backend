import { z } from "zod";

export const createSubmissionSchema = z.object({
  visitor_name: z
    .string()
    .trim()
    .max(100, { message: "O nome deve ter no máximo 100 caracteres." })
    .optional()
    .transform((val) => (val === "" ? undefined : val)),

  visitor_group: z
    .string()
    .trim()
    .max(100, { message: "O grupo deve ter no máximo 100 caracteres." })
    .optional()
    .transform((val) => (val === "" ? undefined : val)),

  message: z
    .string()
    .trim()
    .max(500, { message: "A mensagem deve ter no máximo 500 caracteres." })
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

export const validateSubmission = (req, res, next) => {
  // 1. Valida se ao menos um arquivo foi recebido pelo Multer
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      error: "É necessário enviar pelo menos uma foto.",
    });
  }

  // 2. Valida o corpo do formulário (req.body)
  const result = createSubmissionSchema.safeParse(req.body);

  if (!result.success) {
    // Usando result.error.issues (padrão oficial da API do Zod v3+)
    const formattedErrors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return res.status(400).json({
      errors: formattedErrors,
    });
  }

  // Substitui req.body pelos dados validados e sanitizados
  req.body = result.data;
  next();
};
