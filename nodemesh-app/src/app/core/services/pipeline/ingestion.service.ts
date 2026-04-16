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

1. "single_choice" - Selección Única (Recordar): Aislar una verdad absoluta entre distractores. Ejemplo: "¿Estructura por defecto en PostgreSQL para un índice? B-Tree".
2. "multi_choice" - Selección Múltiple (Comprender): Exige conocer el panorama completo; cero suerte. Ejemplo: "Métodos HTTP idempotentes (GET, PUT, DELETE, HEAD)".
3. "cloze_deletion" - Completar Espacios (Aplicar): Memoria muscular para sintaxis o fórmulas. Ejemplo: "Comando para deshacer commit manteniendo cambios en stage: git reset --soft HEAD~1".
4. "output_prediction" - Predicción de Salida (Aplicar): Forzar ejecución mental (compilador humano). Ejemplo: "Output de setTimeout vs Promise microtask queue".
5. "ordering" - Ordenamiento Lógico (Analizar): Entender causalidad y ciclos de vida. Ejemplo: "Ordena el Three-way handshake de TCP (SYN, SYN-ACK, ACK)".
6. "anomaly_detection" - Detección de Anomalías (Analizar): Detectar fallos lógicos ocultos que sí compilan (Requiere IA). Ejemplo: "Captura de variable en closure dentro de un loop".
7. "optimization" - Optimización de Código (Evaluar): Refactorizar hacia la eficiencia matemática (Requiere IA). Ejemplo: "Refactorizar búsqueda O(n2) a O(n) usando Hash Maps".
8. "case_analysis" - Análisis de Casos (Crear): Diseño de sistemas y evaluación de trade-offs (Requiere IA). Ejemplo: "Mitigar colapso de DB por lecturas masivas en Black Friday".
9. "feynman_synthesis" - Síntesis de Feynman (Maestría): Transferencia de conocimiento sin jerga (Requiere IA). Ejemplo: "Explica Hashing vs Encriptación sin usar jerga abstracta".

REGLAS ESTRUCTURALES:
Reresponde SOLO con un array JSON válido. Cada objeto DEBE seguir este esquema:
{
  "id_temp": "string_unico",
  "tipo_reto": "tipo_del_1_al_9",
  "requiere_ia": boolean,
  "contexto": "Contexto técnico breve",
  "pregunta": "¿Qué...?",
  "opciones": ["A", "B", "C", "D"] o null,
  "retroalimentaciones_opciones": {
     "A": "Justificación técnica directa por qué es A",
     "B": "Justificación técnica directa por qué no es B",
     "C": "...",
     "D": "..."
  },
  "respuesta_esperada": "string",
  "justificacion_correcta": "Explicación detallada de por qué la respuesta es correcta",
  "justificacion_incorrecta": "Explicación de por qué otras aproximaciones fallarían o qué error común evitar",
  "pista": "Pista técnica directa"
}

- "requiere_ia" es true obligatoriamente para los tipos 6, 7, 8 y 9.
- "opciones" es null para tipos que no sean choice o ordering.
- "retroalimentaciones_opciones": DEBE incluir una justificación técnica para CADA opción.
- PROHIBIDO usar preguntas retóricas. Tono técnico, preciso y desafiante (Nivel Senior).
- El campo "pista" es OBLIGATORIO.
- Tono técnico, preciso y desafiante (Nivel Senior).`;

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

    public parseAiResponse(rawText: string, sourceName: string): NodeChallenge[] {
        const firstBracket = rawText.indexOf('[');
        const firstBrace = rawText.indexOf('{');
        const startIdx = (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) ? firstBracket : firstBrace;
        
        const lastBracket = rawText.lastIndexOf(']');
        const lastBrace = rawText.lastIndexOf('}');
        const endIdx = (lastBracket !== -1 && (lastBrace === -1 || lastBracket > lastBrace)) ? lastBracket : lastBrace;

        if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
            throw new Error('No se pudo extraer el JSON de la respuesta de la IA.');
        }

        let parsed: any;
        try {
            const jsonText = rawText.substring(startIdx, endIdx + 1);
            parsed = JSON.parse(jsonText);
        } catch {
            throw new Error('El JSON retornado por la IA no es válido.');
        }

        let nodesArray = [];
        let defaultDifficulty = 'Aprendiz';

        if (parsed.nodos && Array.isArray(parsed.nodos)) {
            nodesArray = parsed.nodos;
            if (parsed.metadata?.nivel_exigido) {
                defaultDifficulty = parsed.metadata.nivel_exigido;
            }
        } else if (Array.isArray(parsed)) {
            nodesArray = parsed;
        } else {
            throw new Error('La IA retornó un formato inesperado (se esperaba un array o un objeto con prop "nodos").');
        }

        if (nodesArray.length === 0) {
            throw new Error('La IA retornó un array de nodos vacío.');
        }

        const now = new Date();

        return nodesArray.map((item: any) => ({
            id_temp: item.id_temp || `node_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            tipo_reto: (item.tipo_reto || item.type) as ChallengeType,
            requiere_ia: !!item.requiere_ia,
            contexto: item.contexto || '',
            pregunta: item.pregunta || item.question || '',
            opciones: Array.isArray(item.opciones) ? item.opciones : (Array.isArray(item.options) ? item.options : null),
            retroalimentaciones_opciones: item.retroalimentaciones_opciones || {},
            respuesta_esperada: item.respuesta_esperada || item.expectedAnswer || '',
            justificacion_correcta: item.justificacion_correcta || '',
            justificacion_incorrecta: item.justificacion_incorrecta || '',
            pista: item.pista || 'Analiza el contexto detalladamente.',
            dificultad: item.dificultad || defaultDifficulty,
            createdAt: now,
            nextReviewDate: now
        }));
    }
}
