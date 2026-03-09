Technical Stack & Architecture: NodeMesh
1. Filosofía Arquitectónica: Local-First & BYOK
NodeMesh rompe con el modelo tradicional de cliente-servidor para priorizar la privacidad y el control del usuario.

Local-First: No existe una base de datos centralizada para el contenido. Toda la persistencia de datos (quizzes, historial, progreso) ocurre exclusivamente en el navegador del usuario.

Bring Your Own Key (BYOK): El usuario provee sus propias API Keys de LLMs. La comunicación es directa desde el cliente web hacia los proveedores (Google, Anthropic, etc.), eliminando intermediarios que puedan interceptar los datos.

2. Core Stack (Tecnologías Elegidas)
Capa,Tecnología,Versión,Propósito
Frontend,Angular,18+ (LTS),"Framework SPA para manejar la lógica de la forja, simuladores y algoritmos."
Local Storage,IndexedDB,Dexie.js 4.x,Abstracción de base de datos local para persistencia de Nodos y API Keys.
Identity,OAuth 2.0,Google Login,Identificación sin contraseñas para aislamiento de datos y sincronización.
Testing,Vitest,4.x,Test runner de alto rendimiento para el ciclo TDD y métricas de cobertura.
Infra,Docker,Alpine Nginx,Contenedorización ultra-ligera (<50MB) para despliegue consistente.

3. Estrategia de Seguridad y Privacidad
3.1 Cifrado de Bóveda (BYOK)
Las API Keys nunca se almacenan en texto plano. Se utiliza la Web Crypto API para cifrar las llaves antes de guardarlas en IndexedDB, utilizando el uid de la sesión de Google como parte de la semilla de cifrado.

3.2 Aislamiento de Datos (Multi-tenancy Local)
Para prevenir que el Usuario B acceda a la data del Usuario A en el mismo navegador, el sistema inicializa una base de datos con un nombre derivado del hash del uid del usuario logueado.

4. Flujo de Desarrollo e Integración (CI/CD)
Entorno Local: Node.js 20+ y Angular CLI.

Validación: Cada Commit debe pasar las pruebas unitarias en Vitest antes de ser integrado.

Deploy:

Contenedor: Docker build con Nginx Alpino.

Plataforma: Despliegue automático en Render o Vercel tras superar los tests en la rama main.

5. Protocolo de Comunicación IA
El sistema no utiliza un backend proxy. Las peticiones se realizan mediante el HttpClient de Angular directamente a los endpoints REST de los proveedores de LLM, inyectando la API Key desde la memoria segura del cliente.