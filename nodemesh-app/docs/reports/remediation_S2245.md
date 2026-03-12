# Reporte de Remediación de Seguridad: PRNG Débil (S2245)

## Descripción del Problema
**ID de Regla:** `typescript:S2245`
**Criticidad:** Media
**Componente:** `NodeMeshBgComponent`

El escaneo de SonarQube identificó el uso de `Math.random()` para la generación de posiciones y velocidades en el componente de fondo animado. Aunque el contexto es puramente visual y no tiene implicaciones directas de seguridad (como la generación de tokens o llaves), el uso de generadores de números pseudo-aleatorios (PRNG) débiles es una práctica desaconsejada en aplicaciones modernas.

## Análisis de Riesgo
- **Impacto:** Bajo. No se manejan datos sensibles en este componente.
- **Riesgo:** Un atacante podría, en teoría, predecir el estado de la animación, lo cual no compromete la integridad de la aplicación.
- **Decisión:** Se procede a la remediación para cumplir con los estándares de calidad "Zero Vulnerabilities" y satisfacer los reportes de seguridad.

## Solución Implementada
Se ha reemplazado `Math.random()` por la **Web Crypto API** (`window.crypto.getRandomValues`).

### Detalles Técnicos
Se implementó un helper `secureRandom()` que genera un número decimal en el rango `[0, 1)` utilizando entropía del sistema:

```typescript
private getRandom(): number {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xFFFFFFFF + 1);
}
```

## Verificación
1. **SonarQube:** El hotspot ha sido marcado como resuelto tras el nuevo análisis.
2. **Funcionalidad:** La animación se mantiene visualmente idéntica y fluida.
3. **Build:** No hay impacto en el tiempo de compilación.
