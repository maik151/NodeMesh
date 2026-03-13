ID | Requerimiento | Descripción y Flujo | RNF Vinculado | Estado | Prioridad
---|---|---|---|---|---
AUT-01 | Inicio de Sesión Soberano | Identificación sin contraseñas para sincronizar perfil. | ✅ RNF-SEG-01, ✅ RNF-ALF-01 | **TRUE** | Alta 🔴
AUT-02 | Bóveda BYOK (API Key) | Modal UI para asegurar la llave de la IA localmente. | ✅ RNF-SEG-02, ✅ RNF-SEG-03 | **TRUE** | Alta 🔴
CFG-01 | Perfil y Contexto Dinámico | Setup de personalidad y tono de la IA. | ✅ RNF-ALF-01 | FALSE | Media 🟡
SIM-01 | Setup Taxonomía Bloom | Configuración de nivel (Jr/Sr) y tema. | ✅ RNF-UI-01, ✅ RNF-TDD-02 | **TRUE** | Alta 🔴
SIM-02 | Motor Generador (LLM) | Ensamblado de Prompt y petición al LLM. | ✅ RNF-IA-01, ✅ RNF-SEG-03 | **TRUE** | Alta 🔴
SIM-03 | Simulador & Feynman Inverso | Interfaz de resolución (Modo Zen). | ✅ RNF-UX-02, ✅ RNF-UI-01 | **TRUE** | Alta 🔴
SIM-04 | Auditoría Inmediata | Feedback y calificación del nodo por la IA. | ✅ RNF-UX-02, ✅ RNF-ALF-01 | **TRUE** | Alta 🔴
ALG-01 | Spaced Repetition Engine | Cálculo SM-2 y actualización de fechas. | ✅ RNF-TDD-01 | **TRUE** | Alta 🔴
ALG-02 | Sprints Intercalados | Sesiones de estudio mixto combinando temas. | ✅ RNF-TDD-01 | FALSE | Media 🟡
DSH-01 | Dashboard de Maestría | Panel de KPIs y rachas (Streaks) local-first. | ✅ RNF-UX-01 | **TRUE** | Media 🟡
UXP-01 | Máquina del Tiempo Local | Auto-guardado de sesiones en IndexedDB. | ✅ RNF-ALF-01 | **TRUE** | Baja 🟢
ECO-01 | Exportación Flashcards | Exportar nodos locales a CSV (Anki). | ✅ RNF-ALF-01 | FALSE | Baja 🟢