import { CategoryTree, TreePath, FindResult } from '../index';

export class CategoryService {
  getActiveLeafPaths(tree: CategoryTree[]): TreePath[] {
    const paths: TreePath[] = [];

    const traverse = (nodes: CategoryTree[], path: string[] = []): void => {
      for (const node of nodes) {
        if (!node.active) continue;
        const next = [...path, node.name];
        const activeKids = node.subcategories.filter(c => c.active);
        activeKids.length === 0 ? paths.push(next) : traverse(activeKids, next);
      }
    };

    traverse(tree);
    return paths.sort((a, b) => a.join('/').localeCompare(b.join('/')));
  }

  findById(tree: CategoryTree[], id: string): FindResult | null {
    const search = (
      nodes: CategoryTree[],
      path: string[],
      depth: number,
      parentId: string | null
    ): FindResult | null => {
      for (const node of nodes) {
        const currentPath = [...path, node.name];

        if (node.id === id) {
          return {
            node: { id: node.id, name: node.name, active: node.active },
            path: currentPath,
            depth,
            parentId,
            isLeaf: node.subcategories.length === 0,
          };
        }

        const result = search(node.subcategories, currentPath, depth + 1, node.id);
        if (result) return result;
      }
      return null;
    };

    return search(tree, [], 0, null);
  }
}
