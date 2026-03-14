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
    respuesta_esperada: string | string[];
    justificacion_correcta: string;
    justificacion_incorrecta: string;
    folder_id?: string;
    quiz_id?: string;
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
    estadisticas_globales: {
        intentos: number;
        ultimo_score_porcentaje: number | null;
    };
}
