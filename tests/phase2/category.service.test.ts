import { CategoryService } from '../../src/services/category.service';
import { CategoryTree } from '../../src/domain/category';

describe('CategoryService — Fase 2: findById', () => {
  const service = new CategoryService();

  const tree: CategoryTree[] = [
    {
      id: '1', name: 'Electronics', active: true,
      subcategories: [
        {
          id: '2', name: 'Phones', active: true,
          subcategories: [
            { id: '3', name: 'Android', active: true, subcategories: [] },
            { id: '4', name: 'iOS', active: false, subcategories: [] },
          ],
        },
        { id: '5', name: 'Tablets', active: true, subcategories: [] },
      ],
    },
    { id: '6', name: 'Books', active: false, subcategories: [] },
  ];

  it('retorna null cuando el ID no existe', () => {
    expect(service.findById(tree, 'no-existe')).toBeNull();
  });

  it('encuentra un nodo raíz — depth 0, parentId null', () => {
    const result = service.findById(tree, '1');
    expect(result).toMatchObject({
      node: { id: '1', name: 'Electronics', active: true },
      path: ['Electronics'],
      depth: 0,
      parentId: null,
      isLeaf: false,
    });
  });

  it('encuentra un nodo de segundo nivel — depth 1, parentId correcto', () => {
    const result = service.findById(tree, '2');
    expect(result).toMatchObject({
      node: { id: '2', name: 'Phones', active: true },
      path: ['Electronics', 'Phones'],
      depth: 1,
      parentId: '1',
      isLeaf: false,
    });
  });

  it('encuentra un nodo profundo — depth 2, path completo', () => {
    const result = service.findById(tree, '3');
    expect(result).toMatchObject({
      node: { id: '3', name: 'Android', active: true },
      path: ['Electronics', 'Phones', 'Android'],
      depth: 2,
      parentId: '2',
      isLeaf: true,
    });
  });

  it('isLeaf true para nodo sin subcategorías', () => {
    const result = service.findById(tree, '5');
    expect(result?.isLeaf).toBe(true);
  });

  it('isLeaf false para nodo con subcategorías aunque sean inactivas', () => {
    const result = service.findById(tree, '2');
    expect(result?.isLeaf).toBe(false);
  });

  it('encuentra nodos inactivos también', () => {
    const result = service.findById(tree, '4');
    expect(result).toMatchObject({
      node: { id: '4', name: 'iOS', active: false },
      path: ['Electronics', 'Phones', 'iOS'],
      depth: 2,
      parentId: '2',
      isLeaf: true,
    });
  });

  it('encuentra nodo raíz inactivo', () => {
    const result = service.findById(tree, '6');
    expect(result).toMatchObject({
      node: { id: '6', name: 'Books', active: false },
      path: ['Books'],
      depth: 0,
      parentId: null,
      isLeaf: true,
    });
  });
});
