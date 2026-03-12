ID	Requerimiento	Descripción y Flujo	RNF Vinculado	Estado	Prioridad
AUT-01	Inicio de Sesión Soberano	"Desc: Identificación del usuario sin contraseñas para sincronizar perfil.


Flujo:

1. Clic ""Login con Google"".

2. Sistema valida OAuth.

3. Genera y valida sesión localmente."	"✅ RNF-SEG-01 (OAuth 2.0)

✅ RNF-ALF-01 (Local-First)"	TRUE	Alta 🔴
AUT-02	Bóveda BYOK (API Key)	"Desc: Modal UI para ingresar y asegurar la llave de la IA.


Flujo:

1. Ingresa API Key de Google/Anthropic.

2. Hace petición de prueba ligera (Test).

3. Cifra y guarda en localStorage."	"✅ RNF-SEG-02 (Cifrado BYOK)

✅ RNF-SEG-03 (Anti-XSS)"	FALSE	Alta 🔴
CFG-01	Perfil y Contexto Dinámico	"Desc: Setup de la personalidad de la Forja.


Flujo:

1. Define Rol (ej. Dev) y Tono (ej. Socrático).

2. Guarda en IndexedDB.

3. Inyecta preferencias en el System Prompt."	✅ RNF-ALF-01 (Persistencia)	FALSE	Media 🟡
SIM-01	Setup Taxonomía Bloom	"Desc: Configuración de la exigencia del simulador.


Flujo:

1. Selecciona Tema o sube PDF.

2. Elige Nivel (Jr/Retención o Sr/Auditoría).

3. Inicia Forja."	"✅ RNF-UI-01 (Dev-Tool Vibe)

✅ RNF-TDD-02 (Pruebas E2E)"	FALSE	Alta 🔴
SIM-02	Motor Generador (LLM)	"Desc: Creación dinámica del examen.


Flujo:

1. Ensambla Prompt Maestro.

2. Petición HTTP al LLM (con API Key descifrada).

3. Sanitiza JSON y renderiza UI."	"✅ RNF-IA-01 (Timeouts/Retry)

✅ RNF-SEG-03 (Sanitización)"	FALSE	Alta 🔴
SIM-03	Simulador & Feynman Inverso	"Desc: Interfaz de resolución (Modo Zen).


Flujo:

1. Muestra el reto cognitivo o código con ""bug"" intencional de la IA.

2. Usuario responde o audita.

3. Transiciona instantáneamente."	"✅ RNF-UX-02 (Fricción)

✅ RNF-UI-01 (Dark Mode)"	FALSE	Alta 🔴
SIM-04	Auditoría Inmediata	"Desc: Feedback, justificante y cierre del nodo.


Flujo:

1. Termina simulador.

2. IA justifica fallos lógicos.

3. Sistema califica el nodo (Acierto/Error)."	"✅ RNF-UX-02 (Velocidad)

✅ RNF-ALF-01 (<100ms)"	FALSE	Alta 🔴
ALG-01	Spaced Repetition Engine	"Desc: Cálculo de la curva del olvido.


Flujo:

1. Recibe calificación del SIM-04.

2. Calcula matemática de próximo repaso.

3. Actualiza fecha en IndexedDB."	✅ RNF-TDD-01 (Cobertura Core)	FALSE	Alta 🔴
ALG-02	Sprints Intercalados	"Desc: Sesiones de estudio mixto (Interleaving).


Flujo:

1. Sistema lee los últimos 3 temas en DB.

2. Genera prompt combinando los dominios.

3. Inicia simulador mixto."	✅ RNF-TDD-01 (Algoritmos)	FALSE	Media 🟡
DSH-01	Dashboard de Maestría	"Desc: Panel principal de KPIs.


Flujo:

1. Carga inicio (LCP < 1.5s).

2. Consulta DB local por nodos a revisar hoy.

3. Dibuja gráficos de rachas (Streaks)."	✅ RNF-UX-01 (Carga Rápida)	FALSE	Media 🟡
UXP-01	Máquina del Tiempo Local	"Desc: Auto-guardado de sesiones.


Flujo:

1. IA genera simulación.

2. Sistema guarda payload en historial local.

3. Usuario puede restaurar si cierra pestaña."	✅ RNF-ALF-01 (IndexedDB)	FALSE	Baja 🟢
ECO-01	Exportación Flashcards	"Desc: Integración con herramientas externas.


Flujo:

1. Clic en ""Exportar Nodos"".

2. Convierte datos locales a .csv compatible con Anki.

3. Descarga archivo."	✅ RNF-ALF-01 (IndexedDB)	FALSE	Baja 🟢