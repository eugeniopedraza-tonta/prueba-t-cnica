# Prueba Técnica — Backend Developer

## Ejecución

```bash
npm install
npm test
```

Para correr solo una fase:

```bash
npx jest tests/phase1 --no-coverage
npx jest tests/phase2 --no-coverage
npx jest tests/phase3 --no-coverage
```

## Fases completadas

### Fase 1 — Active Leaf Paths
`CategoryService.getActiveLeafPaths(tree)` retorna todos los paths desde la raíz hasta hojas activas, ordenados alfabéticamente. Se omiten nodos inactivos y sus subárboles completos.

### Fase 2 — Find by ID
`CategoryService.findById(tree, id)` realiza búsqueda DFS en todo el árbol y retorna `{ node, path, depth, parentId, isLeaf }`. Encuentra cualquier nodo independientemente de su estado activo.

### Fase 3 — Analyze & Report Anomalies
`CategoryService.analyzeTree(rawTree)` acepta datos potencialmente malformados (`unknown[]`) y retorna resultado parcial + lista de anomalías detectadas. Continúa procesando nodos válidos aunque encuentre errores.

**Anomalías detectadas:** `NULL_CHILD`, `INVALID_NODE`, `CYCLE_DETECTED`, `INVALID_ID`, `DUPLICATE_ID`, `INVALID_NAME`, `INVALID_SUBCATEGORIES`

**Complejidad:** O(n) tiempo y espacio — cada nodo se visita una vez. La detección de ciclos usa un `Set` de referencias del path actual, lo que evita loops infinitos sin necesidad de marcar nodos globalmente.

## Arquitectura

```
src/
├── domain/
│   ├── category.ts   # Category, CategoryTree, TreePath, FindResult, AnalysisResult
│   └── errors.ts     # CategoryErrorCode, CategoryAnomaly
├── services/
│   └── category.service.ts  # Lógica de negocio
└── index.ts          # API pública del módulo

tests/
├── phase1/
├── phase2/
└── phase3/
```

Dos capas: **Domain** (tipos) y **Service** (lógica de negocio). El árbol se pasa como parámetro a cada método — sin estado almacenado, sin repositorio.

## Decisiones principales

- **`Category` vs `CategoryTree`**: `Category` es la entidad plana (id, name, active). `CategoryTree` extiende `Category` agregando `subcategories`. Permite usar `Category` en resultados donde no se necesita la estructura del árbol.

- **Sin repositorio**: Las operaciones son funciones puras sobre datos en memoria pasados como parámetro. El patrón repositorio no aplica sin una fuente de datos externa.

- **`isLeaf` estructural**: Un nodo es hoja si `subcategories.length === 0`, independientemente de si sus hijos están activos. Es una propiedad del árbol, no del estado.

- **`findById` busca nodos inactivos**: Es una búsqueda estructural por ID, no una consulta de nodos activos como en Fase 1.

- **`TreePath = string[]`**: Los paths se representan como arrays de nombres para facilitar el procesamiento programático.

- **`analyzeTree` recibe `unknown[]`**: La firma refleja la realidad — Phase 3 existe precisamente para manejar datos malformados. Las otras fases mantienen `CategoryTree[]` porque asumen datos válidos.

- **Resultado parcial en Phase 3**: Ante anomalías se sigue procesando. Los conteos y paths reflejan los nodos válidos alcanzables.

## Supuestos

- Un nodo activo cuyos hijos son todos inactivos se trata como hoja en Fase 1 (es el final de un path activo válido).
- El ordenamiento alfabético usa `localeCompare` para manejar correctamente caracteres especiales.
