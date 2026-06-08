export enum CategoryErrorCode {
  INVALID_NODE = 'INVALID_NODE',
  INVALID_ID = 'INVALID_ID',
  DUPLICATE_ID = 'DUPLICATE_ID',
  INVALID_NAME = 'INVALID_NAME',
  INVALID_SUBCATEGORIES = 'INVALID_SUBCATEGORIES',
  NULL_CHILD = 'NULL_CHILD',
  CYCLE_DETECTED = 'CYCLE_DETECTED',
}

export interface CategoryAnomaly {
  code: CategoryErrorCode;
  nodeId?: string;
  message: string;
}
