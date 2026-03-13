User Flows: NodeMesh Cognitive Forge
Este documento describe las trayectorias críticas del usuario y los procesos técnicos subyacentes que garantizan la soberanía de datos y el rigor pedagógico.

1. Matriz de Flujos Principales
ID | Flujo | Iniciador (Trigger) | Proceso Técnico (Under the hood) | Salida / Estado Final (Output)
---|---|---|---|---
F1 | Inicialización de Bóveda | Primer ingreso del usuario. | OAuth 2.0 -> Obtención de UID -> Creación de DB en IndexedDB con nombre basado en el hash del UID. | Entorno local listo y aislado del Usuario B.
F2 | Configuración BYOK | Usuario ingresa API Key. | Web Crypto API cifra la llave usando el UID como semilla -> Almacenamiento en Vault local. | IA habilitada sin que la Key toque el servidor.
F3 | Compilación de Prompt | Selección de Tema, Nivel y N° de Nodos en el Command Center. | El sistema ensambla un System Prompt que incluye la estructura JSON estricta. Se inyecta en el portapapeles. | Usuario listo para ir a un LLM externo y pegar la instrucción.
F4 | Parseo de Payload | Usuario hace Ctrl+V (Pegar JSON) en el Command Center. | Intercepción del evento paste -> Validación estricta -> Sanitización -> Inserción en IndexedDB. | Nodos guardados. El Bento Grid se actualiza con el nuevo módulo.
F5 | Ejecución de Simulación | Clic en un Módulo o en "Nodos en Degradación". | Cambio de estado de UI a Modo Zen -> Lectura de IndexedDB -> Renderizado de retos uno a uno. | Sesión de estudio activa (Fricción Cognitiva).
F6 | Auditoría BYOK (El Juez) | Usuario envía respuesta/código al reto. | Envío de (Respuesta + Contexto) al LLM vía la API Key local descifrada -> Comparación lógica -> Generación de Feedback. | Calificación del Nodo y Feedback técnico renderizado.
F7 | Actualización de Curva | Cierre de la vista de auditoría (F6). | El motor SM-2 toma la calificación de la IA y calcula el nuevo Interval y ReviewDate -> Update en IndexedDB. | Nodo programado matemáticamente para el futuro.
F8 | Sincronización (Opcional) | Clic en "Backup Cloud". | Serialización de la DB local -> Cifrado AES-256 en cliente -> Upload de Blob a Storage. | Respaldo de seguridad "Zero-Knowledge".

2. Diagramas de Flujo Detallados
2.1 Flujo de Identidad y Aislamiento (F1)
graph TD
    A[Usuario llega] --> B{¿Sesión activa?}
    B -- No --> C[Clic Login con Google]
    C --> D[Validación OAuth 2.0]
    D --> E[Obtención de UID]
    E --> F[Generar Hash de UID]
    F --> G[Abrir/Crear IndexedDB con nombre hash]
    G --> H[Entorno Listo y Aislado]

2.2 Ciclo de la Forja (F3 -> F4 -> F5 -> F6)
graph LR
    I[Selección Config] --> J[Inyectar Prompt en Clipboard]
    J --> K[LLM Externo: ChatGPT/Claude]
    K --> L[Pegar Payload JSON]
    L --> M[(Guardar en IndexedDB)]
    M --> N[Simulador: Modo Zen]
    N --> O[Auditoría IA: Feedback Lógico]
    O --> P[Algoritmo SM-2: Reprogramación]

3. Estados de la Interfaz (State Machine)
GUEST: Sin autenticar. Solo acceso a landing.
UNLOCKED: Autenticado pero sin API Key configurada.
READY: Bóveda inicializada y con API Key activa.
FORGING: Simulador activo, bloqueando distracciones (Modo Zen).
AUDITING: Procesando respuesta del usuario con la IA.