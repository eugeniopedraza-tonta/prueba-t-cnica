import { CategoryService } from '../../src/services/category.service';
import { CategoryTree } from '../../src/domain/category';

describe('CategoryService — Fase 1: getActiveLeafPaths', () => {
  const service = new CategoryService();

  it('retorna array vacío cuando el árbol está vacío', () => {
    expect(service.getActiveLeafPaths([])).toEqual([]);
  });

  it('retorna path de un nodo raíz activo sin hijos', () => {
    const tree: CategoryTree[] = [
      { id: '1', name: 'Electronics', active: true, subcategories: [] },
    ];
    expect(service.getActiveLeafPaths(tree)).toEqual([['Electronics']]);
  });

  it('retorna path completo en árbol anidado', () => {
    const tree: CategoryTree[] = [
      {
        id: '1', name: 'Electronics', active: true,
        subcategories: [
          { id: '2', name: 'Phones', active: true, subcategories: [] },
        ],
      },
    ];
    expect(service.getActiveLeafPaths(tree)).toEqual([['Electronics', 'Phones']]);
  });

  it('omite nodos raíz inactivos', () => {
    const tree: CategoryTree[] = [
      { id: '1', name: 'Electronics', active: false, subcategories: [] },
      { id: '2', name: 'Books', active: true, subcategories: [] },
    ];
    expect(service.getActiveLeafPaths(tree)).toEqual([['Books']]);
  });

  it('omite el subárbol completo cuando el padre es inactivo', () => {
    const tree: CategoryTree[] = [
      {
        id: '1', name: 'Electronics', active: false,
        subcategories: [
          { id: '2', name: 'Phones', active: true, subcategories: [] },
        ],
      },
    ];
    expect(service.getActiveLeafPaths(tree)).toEqual([]);
  });

  it('trata como hoja un nodo activo cuyos hijos son todos inactivos', () => {
    const tree: CategoryTree[] = [
      {
        id: '1', name: 'Electronics', active: true,
        subcategories: [
          { id: '2', name: 'Phones', active: false, subcategories: [] },
        ],
      },
    ];
    expect(service.getActiveLeafPaths(tree)).toEqual([['Electronics']]);
  });

  it('ordena múltiples paths alfabéticamente', () => {
    const tree: CategoryTree[] = [
      { id: '1', name: 'Zapatos', active: true, subcategories: [] },
      { id: '2', name: 'Alimentos', active: true, subcategories: [] },
      { id: '3', name: 'Muebles', active: true, subcategories: [] },
    ];
    expect(service.getActiveLeafPaths(tree)).toEqual([
      ['Alimentos'],
      ['Muebles'],
      ['Zapatos'],
    ]);
  });

  it('ordena paths anidados alfabéticamente por segmento', () => {
    const tree: CategoryTree[] = [
      {
        id: '1', name: 'Electronics', active: true,
        subcategories: [
          { id: '3', name: 'Tablets', active: true, subcategories: [] },
          { id: '2', name: 'Phones', active: true, subcategories: [] },
        ],
      },
    ];
    expect(service.getActiveLeafPaths(tree)).toEqual([
      ['Electronics', 'Phones'],
      ['Electronics', 'Tablets'],
    ]);
  });

  it('maneja árbol con múltiples ramas y mezcla activo/inactivo', () => {
    const tree: CategoryTree[] = [
      {
        id: '1', name: 'A', active: true,
        subcategories: [
          { id: '2', name: 'A1', active: true, subcategories: [] },
          { id: '3', name: 'A2', active: false, subcategories: [] },
        ],
      },
      {
        id: '4', name: 'B', active: true,
        subcategories: [
          { id: '5', name: 'B1', active: true, subcategories: [] },
        ],
      },
    ];
    expect(service.getActiveLeafPaths(tree)).toEqual([
      ['A', 'A1'],
      ['B', 'B1'],
    ]);
  });
});
