import { Injectable } from '@angular/core';
import { CryptoService } from '../storage/crypto.service';
import { DatabaseService } from '../storage/database.service';
import { NodeChallenge, ChallengeType } from '../../models/node.model';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// La inicialización del worker se movió dentro de la clase para ser perezosa (lazy) y evitar SecurityErrors

@Injectable({
    providedIn: 'root'
})
export class IngestionService {

    private readonly SYSTEM_PROMPT = `Eres la Matriz Maestra de NodeMesh. Tu propósito es transformar texto técnico en una taxonomía de 9 retos cognitivos.
Genera EXACTAMENTE 9 objetos JSON en un array, uno por cada tipo de reto:

1. "single_choice" - Una verdad absoluta entre distractores.
2. "multi_choice" - Selección múltiple de múltiples respuestas correctas.
3. "cloze_deletion" - Completar espacios en blanco (cloze).
4. "output_prediction" - Predecir el resultado exacto de un código.
5. "ordering" - Ordenar pasos lógicos o secuencias.
6. "anomaly_detection" - Identificar fallos lógicos o vulnerabilidades.
7. "optimization" - Refactorizar hacia la eficiencia.
8. "case_analysis" - Evaluación de trade-offs en arquitectura.
9. "feynman_synthesis" - Explicar conceptos complejos sin jerga.

REGLAS ESTRUCTURALES:
Reresponde SOLO con un array JSON válido. Cada objeto DEBE seguir este esquema:
{
  "id_temp": "string_unico",
  "tipo_reto": "tipo_del_1_al_9",
  "requiere_ia": boolean,
  "contexto": "Contexto técnico breve",
  "pregunta": "¿Qué...?",
  "opciones": ["A", "B", "C", "D"] o null si no aplica,
  "respuesta_esperada": "string" o ["array", "de", "strings"],
  "justificacion_correcta": "Retroalimentación positiva detallada",
  "justificacion_incorrecta": "Análisis del error y por qué falló"
}

- "requiere_ia" es true solo para los tipos 6, 7, 8 y 9.
- "opciones" es null para tipos que no sean choice o ordering.
- Mantén un tono técnico, preciso y desafiante (Nivel Senior).`;

    constructor(
        private readonly cryptoService: CryptoService,
        private readonly dbService: DatabaseService
    ) { }

    async extractTextFromPdf(file: File): Promise<string> {
        await this.initPdfWorker();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n';
        }

        return fullText.trim();
    }

    async generateNodes(
        text: string,
        apiKey: string,
        sourceName: string
    ): Promise<NodeChallenge[]> {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{
                    text: `${this.SYSTEM_PROMPT}\n\n--- TEXTO DE ESTUDIO ---\n${text}`
                }]
            }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('[IngestionService] API error:', response.status, errorBody);
            throw new Error(`Error de la API (${response.status}). Verifica tu API Key o intenta más tarde.`);
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            throw new Error('La IA no retornó contenido válido.');
        }

        // Sanitizar la respuesta contra XSS antes de procesar
        const sanitized = this.cryptoService.sanitizeHtml(rawText);

        return this.parseAiResponse(sanitized, sourceName);
    }

    private async initPdfWorker() {
        if (pdfjsLib.GlobalWorkerOptions.workerPort || typeof Worker === 'undefined') return;

        try {
            const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
            const response = await fetch(workerSrc);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(blobUrl, { type: 'module' });
        } catch (error) {
            console.error('[IngestionService] Error al inicializar PDF Worker:', error);
            // Fallback: intentar cargarlo directamente si el fetch falla (poco probable)
            const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
        }
    }

    private parseAiResponse(rawText: string, sourceName: string): NodeChallenge[] {
        // Extraer el array JSON del texto (puede contener markdown backticks)
        const firstBracket = rawText.indexOf('[');
        const lastBracket = rawText.lastIndexOf(']');

        if (firstBracket === -1 || lastBracket === -1 || lastBracket < firstBracket) {
            throw new Error('No se pudo extraer el JSON de la respuesta de la IA.');
        }

        let parsed: any[];
        try {
            const jsonText = rawText.substring(firstBracket, lastBracket + 1);
            parsed = JSON.parse(jsonText);
        } catch {
            throw new Error('El JSON retornado por la IA no es válido.');
        }

        if (!Array.isArray(parsed) || parsed.length === 0) {
            throw new Error('La IA retornó un array vacío o un formato inesperado.');
        }

        const now = new Date();

        return parsed.map((item: any) => ({
            id_temp: item.id_temp || `node_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            tipo_reto: (item.tipo_reto || item.type) as ChallengeType,
            requiere_ia: !!item.requiere_ia,
            contexto: item.contexto || '',
            pregunta: item.pregunta || item.question || '',
            opciones: Array.isArray(item.opciones) ? item.opciones : (Array.isArray(item.options) ? item.options : null),
            respuesta_esperada: item.respuesta_esperada || item.expectedAnswer || '',
            justificacion_correcta: item.justificacion_correcta || '',
            justificacion_incorrecta: item.justificacion_incorrecta || '',
            createdAt: now,
            nextReviewDate: now
        }));
    }
}
