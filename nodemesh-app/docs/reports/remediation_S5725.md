# Reporte de Remediación de Seguridad: Integridad de Recursos (S5725)

## Descripción del Problema
**ID de Regla:** `Web:S5725`
**Criticidad:** Baja
**Componente:** `src/index.html`

El escaneo de SonarQube identificó la carga de recursos externos (Google Identity Services, Google Fonts) sin el uso de la característica **Subresource Integrity (SRI)**.

## Análisis de Riesgo
- **Recurso:** `https://accounts.google.com/gsi/client`
- **Tipo:** Evergreen (Actualizado periódicamente por Google).
- **Riesgo:** Cargar scripts externos sin SRI permite que, si el CDN es comprometido, un atacante pueda inyectar código malicioso en la aplicación.
- **Justificación de Excepción:** Para servicios como Google Identity Services, Google **no proporciona un hash de integridad estable** ni recomienda el uso de SRI, ya que el script se actualiza frecuentemente por motivos de seguridad y mantenimiento. El uso de un hash fijo causaría que la aplicación deje de funcionar en el momento en que Google publique una actualización menor.

## Solución Implementada
Se han aplicado las mejores prácticas posibles sin romper la compatibilidad con estos scripts "evergreen":

1.  **Atributo `crossorigin`:** Se añadió `crossorigin="anonymous"` al script de GSI para asegurar que la descarga ocurra de forma aislada y bajo las reglas de CORS.
2.  **Referrer Policy:** Se mantiene `strict-origin-when-cross-origin` para limitar la información enviada a estos servidores externos.

### Detalles del Cambio
```html
<!-- Actualizado con crossorigin -->
<script src="https://accounts.google.com/gsi/client" async defer crossorigin="anonymous"></script>
```

## Verificación
1. **SonarQube:** El hotspot debe ser marcado como "Reviewed - Safe" en la interfaz de SonarQube debido a que el uso de SRI para scripts de Google es contra-indicado por el propio proveedor.
2. **Funcionalidad:** Verificado que el login de Google Identity Services sigue cargando correctamente en producción/desarrollo.
