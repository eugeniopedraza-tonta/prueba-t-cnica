# AI Usage

Se utilizó **Claude Code** como asistente de programación durante el desarrollo de este reto.

## Cómo se usó

Claude Code actuó como par de programación: generó código, propuso estructuras y explicó trade-offs. Las decisiones de diseño fueron tomadas por el desarrollador tras evaluar cada propuesta.

## Decisiones tomadas por el desarrollador

- Separar `Category` (entidad plana) de `CategoryTree` (nodo con hijos) en lugar de una sola interfaz
- Eliminar la capa repositorio por ser innecesaria para datos en memoria
- Simplificar el ordenamiento de paths usando `join('/').localeCompare` en lugar de comparación segmento a segmento
- No incluir `errors.ts` en Fase 1 por YAGNI — se agregará en Fase 3
- Definir `isLeaf` como propiedad estructural (`subcategories.length === 0`)
- Que `findById` encuentre nodos inactivos (búsqueda estructural, no filtrada)

## Correcciones manuales

- El import en `category.service.ts` fue cambiado de `'../domain/category'` a `'../index'` por el desarrollador
- `jest.config.ts` fue convertido a `jest.config.js` para compatibilidad con Jest 30 sin `ts-node`
- Se corrigió un test de Phase 3 donde el dato de prueba no coincidía con las assertions esperadas (nodo cambiado de `active: false` a `active: true`)
