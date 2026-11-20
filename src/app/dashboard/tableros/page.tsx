import KanbanBoard from "@/components/board/KanbanBoard";
import { MOCK_BOARD, USERS } from "@/data/mockData";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function TablerosPage() {
  const board = MOCK_BOARD;
  const allUsers = USERS;
  const role: "ADMIN" | "COLLABORATOR" | "VISITOR" = "ADMIN";

  return (
    <KanbanBoard
      initialData={board}
      role={role}
      allUsers={allUsers}
    />
  );
}
