User Flows: NodeMesh Cognitive Forge
Este documento describe las trayectorias críticas del usuario y los procesos técnicos subyacentes que garantizan la soberanía de datos y el rigor pedagógico.

1. Matriz de Flujos Principales
ID,Flujo,Iniciador (Trigger),Proceso Técnico (Under the hood),Salida / Estado Final (Output)
F1,Inicialización de Bóveda,Primer ingreso del usuario.,OAuth 2.0 -> Obtención de UID -> Creación de DB en IndexedDB con nombre basado en el hash del UID.,Entorno local listo y aislado del Usuario B.
F2,Configuración BYOK,Usuario ingresa API Key.,Web Crypto API cifra la llave usando el UID como semilla -> Almacenamiento en Vault local.,IA habilitada sin que la Key toque el servidor.
F3,Ingesta de Conocimiento,Subida de PDF o texto plano.,Extracción de texto -> Chunking -> Envío al LLM con el System Prompt de Auditoría.,Objeto JSON con 9 tipos de retos guardado en DB.
F4,Ejecución de Simulación,"Clic en ""Iniciar Forja"".",Cambio de UI a Modo Zen -> Lectura de IndexedDB -> Renderizado de retos secuenciales.,Sesión de estudio activa (Fricción Cognitiva).
F5,Auditoría de Respuesta,Usuario envía respuesta.,"Envío de respuesta a la IA -> Comparación lógica -> Generación de ""Justificante de Error"".",Calificación del Nodo y Feedback técnico.
F6,Actualización de Curva,Cierre de un reto (F5).,El motor SM-2 calcula la nueva ReviewDate -> Update en IndexedDB.,Nodo programado (Spaced Repetition).
F7,Sincronización (Opt),"Clic en ""Backup Cloud"".",Serialización -> Cifrado AES-256 en cliente -> Upload de Blob a Storage.,"Respaldo de seguridad ""Zero-Knowledge""."

2. Diagramas de Flujo Detallados (Lógica de IA)
2.1 Flujo de Identidad y Aislamiento (F1)
Este flujo garantiza que la data de cada usuario sea inaccesible para otros, incluso en el mismo navegador.
graph TD
    A[Usuario llega] --> B{¿Sesión activa?}
    B -- No --> C[Clic Login con Google]
    C --> D[Validación OAuth 2.0]
    D --> E[Obtención de UID]
    E --> F[Generar Hash de UID]
    F --> G[Abrir/Crear IndexedDB con nombre hash]
    G --> H[Entorno Listo y Aislado]


2.2 Ciclo de la Forja (F3 -> F4 -> F5)
Describe la maquinaria desde que entra la información hasta que se audita el conocimiento.

graph LR
    I[PDF/Texto] --> J[IA Parser]
    J --> K[Generar 9 Tipos de Preguntas]
    K --> L[(Guardar en IndexedDB)]
    L --> M[Simulador: Modo Zen]
    M --> N[Respuesta Usuario]
    N --> O[IA Auditor: Justificación Lógica]
    O --> P[Algoritmo SM-2: Próximo Repaso]

3. Estados de la Interfaz (State Machine)
Para cumplir con el RNF-UX-02, el sistema transita entre estos estados:

GUEST: Sin autenticar. Solo acceso a landing.

UNLOCKED: Autenticado pero sin API Key configurada.

READY: Bóveda inicializada y con API Key activa.

FORGING: Simulador activo, bloqueando distracciones (Modo Zen).

AUDITING: Procesando respuesta del usuario con la IA.