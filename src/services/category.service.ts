import { CategoryTree, TreePath } from '../index';

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
}
