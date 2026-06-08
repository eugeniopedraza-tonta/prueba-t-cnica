import { CategoryService } from '../../src/services/category.service';
import { CategoryErrorCode } from '../../src/domain/errors';

describe('CategoryService — Fase 3: analyzeTree', () => {
  const service = new CategoryService();

  it('árbol vacío retorna todo en cero', () => {
    const result = service.analyzeTree([]);
    expect(result).toEqual({
      activePaths: [],
      counts: { total: 0, active: 0, inactive: 0 },
      maxDepth: 0,
      anomalies: [],
    });
  });

  it('árbol válido retorna stats correctas sin anomalías', () => {
    const tree = [
      {
        id: '1', name: 'A', active: true,
        subcategories: [
          { id: '2', name: 'A1', active: true, subcategories: [] },
          { id: '3', name: 'A2', active: false, subcategories: [] },
        ],
      },
    ];
    const result = service.analyzeTree(tree);
    expect(result.anomalies).toHaveLength(0);
    expect(result.counts).toEqual({ total: 3, active: 2, inactive: 1 });
    expect(result.maxDepth).toBe(1);
    expect(result.activePaths).toEqual([['A', 'A1']]);
  });

  it('detecta NULL_CHILD cuando hay null en subcategories', () => {
    const tree = [{ id: '1', name: 'A', active: true, subcategories: [null] }];
    const result = service.analyzeTree(tree);
    expect(result.anomalies).toContainEqual(
      expect.objectContaining({ code: CategoryErrorCode.NULL_CHILD }),
    );
  });

  it('detecta INVALID_NODE cuando un hijo no es objeto', () => {
    const tree = [{ id: '1', name: 'A', active: true, subcategories: [42] }];
    const result = service.analyzeTree(tree);
    expect(result.anomalies).toContainEqual(
      expect.objectContaining({ code: CategoryErrorCode.INVALID_NODE }),
    );
  });

  it('detecta INVALID_ID cuando falta el id', () => {
    const tree = [{ name: 'A', active: true, subcategories: [] }];
    const result = service.analyzeTree(tree);
    expect(result.anomalies).toContainEqual(
      expect.objectContaining({ code: CategoryErrorCode.INVALID_ID }),
    );
  });

  it('detecta DUPLICATE_ID cuando el mismo id aparece dos veces', () => {
    const tree = [
      { id: '1', name: 'A', active: true, subcategories: [] },
      { id: '1', name: 'B', active: true, subcategories: [] },
    ];
    const result = service.analyzeTree(tree);
    expect(result.anomalies).toContainEqual(
      expect.objectContaining({ code: CategoryErrorCode.DUPLICATE_ID, nodeId: '1' }),
    );
  });

  it('detecta INVALID_NAME cuando el nombre está vacío', () => {
    const tree = [{ id: '1', name: '', active: true, subcategories: [] }];
    const result = service.analyzeTree(tree);
    expect(result.anomalies).toContainEqual(
      expect.objectContaining({ code: CategoryErrorCode.INVALID_NAME }),
    );
  });

  it('detecta INVALID_SUBCATEGORIES cuando subcategories no es array', () => {
    const tree = [{ id: '1', name: 'A', active: true, subcategories: 'invalid' }];
    const result = service.analyzeTree(tree);
    expect(result.anomalies).toContainEqual(
      expect.objectContaining({ code: CategoryErrorCode.INVALID_SUBCATEGORIES }),
    );
  });

  it('detecta CYCLE_DETECTED ante referencia circular', () => {
    const node: any = { id: '1', name: 'A', active: true, subcategories: [] };
    node.subcategories.push(node);
    const result = service.analyzeTree([node]);
    expect(result.anomalies).toContainEqual(
      expect.objectContaining({ code: CategoryErrorCode.CYCLE_DETECTED }),
    );
  });

  it('sigue procesando nodos válidos aunque haya anomalías', () => {
    const tree = [
      { id: '1', name: 'A', active: true, subcategories: [] },
      null,
      { id: '2', name: 'B', active: false, subcategories: [] },
    ];
    const result = service.analyzeTree(tree);
    expect(result.counts.total).toBe(2);
    expect(result.anomalies).toHaveLength(1);
    expect(result.anomalies[0].code).toBe(CategoryErrorCode.NULL_CHILD);
  });

  it('calcula maxDepth correctamente', () => {
    const tree = [
      {
        id: '1', name: 'A', active: true,
        subcategories: [{
          id: '2', name: 'B', active: true,
          subcategories: [
            { id: '3', name: 'C', active: true, subcategories: [] },
          ],
        }],
      },
    ];
    expect(service.analyzeTree(tree).maxDepth).toBe(2);
  });
});
