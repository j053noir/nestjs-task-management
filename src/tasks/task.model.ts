export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
}

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGESS = 'IN_PROGESS',
  BLOCKED = 'BLOCKED',
  DONE = 'DONE',
}
