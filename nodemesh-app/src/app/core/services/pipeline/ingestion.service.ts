import { Injectable } from '@angular/core';
import { CryptoService } from '../storage/crypto.service';
import { DatabaseService } from '../storage/database.service';
import { NodeChallenge, ChallengeType } from '../../models/node.model';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Configurar el worker de PDF.js para el navegador de forma compatible con Vite
if (typeof Worker !== 'undefined') {
    const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(workerSrc, { type: 'module' });
}

@Injectable({
    providedIn: 'root'
})
export class IngestionService {

    private readonly SYSTEM_PROMPT = `Eres un generador de retos cognitivos para estudio de alto rendimiento.
A partir del texto proporcionado, genera EXACTAMENTE 9 objetos JSON, uno por cada tipo de reto:

1. "definicion_inversa" — Se da la definición, el estudiante debe identificar el concepto.
2. "caso_de_estudio" — Escenario práctico donde se aplica el concepto.
3. "deteccion_de_error" — Fragmento con un error conceptual que el estudiante debe encontrar.
4. "completar_concepto" — Frase incompleta que el estudiante debe completar.
5. "verdadero_falso_justificado" — Afirmación que puede ser V o F, requiere justificación.
6. "conexion_transversal" — Relacionar el concepto con otra disciplina o tema.
7. "pregunta_socratica" — Pregunta abierta que obliga a pensar críticamente.
8. "ordenamiento_logico" — Pasos o conceptos que el estudiante debe ordenar.
9. "analogia_forzada" — El estudiante debe crear o evaluar una analogía del concepto.

REGLAS:
- Responde SOLO con un array JSON válido.
- Cada objeto debe tener: "type", "question", "expectedAnswer", "difficulty" (aprendiz|intermedio|avanzado|senior).
- Las preguntas deben ser desafiantes y específicas al contenido proporcionado.
- NO incluyas explicaciones fuera del JSON.`;

    constructor(
        private cryptoService: CryptoService,
        private dbService: DatabaseService
    ) { }

    async extractTextFromPdf(file: File): Promise<string> {
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

        const sourceId = `src_${Date.now()}`;
        const now = new Date();

        return parsed.map((item: any) => ({
            type: item.type as ChallengeType,
            question: String(item.question || ''),
            expectedAnswer: String(item.expectedAnswer || ''),
            difficulty: item.difficulty || 'intermedio',
            sourceId,
            sourceName,
            createdAt: now,
            nextReviewDate: now
        }));
    }
}
