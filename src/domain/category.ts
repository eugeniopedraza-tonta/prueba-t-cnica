import { CategoryAnomaly } from './errors';

export interface Category {
    id: string;
    name: string;
    active: boolean;
}

export interface CategoryTree extends Category {
    subcategories: CategoryTree[];
}

export type TreePath = string[];

export interface FindResult {
  node: Category;
  path: TreePath;
  depth: number;
  parentId: string | null;
  isLeaf: boolean;
}

export interface AnalysisResult {
  activePaths: TreePath[];
  counts: {
    total: number;
    active: number;
    inactive: number;
  };
  maxDepth: number;
  anomalies: CategoryAnomaly[];
}