import { Patient, AnalysisResponse } from '../types';
import { SettingsService } from './storage';

export interface AnalyzePatientParams {
  nombre: string;
  identificacion: string;
  motivoConsulta: string;
  enfermedadActual: string;
  fechaAtencion: string;
  edad?: string;
  genero?: string;
  antecedentes?: string;
  signosVitales?: string;
}

export const GeminiService = {
  async analyzeCase(params: AnalyzePatientParams): Promise<AnalysisResponse> {
    const settings = SettingsService.get();
    const apiKeyOverride = settings.customApiKey?.trim() || undefined;

    const response = await fetch('/api/gemini/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        apiKeyOverride,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg =
        errorData.error ||
        `Error del servidor (${response.status}): ${response.statusText}`;
      throw new Error(errorMsg);
    }

    const data: AnalysisResponse = await response.json();
    return data;
  },

  async validateApiKey(apiKey?: string): Promise<{ valid: boolean; message?: string; error?: string }> {
    const settings = SettingsService.get();
    const keyToTest = apiKey ?? settings.customApiKey?.trim();

    try {
      const response = await fetch('/api/gemini/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: keyToTest }),
      });

      const data = await response.json();
      return data;
    } catch (e: any) {
      return {
        valid: false,
        error: e?.message || 'No fue posible conectar con el servidor de validación.',
      };
    }
  },
};
