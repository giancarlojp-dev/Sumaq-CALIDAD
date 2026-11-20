// src/data/mockData.ts
import { UserRole, Priority, Board, User } from "@/types";

// 1. Usuarios Falsos
export const USERS: User[] = [
  { id: "u1", name: "Lui Choccllo", email: "lui@sumaq.com", role: UserRole.ADMIN, image: "" },
  { id: "u2", name: "Pedro Practicante", email: "pedro@sumaq.com", role: UserRole.EDITOR, image: "" },
];

// 2. Tablero de Ejemplo: "Ventas Lotes - Etapa 1"
export const MOCK_BOARD: Board = {
  id: "b1",
  title: "Ventas Lotes - Etapa 1",
  members: USERS,
  columns: [
    {
      id: "col1",
      title: "📞 Por Contactar",
      color: "#fb275d", // Rojo Monday
      order: 0,
      tasks: [
        {
          id: "t1",
          title: "Cliente: Juan Pérez (Interesado Lote 5)",
          priority: Priority.HIGH,
          columnId: "col1",
          boardId: "b1",
          order: 0,
          links: [],
          assignedTo: [USERS[1]] // Asignado a Pedro
        },
        {
          id: "t2",
          title: "Cliente: María (Preguntó por Facebook)",
          priority: Priority.MEDIUM,
          columnId: "col1",
          boardId: "b1",
          order: 1,
          links: [],
          assignedTo: []
        }
      ]
    },
    {
      id: "col2",
      title: "⏳ En Negociación",
      color: "#ffcb00", // Amarillo Monday
      order: 1,
      tasks: [
        {
          id: "t3",
          title: "Visita programada: Lote 8",
          description: "Confirmar cita y revisar detalles de terreno con el cliente.",
          priority: Priority.CRITICAL,
          columnId: "col2",
          boardId: "b1",
          order: 0,
          deadline: new Date(new Date().setDate(new Date().getDate() + 1)),
          url: "https://docs.google.com/document/d/3",
          links: [{ id: "l1", title: "Plano Ubicación", url: "#", taskId: "t3" }],
          assignees: [USERS[0]] // Asignado a Lui
        }
      ]
    },
    {
      id: "col3",
      title: "✅ Vendido / Cerrado",
      color: "#00c875", // Verde Monday
      order: 2,
      tasks: []
    }
  ]
};