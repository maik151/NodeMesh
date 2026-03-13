ID | Categoría | Requerimiento No Funcional | Métrica / Criterio de Aceptación | Estándar / Práctica Asociada | Estado
---|---|---|---|---|---
RNF-SEG-01 | Seguridad (Auth) | OAuth 2.0 (Google Login) | Acceso al Command Center vía Google OAuth 2.0. Token validado localmente. | RFC 6749 (OAuth 2.0) | **[HECHO]**
RNF-SEG-02 | Seguridad (BYOK) | Cifrado Local de API Keys | API Key cifrada con AES-GCM 256 (Web Crypto API) en IndexedDB. Nunca toca el servidor. | OWASP HTML5 / Web Crypto | **[HECHO]**
RNF-SEG-03 | Seguridad (Payload) | Validación Estricta de Esquemas | Todo JSON pegado debe pasar por validador estricto. Rechazo en <50ms si el LLM alucina. | Fail-Fast Principle | **[HECHO]**
RNF-SEG-04 | Seguridad (Anti-XSS) | Sanitización de Nodos | El contenido de la IA (justificantes) se purga con DOMPurify antes de inyectarse. | OWASP XSS Prevention | **[HECHO]**
RNF-ALF-01 | Local-First | Persistencia Indexada | Lectura/Escritura en IndexedDB (Dexie.js) en <100ms. Manejo de QuotaExceededError. | W3C IndexedDB API | **[HECHO]**
RNF-IA-01 | IA (Resiliencia) | Timeouts y Retry Pattern | Timeout de 15s al LLM. Exponential Backoff con máx 3 reintentos en errores 429/500. | Resilience4j | **[HECHO]**
RNF-TDD-01 | Calidad (Core) | Cobertura de Lógica Crítica | Algoritmo SM-2 y Validador con >90% de cobertura en pruebas unitarias. | TDD Best Practices | **[HECHO]**
RNF-TDD-02 | Calidad (E2E) | Pruebas de Evaluación | Modo Zen con pruebas E2E asegurando cambio de estado y recepción de auditoría LLM. | Shift-Left Testing | [PENDIENTE]
RNF-INF-01 | Infraestructura | Multi-Stage Docker Build | Angular + Nginx (Alpine). Imagen optimizada a <50MB. | Docker Best Practices | [PENDIENTE]
RNF-UX-01 | UX (Performance) | Carga del Command Center | LCP del Bento Grid inicial en <1.2 segundos en 4G. | Core Web Vitals | **[HECHO]**
RNF-UX-02 | UX (Feedback) | Fricción Cognitiva de UI | Transiciones entre nodos <50ms. Skeleton Loader técnico durante auditoría. | Nielsen Heuristic #1 | **[HECHO]**
RNF-UX-03 | UX (Error Recovery) | Mitigación del Portapapeles | Si el parseo falla, renderizar bloque técnico con corrección exacta para el prompt. | Nielsen Heuristic #9 | **[HECHO]**