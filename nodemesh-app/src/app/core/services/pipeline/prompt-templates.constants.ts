import { DifficultyLevel } from '../../models/node.model';

export type AuditorPersona = 'Socrático' | 'Implacable' | 'Académico';
export type OutputLanguage = 'Español' | 'Inglés';

export interface PromptConfigV2 {
  tema: string;
  nivel: DifficultyLevel;
  totalPreguntas: number;
  auditor: AuditorPersona;
  idioma: OutputLanguage;
  tagsExtra: string;
  adjuntarDocs: boolean;
  incluirPistas: boolean;
  incluirContexto: boolean;
  forzarJsonRaw: boolean;
  matrix: {
    single_choice: number;
    multi_choice: number;
    cloze_deletion: number;
    output_prediction: number;
    ordering: number;
    anomaly_detection: number;
    optimization: number;
    case_analysis: number;
    feynman_synthesis: number;
  };
}

export const buildPromptV2 = (config: PromptConfigV2): string => {
  const matrizTexto = `
- Selección Única (Aislar verdad absoluta): ${config.matrix.single_choice}
- Selección Múltiple (Exige conocer panorama completo): ${config.matrix.multi_choice}
- Completar Espacios (Sintaxis y fórmulas): ${config.matrix.cloze_deletion}
- Predicción de Salida (Compilador humano): ${config.matrix.output_prediction}
- Ordenamiento Lógico (Causalidad y ciclos de vida): ${config.matrix.ordering}
- Detección de Anomalías (Fallos lógicos ocultos): ${config.matrix.anomaly_detection}
- Optimización de Código (Eficiencia y refactorización): ${config.matrix.optimization}
- Análisis de Casos (Arquitectura y trade-offs): ${config.matrix.case_analysis}
- Síntesis de Feynman (Transferencia sin jerga): ${config.matrix.feynman_synthesis}
  `.trim();

  const docsAppend = config.adjuntarDocs 
    ? `\n\n[CONTEXTO EXTERNO ADJUNTO]\nPor favor basa la generación exclusivamente en el contexto o documentación técnica que he adjuntado a este prompt, respetando férreamente sus lineamientos.`
    : '';

  const tagsAppend = config.tagsExtra.trim() 
    ? `\n\n[CONDICIONES EXTRA ESPECÍFICAS (Tags)]\nRespeta además estas reglas de generación provistas por el usuario: ${config.tagsExtra.trim()}`
    : '';

  let auditorDesc = '';
  if (config.auditor === 'Socrático') {
    auditorDesc = 'Socrático: Te guía a la respuesta correcta con preguntas retóricas y pistas lógicas deductivas, sin regalar la respuesta nunca de forma directa.';
  } else if (config.auditor === 'Implacable') {
    auditorDesc = 'Implacable / Estricto: Estilo revisión de código en GitHub Pull Request. Directo, al grano y penalizando severamente las malas prácticas, antipatrones o ineficiencias.';
  } else {
    auditorDesc = 'Académico: Riguroso, utilizando terminología estandarizada de ciencias computacionales, citando RFCs oficiales, documentación y principios fundamentales (SOLID, DRY, etc).';
  }

  const pistaKey = config.incluirPistas 
    ? `\n    "pista": "Una pista técnica directa que guíe al usuario.",`
    : '';

  const jsonWrapperStart = config.forzarJsonRaw ? '' : '```json\n';
  const jsonWrapperEnd = config.forzarJsonRaw ? '' : '\n```';

  return `
Ejerces el rol de Arquitecto Técnico Principal y Diseñador Instruccional Senior.
Tu objetivo es generar exactamente ${config.totalPreguntas} "Nodos de Desafío" (Preguntas técnicas) sobre el tema "${config.tema}" orientados a evaluar y subir el nivel de un desarrollador ${config.nivel}.
El contenido debe generarse estrictamente en idioma: ${config.idioma.toUpperCase()}.

Personalidad del Auditor para Justificaciones:
Adopta la siguiente personalidad al redactar "justificacion_correcta", "justificacion_incorrecta" y pistas:
${auditorDesc}
${docsAppend}${tagsAppend}

## REGLAS DE ORO
1. La dificultad de las preguntas DEBE corresponder a un desarrollador ${config.nivel}.
2. Cada pregunta debe ser clara, concisa y plantear un escenario o problema sumamente específico (nada de preguntas vagas o de relleno genérico).
3. ESTRUCTURA DE LA MATRIZ: De las ${config.totalPreguntas} preguntas, la distribución de "tipo_reto" es la siguiente:
${matrizTexto}

## REQUISITOS DEL PAYLOAD DE RESPUESTA
El único resultado aceptable (OUTPUT) que me debes devolver es UN SOLO OBJETO JSON ESTRICTO encapsulado en un bloque de código markdown \`json\`${config.forzarJsonRaw ? ' (omite el bloque markdown si se solicitó JSON RAW)' : ''}.

### Estructura Maestra (Payload Único)
\`\`\`json
{
  "metadata": {
    "version": "1.1",
    "signature": "nodemesh-v1",
    "tema_objetivo": "${config.tema}",
    "nivel_exigido": "${config.nivel}",
    "auditor_persona": "${config.auditor}"
  },
    "folder": {
      "folder_id": "uuid_aleatorio",
      "nombre_tema": "${config.tema}",
      "color_tag": "#9FFF22"
    },
    "nodos": [
      {
        "id_temp": "nodo_1",
        "tipo_reto": "DEBE ser uno de: single_choice, multi_choice, cloze_deletion, output_prediction, ordering, anomaly_detection, optimization, case_analysis, feynman_synthesis",
        "requiere_ia": false,${config.incluirContexto ? '\n        "contexto": "...",' : ''}
        "pregunta": "...",
        "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
        "retroalimentaciones_opciones": {
           "Opción A": "Explica la lógica técnica de por qué esta opción es CORRECTA. PROHIBIDO USAR SIGNOS DE INTERROGACIÓN.",
           "Opción B": "Explica el error conceptual o técnico de por qué esta opción es INCORRECTA. PROHIBIDO USAR SIGNOS DE INTERROGACIÓN.",
           "Opción C": "...",
           "Opción D": "..."
        },
        "respuesta_esperada": "..."${config.incluirPistas ? ',\n        "pista": "Pista técnica directa (Sin signos de interrogación)."' : ''}
      }
  ]
}
\`\`\`

NOTAS ESTRATÉGICAS DE DATO:
- Tono de Retroalimentación: Queda ESTRICTAMENTE PROHIBIDO usar preguntas retóricas (ej: "¿No crees que...?", "¿Por qué...?", "¿Y si...?"). Las retroalimentaciones DEBEN ser afirmaciones directas, pedagógicas y técnicas. PROHIBIDO EL USO DE SIGNOS DE INTERROGACIÓN (?) en cualquier justificación.
- Reglas para "cloze_deletion": El campo "pregunta" debe usar exactamente seis guiones bajos (______) en el lugar de la palabra a completar. Jamás utilices llaves {{}}. Además, DEBES proporcionar siempre 4 "opciones" válidas (1 correcta, 3 distractores), el array de opciones JAMÁS debe ser null.
${config.incluirPistas ? '- campo "pista": Es OBLIGATORIO. Siempre debe viajar con información útil.\n' : ''}- Campos Condicionales (null): Si el tipo de reto no tiene opciones múltiples (ej: output_prediction, feynman_synthesis, anomaly_detection), el campo "opciones" DEBE viajar como null. Para cloze_deletion, single_choice, multi_choice y ordering, el campo "opciones" DEBE tener un array de strings.
- respuesta_esperada: 
  * En retos deterministas simples (single_choice, multi_choice, cloze_deletion, ordering, output_prediction), guarda la Respuesta Exacta.
  * En retos evaluados por IA (anomaly_detection, optimization, case_analysis, feynman_synthesis), guarda el "Criterio Oculto" detallado de evaluación.
- Para "ordering": El campo "respuesta_esperada" DEBE ser un array de strings que contenga las opciones en el orden cronológico o lógico exacto (ej: ["Evento A", "Evento B", "Evento C"]).
- justificacion_correcta y justificacion_incorrecta: DEBEN venir ya generadas para ahorrar latencia e inferencia.

¡GENERA LA SALIDA AHORA!`.trim();
};
