import { CategoryTree, TreePath, FindResult, AnalysisResult } from '../index';
import { CategoryAnomaly, CategoryErrorCode } from '../domain/errors';

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

  analyzeTree(rawTree: unknown[]): AnalysisResult {
    const anomalies: CategoryAnomaly[] = [];
    const activePaths: TreePath[] = [];
    const seenIds = new Set<string>();
    const pathRefs = new Set<unknown>();
    let total = 0, active = 0, inactive = 0, maxDepth = 0;

    const traverse = (nodes: unknown[], depth: number, activePath: string[]): void => {
      for (const raw of nodes) {
        if (raw === null || raw === undefined) {
          anomalies.push({ code: CategoryErrorCode.NULL_CHILD, message: 'Null or undefined child' });
          continue;
        }

        if (typeof raw !== 'object' || Array.isArray(raw)) {
          anomalies.push({ code: CategoryErrorCode.INVALID_NODE, message: `Expected object, got ${typeof raw}` });
          continue;
        }

        if (pathRefs.has(raw)) {
          anomalies.push({ code: CategoryErrorCode.CYCLE_DETECTED, message: 'Circular reference detected' });
          continue;
        }

        const n = raw as Record<string, unknown>;
        const id = typeof n.id === 'string' && n.id.trim() !== '' ? n.id : undefined;
        const name = typeof n.name === 'string' && n.name.trim() !== '' ? n.name : undefined;
        const isActive = n.active === true;
        const subs = n.subcategories;

        if (!id) {
          anomalies.push({ code: CategoryErrorCode.INVALID_ID, message: 'Missing or invalid id' });
        } else if (seenIds.has(id)) {
          anomalies.push({ code: CategoryErrorCode.DUPLICATE_ID, nodeId: id, message: `Duplicate id: "${id}"` });
        } else {
          seenIds.add(id);
        }

        if (!name) {
          anomalies.push({ code: CategoryErrorCode.INVALID_NAME, nodeId: id, message: 'Missing or empty name' });
        }

        if (subs !== undefined && subs !== null && !Array.isArray(subs)) {
          anomalies.push({ code: CategoryErrorCode.INVALID_SUBCATEGORIES, nodeId: id, message: 'subcategories must be an array' });
        }

        total++;
        maxDepth = Math.max(maxDepth, depth);
        isActive ? active++ : inactive++;

        if (Array.isArray(subs)) {
          const nextPath = isActive && name ? [...activePath, name] : activePath;
          const hasActiveChild = (subs as unknown[]).some(
            c => c !== null && typeof c === 'object' && !Array.isArray(c) && (c as Record<string, unknown>).active === true,
          );

          if (isActive && name && !hasActiveChild) {
            activePaths.push(nextPath);
          }

          pathRefs.add(raw);
          traverse(subs as unknown[], depth + 1, nextPath);
          pathRefs.delete(raw);
        } else if (isActive && name) {
          activePaths.push([...activePath, name]);
        }
      }
    };

    traverse(rawTree, 0, []);

    return {
      activePaths: activePaths.sort((a, b) => a.join('/').localeCompare(b.join('/'))),
      counts: { total, active, inactive },
      maxDepth,
      anomalies,
    };
  }
}
