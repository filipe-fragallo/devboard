export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  priority: Priority;
  dueDate?: string | null;
  position: number;
  columnId: string;
};
export type Column = {
  id: string;
  name: string;
  position: number;
  tasks: Task[];
};
export type Board = {
  id: string;
  name: string;
  description?: string | null;
  columns: Column[];
  updatedAt: string;
};
export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};
