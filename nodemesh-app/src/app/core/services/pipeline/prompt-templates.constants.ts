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
- Single Choice (Aislar verdad absoluta): ${config.matrix.single_choice}
- Multiple Choice (Múltiples opciones verdaderas): ${config.matrix.multi_choice}
- Cloze Deletion (Completar código/texto): ${config.matrix.cloze_deletion}
- Output Prediction (Predecir resultado exacto): ${config.matrix.output_prediction}
- Ordering (Causalidad/Ciclos de vida): ${config.matrix.ordering}
- Anomaly Detection (Detectar fallos lógicos ocultos): ${config.matrix.anomaly_detection}
- Optimization (Complejidad algorítmica y refactorización): ${config.matrix.optimization}
- Case Analysis (Diseño de sistemas / Trade-offs): ${config.matrix.case_analysis}
- Feynman Synthesis (Transferencia sin jerga): ${config.matrix.feynman_synthesis}
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
    ? `\n    "pista_opcional": "Una pista sutil acorde a tu personalidad que destrabe al humano sin revelar la respuesta.",`
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
El único resultado aceptable (OUTPUT) que me debes devolver consta EXCLUSIVAMENTE de 2 bloques JSON estrictos en formato RFC 8259${!config.forzarJsonRaw ? ', encerrados en bloques de markdown `json`' : ' (sin markdown ni identificadores de string envoltura)'}. 

NO añadas salutaciones, reflexiones o comentarios fuera de los bloques JSON. TODAS LAS KEYS y VALORES (Strings) DEBEN IR ENTRE COMILLAS DOBLES.

### 1. El JSON de la Carpeta (Tema)
${jsonWrapperStart}{
  "folder_id": "fld_uuid_aleatorio",
  "nombre_tema": "${config.tema}",
  "color_tag": "#9FFF22",
  "creado_en": "${new Date().toISOString()}"
}${jsonWrapperEnd}

### 2. El JSON del Quiz (Sesiones) y su Payload Maestro
Para este segundo bloque, debes devolver ESTRICTAMENTE un arreglo JSON de objetos, donde cada objeto representa una pregunta (Nodo) validada y rellenada según tu matriz. 

El modelo de Nodos que DEBES respetar milimétricamente es este:

${jsonWrapperStart}[
  {
    "id_temp": "nodo_1",
    "tipo_reto": "single_choice",
    "requiere_ia": false,
    "contexto": "Aquí va el contexto general, de código o de negocio (claro y específico).",
    "pregunta": "Pregunta técnica concisa.",
    "opciones": [
      "Opcion 1",
      "Opcion 2",
      "Opcion 3",
      "Opcion 4"
    ],
    "respuesta_esperada": "Opcion 1",${pistaKey}
    "justificacion_correcta": "Justificación inmutable (Feedback acorde a tu personalidad cuando respondo bien).",
    "justificacion_incorrecta": "Justificación inmutable (Feedback acorde a tu personalidad cuando fallo)."
  }
]${jsonWrapperEnd}

NOTAS ESTRATÉGICAS DE DATO:
- Campos Condicionales (null): Si el tipo de reto no tiene opciones múltiples (ej: output_prediction, feynman_synthesis, anomaly_detection), el campo "opciones" DEBE viajar como null estrictamente.
- respuesta_esperada: 
  * En retos deterministas simples (single_choice, multi_choice, cloze_deletion, ordering, output_prediction), guarda la Respuesta Exacta.
  * En retos evaluados por IA (anomaly_detection, optimization, case_analysis, feynman_synthesis), guarda el "Criterio Oculto" detallado de evaluación.
- En las preguntas del tipo "ordering", respuesta_esperada debe ser un array con el orden, ej: ["B", "A", "C"].
- justificacion_correcta y justificacion_incorrecta: DEBEN venir ya generadas para ahorrar latencia e inferencia.

¡GENERA LA SALIDA AHORA!`.trim();
};
