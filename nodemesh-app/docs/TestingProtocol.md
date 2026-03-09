Protocolo de Pruebas y Calidad: NodeMesh
1. Filosofía de Desarrollo: TDD (Test-Driven Development)
En NodeMesh, ninguna funcionalidad se implementa sin antes haber definido su prueba de éxito. El ciclo de vida de cada tarea sigue estrictamente el modelo Rojo -> Verde -> Refactorizar.

Metas de Calidad:
Cobertura Mínima: >85% en algoritmos críticos (auth, spaced-repetition, security).

Automatización: Los tests deben ejecutarse en cada commit mediante Vitest.

2. El Ciclo de Commits TDD (GitFlow en Español)
Para mantener una trazabilidad total, cada fase del ciclo TDD requiere un commit específico con un lenguaje claro y descriptivo.

Fase,Tipo de Commit,Estructura del Mensaje (Ejemplo),Propósito Técnico
ROJO,test(modulo):,test(auth): FASE ROJO - definiendo la prueba para derivar el nombre de la DB,Define la intención. El test debe fallar.
VERDE,feat(modulo):,feat(auth): FASE VERDE - implementada lógica mínima para nombrar la DB según UID,El código necesario para que el test pase.
REFACTOR,refactor(modulo):,refactor(auth): FASE REFACTOR - optimizando el hashing de la identidad del usuario,Mejora la calidad sin cambiar el comportamiento.

3. Herramientas de Auditoría
Runner Principal: Vitest (Velocidad y compatibilidad con ESM).

Interfaz de Usuario: npx vitest --ui para monitoreo visual de la salud de la forja.

Reporte de Cobertura: @vitest/coverage-v8 para auditoría de líneas de código.

4. Tipos de Pruebas en NodeMesh
4.1 Pruebas Unitarias (El Cerebro)
Ubicadas en *.spec.ts. Validan la lógica pura de los servicios de core/.

Ejemplo: Validar que la API Key se cifre correctamente antes de guardarse.

4.2 Pruebas de Integración (La Malla)
Verifican la comunicación entre componentes Smart y los servicios de core/.

Ejemplo: Que al loguearse con Google, el DatabaseService abra la conexión con el nombre de DB correcto.

4.3 Pruebas de Interfaz (La Forja)
Pruebas visuales y de flujo de usuario (Cypress o Vitest Browser Mode).

Ejemplo: Asegurar que el modal de "Liquid Glass" se cierre correctamente tras guardar la API Key.

5. Glosario de Mensajes de Commit Comunes
Para mantener la consistencia en el historial:

chore(env):: Cambios en configuración, instalación de librerías (ej. coverage).

docs(readme):: Actualización de la documentación técnica en /docs.

style(ui):: Cambios visuales que no afectan la lógica (CSS, ajustes de Glassmorphism).

