export type ChallengeType =
    | 'single_choice'
    | 'multi_choice'
    | 'cloze_deletion'
    | 'output_prediction'
    | 'ordering'
    | 'anomaly_detection'
    | 'optimization'
    | 'case_analysis'
    | 'feynman_synthesis';

export type DifficultyLevel = 'Aprendiz' | 'Intermedio' | 'Avanzado' | 'Senior';

export interface NodeChallenge {
    id?: number;
    id_temp: string;
    tipo_reto: ChallengeType;
    requiere_ia: boolean;
    contexto: string;
    pregunta: string;
    opciones: string[] | null;
    retroalimentaciones_opciones?: Record<string, string>; // NEW: Per-option feedback
    respuesta_esperada: string | string[];
    pista: string; // Mandatorio en el prompt
    folder_id?: string;
    quiz_id?: string;
    justificacion_correcta?: string;
    justificacion_incorrecta?: string;
    nextReviewDate?: Date;
    createdAt?: Date;
}

export interface FolderTheme {
    folder_id: string;
    nombre_tema: string;
    color_tag: string;
    creado_en: string;
    nivel?: string;
    tiempo?: number;
    intentos?: number;
}

export interface QuizSession {
    quiz_id: string;
    folder_id: string;
    titulo_quiz: string;
    dificultad_global: DifficultyLevel;
    auditor_persona?: string;
    estadisticas_globales: {
        intentos: number;
        ultimo_score_porcentaje: number | null;
    };
    ultimo_repaso?: Date;
    creado_en?: Date;
}
