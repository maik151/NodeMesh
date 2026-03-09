export type ChallengeType =
    | 'definicion_inversa'
    | 'caso_de_estudio'
    | 'deteccion_de_error'
    | 'completar_concepto'
    | 'verdadero_falso_justificado'
    | 'conexion_transversal'
    | 'pregunta_socratica'
    | 'ordenamiento_logico'
    | 'analogia_forzada';

export type DifficultyLevel = 'aprendiz' | 'intermedio' | 'avanzado' | 'senior';

export interface NodeChallenge {
    id?: number;
    type: ChallengeType;
    question: string;
    expectedAnswer: string;
    difficulty: DifficultyLevel;
    sourceId: string;
    sourceName: string;
    createdAt: Date;
    nextReviewDate: Date;
}
