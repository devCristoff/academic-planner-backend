import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly ai: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateTechnicalEssay(topic: string): Promise<string> {
    try {
      const prompt = `
Redacta un ensayo investigativo sobre el tema: "${topic}".

Objetivo:
Escribir un texto con estilo universitario, natural y profesional, similar al elaborado por un estudiante con buena capacidad de investigación. El ensayo debe leerse como un documento académico escrito por una persona, evitando el estilo característico de los modelos de IA.

Instrucciones:
- Realiza una búsqueda web para incorporar información reciente, estándares vigentes y conceptos actualizados.
- Explica las ideas mediante párrafos desarrollados y conectados de forma lógica.
- Prioriza el análisis y la explicación antes que las enumeraciones.
- Utiliza listas únicamente cuando sean realmente necesarias (máximo una o dos en todo el documento).
- Evita que cada sección termine siendo una lista de viñetas.
- No repitas definiciones ni frases similares entre apartados.
- Mantén un tono formal, objetivo y técnico.
- Incluye ejemplos solo cuando aporten valor a la explicación.
- No menciones que eres una IA ni describas el proceso de investigación.

Estructura:
1. Introducción (2-3 párrafos)
2. Desarrollo dividido en secciones con subtítulos, donde cada sección tenga varios párrafos explicativos.
3. Conclusión (2-3 párrafos que sinteticen el análisis, sin repetir literalmente el contenido anterior).

Formato de salida:
- Devuelve únicamente Markdown limpio.
- Usa títulos Markdown (##, ###, ####).
- No uses tablas.
- No agregues referencias numeradas dentro del texto.
- No escribas el subtema de intrucción ni conclusión como títulos, solo el contenido de los párrafos.
`;

      this.logger.log(`[Gemini] Iniciando investigación y redacción sobre: ${topic}...`);

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Eres un Ingeniero de Software Senior analítico y preciso. Tu objetivo es redactar ensayos técnicos y reportes de investigación académico,i. Utiliza terminología formal, evita la redundancia y estructura tu respuesta estrictamente en formato Markdown.',
          temperature: 0.3,
          maxOutputTokens: 4096,
          tools: [{ googleSearch: {} }],
        },
      });

      const essay = response.text as string;
      if (!essay) {
        throw new InternalServerErrorException('Gemini returned an empty response');
      }

      this.logger.log(`[Gemini] Ensayo generado exitosamente para: ${topic}`);
      return essay;
    } catch (error) {
      this.logger.error(
        `[Gemini] Error crítico generando ensayo para tema: ${topic}`,
        error instanceof Error ? error.stack : 'Unknown error',
      );
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to generate technical essay');
    }
  }
}
