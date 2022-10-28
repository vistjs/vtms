export enum caseStatus {
  NOTACTIVE,
  ACTIVE,
  RUNNING,
  SUCCESS,
  ERROR,
  DELETE,
}

export const caseStatusText = {
  [caseStatus.NOTACTIVE]: '未启动',
  [caseStatus.ACTIVE]: '启用',
  [caseStatus.RUNNING]: '运行中',
  [caseStatus.SUCCESS]: '成功',
  [caseStatus.ERROR]: '错误',
  [caseStatus.DELETE]: '删除',
};

export enum RecordType {
  'MOUSE',
  'INPUT',
  'DRAG',
  'EVENT',
  'SCROLL',
  'CAPTURE',
}
