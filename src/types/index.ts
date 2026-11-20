// src/types/index.ts

// --- ROLES Y ESTADOS ---
export enum UserRole {
  ADMIN = "ADMIN",       // Puede configurar todo
  EDITOR = "EDITOR",     // Puede mover cartas y editar
  VISITOR = "VISITOR"    // Solo mirar
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  LATE = "LATE",
  ABSENT = "ABSENT",
  EXCUSED = "EXCUSED"
}

// --- MODELOS DE DATOS ---

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
}

// Enlace a Google Drive
export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  taskId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  deadline?: Date;
  columnId: string;     // ¿En qué columna está?
  boardId: string;
  assignedTo?: User[];  // Responsables viejos
  assignees?: User[];   // Responsables actuales
  links: ResourceLink[]; // Archivos adjuntos
  url?: string;
  order: number;        // Posición para el Drag & Drop
}

export interface Column {
  id: string;
  title: string;
  color: string;       // Color de la cabecera (Estilo Monday)
  order: number;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  members: User[];
}