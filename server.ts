import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    const hasEnvKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({ status: "ok", hasEnvKey });
  });

  // Check / Validate Gemini API Key endpoint
  app.post("/api/gemini/validate-key", async (req, res) => {
    try {
      const customKey = req.body?.apiKey;
      const apiKey = customKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({
          valid: false,
          error: "No se proporcionó ninguna API Key y no hay una configurada en el servidor.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: "Test connection. Reply with JSON {\"status\":\"ok\"}",
        config: {
          responseMimeType: "application/json",
        },
      });

      if (response.text) {
        return res.json({ valid: true, message: "Conexión a Gemini exitosa" });
      } else {
        return res.status(500).json({ valid: false, error: "Respuesta vacía del modelo" });
      }
    } catch (error: any) {
      console.error("Error validando API Key:", error);
      return res.status(500).json({
        valid: false,
        error: error?.message || "Error al autenticar con la API de Gemini",
      });
    }
  });

  // Clinical Analysis with Gemini
  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      const {
        nombre,
        identificacion,
        motivoConsulta,
        enfermedadActual,
        fechaAtencion,
        edad,
        genero,
        antecedentes,
        signosVitales,
        apiKeyOverride,
      } = req.body;

      const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({
          error: "Falta la API Key de Gemini. Ingrésala en Configuración o configúrala en las variables de entorno.",
        });
      }

      if (!motivoConsulta || !enfermedadActual) {
        return res.status(400).json({
          error: "El motivo de consulta y la enfermedad actual son obligatorios para el análisis clínico.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `
Eres un asistente médico clínico experto para apoyo en toma de decisiones médicas.
Analiza la siguiente información de atención médica y genera:
1. Análisis clínico estructurado y exhaustivo (fisiopatología, estado del paciente, correlación de síntomas y severidad).
2. Plan de manejo y tratamiento (conducta terapéutica, farmacología sugerida, medidas no farmacológicas, pruebas diagnósticas complementarias, signos de alarma y pautas de seguimiento).
3. Diagnósticos según la Clasificación Internacional de Enfermedades (CIE-10), incluyendo código CIE-10 exacto, descripción oficial, tipo (Principal o Diferencial) y justificación.
4. Resumen clínico breve para lectura rápida.

INFORMACIÓN DEL PACIENTE:
- Nombre: ${nombre || "No especificado"}
- Identificación (CC): ${identificacion || "No especificada"}
- Fecha de Atención: ${fechaAtencion || "Hoy"}
- Edad / Género: ${edad || "No especificada"} / ${genero || "No especificado"}
- Motivo de Consulta: ${motivoConsulta}
- Enfermedad Actual: ${enfermedadActual}
${antecedentes ? `- Antecedentes Médicos: ${antecedentes}` : ""}
${signosVitales ? `- Signos Vitales / Examen Físico: ${signosVitales}` : ""}

Instrucciones de formato:
- Redacta de forma profesional, clara y médica en español.
- En el análisis, desglosa la evaluación clínica, diagnósticos presuntivos y consideraciones de riesgo.
- En el plan, separa con claridad: Tratamiento Terapéutico, Medicación sugerida (con advertencia de verificación por el médico tratante), Exámenes de apoyo, Signos de Alarma y Recomendaciones.
- Los códigos CIE-10 deben ser reales y precisos (ej. J00, J20.9, K29.7, I10, E11.9, etc.).
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "Eres un especialista médico con amplios conocimientos en semiología, farmacología clínica y codificación CIE-10 internacional. Tu objetivo es brindar un análisis clínico riguroso, estructurado y de alta calidad para médicos tratantes.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              resumenEjecutivo: {
                type: Type.STRING,
                description: "Resumen conciso del caso en 2 a 3 líneas.",
              },
              analisis: {
                type: Type.STRING,
                description:
                  "Análisis clínico detallado del cuadro actual, correlación fisiopatológica, diagnósticos diferenciales y factores de riesgo.",
              },
              plan: {
                type: Type.STRING,
                description:
                  "Plan terapéutico detallado con medidas farmacológicas sugeridas, pruebas diagnósticas, signos de alarma para urgencias y pautas de control.",
              },
              diagnosticosCIE10: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    codigo: {
                      type: Type.STRING,
                      description: "Código CIE-10 (ej. J00, I10, K29.7)",
                    },
                    descripcion: {
                      type: Type.STRING,
                      description: "Nombre oficial o descripción del diagnóstico según CIE-10",
                    },
                    tipo: {
                      type: Type.STRING,
                      description: "'Principal' o 'Diferencial' o 'Secundario'",
                    },
                    justificacion: {
                      type: Type.STRING,
                      description: "Breve justificación médica de por qué aplica este código",
                    },
                  },
                  required: ["codigo", "descripcion", "tipo"],
                },
              },
              recomendacionesAdicionales: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: "Puntos clave de recomendación para el paciente",
              },
              nivelUrgencia: {
                type: Type.STRING,
                description: "'Baja', 'Moderada', 'Alta' o 'Crítica'",
              },
            },
            required: ["resumenEjecutivo", "analisis", "plan", "diagnosticosCIE10"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No se obtuvo respuesta del modelo.");
      }

      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } catch (error: any) {
      console.error("Error en análisis con Gemini:", error);
      return res.status(500).json({
        error: error?.message || "Error al procesar el caso clínico con Gemini",
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor iniciado y escuchando en http://localhost:${PORT}`);
  });
}

startServer();
