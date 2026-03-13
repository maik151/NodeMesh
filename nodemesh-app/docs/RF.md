ID | Requerimiento | Descripción y Flujo (UX/Logic) | RNF Vinculado | Estado | Prioridad
---|---|---|---|---|---
AUT-01 | Inicio de Sesión Soberano | Identificación del usuario sin contraseñas. 1. Login OAuth. 2. Validación local. 3. Sesión activa. | ✅ RNF-SEG-01, ✅ RNF-ALF-01 | **TRUE** | Alta 🔴
AUT-02 | Bóveda BYOK (API Key) | Inserción y cifrado de la llave maestra local. 1. Input Key. 2. Test Ligero. 3. Cifrado Web Crypto API. | ✅ RNF-SEG-02, ✅ RNF-SEG-03 | **TRUE** | Alta 🔴
CMD-01 | Compilador de Prompt (Action Block A) | Interfaz generadora de instrucciones para LLMs. 1. Define Nivel/Tema. 2. Compila System Prompt JSON. 3. Copia al portapapeles. | ✅ RNF-UI-01, ✅ RNF-UX-02 | FALSE | Alta 🔴
CMD-02 | Parseador de Payload (Action Block B) | Captura de datos vía Pegado (Paste). 1. Ctrl+V en Command Center. 2. Valida esquema JSON. 3. Guarda en IndexedDB. | ✅ RNF-SEG-03, ✅ RNF-ALF-01 | FALSE | Alta 🔴
CMD-03 | Command Center (Bento Grid) | Terminal principal modular. 1. Layout Bento. 2. Bloques CMD-01/02. 3. Lista "Nodos en Degradación". 4. Heatmap. | ✅ RNF-UX-01, ✅ RNF-UI-01 | FALSE | Alta 🔴
SIM-01 | Terminal de Evaluación (Modo Zen) | Interfaz de aislamiento cognitivo para responder nodos. 1. Inicia módulo. 2. UI Modo Zen. 3. Renderiza tipo de reto. 4. Captura input. | ✅ RNF-UX-02, ✅ RNF-UI-01 | FALSE | Alta 🔴
SIM-02 | Motor de Auditoría BYOK | Auditoría rigorista usando API Key local. 1. Envía respuesta+contexto al LLM. 2. Evaluación lógica. 3. Genera vedericto y justificante. | ✅ RNF-IA-01, ✅ RNF-ALF-01 | FALSE | Alta 🔴
ALG-01 | Spaced Repetition (Algoritmo SM-2) | Matemáticas de retención. 1. Recibe veredicto SIM-02. 2. Calcula Interval/ReviewDate. 3. Actualiza IndexedDB. | ✅ RNF-TDD-01 | FALSE | Alta 🔴
ALG-02 | Auditoría Intercalada (Sprints) | Examen sorpresa mezclando dominios. 1. Busca Nodos en Degradación mixtos. 2. Inicia SIM-01 con cambio de contexto mental. | ✅ RNF-TDD-01 | FALSE | Media 🟡
CFG-01 | Perfil de Rigor del Auditor | Setup de personalidad de la IA correctora. 1. Define Tono (Socrático/Analítico). 2. Guarda en IndexedDB para inyectar en SIM-02. | ✅ RNF-ALF-01 | FALSE | Media 🟡
SYS-01 | Serialización y Backup | Respaldo Zero-Knowledge cifrado. 1. Clic Sincronizar. 2. Cifrado AES-256 local. 3. Upload de Blob a Storage. | ✅ RNF-SEG-02, ✅ RNF-ALF-01 | FALSE | Baja 🟢