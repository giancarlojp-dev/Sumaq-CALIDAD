"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Clock, Plus, Trash2, Lock, Link as LinkIcon, Sparkles } from "lucide-react"; 
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import TaskModal from "./TaskModal";
import { toast } from "sonner";

interface KanbanBoardProps {
  initialData: any;
  role: "ADMIN" | "COLLABORATOR" | "VISITOR"; 
  allUsers: any[];
}

export default function KanbanBoard({ initialData, role, allUsers }: KanbanBoardProps) {
  const [board, setBoard] = useState(initialData);
  const [enabled, setEnabled] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [question, setQuestion] = useState("");
  
  const canEdit = role !== "VISITOR"; 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);

  const analyzeBoard = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const query = question.trim() ? `?question=${encodeURIComponent(question.trim())}` : "";
      const response = await fetch(`/api/board/analysis${query}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al generar análisis");
      }

      const data = await response.json();
      setAnalysis(data.analysis || "No se recibió respuesta de análisis.");
    } catch (error) {
      console.error(error);
      setAnalysis("No se pudo generar el análisis. Revisa la clave de Gemini o la configuración del servidor.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "CRITICAL": return "bg-red-500 hover:bg-red-600";
      case "HIGH": return "bg-orange-500 hover:bg-orange-600";
      case "MEDIUM": return "bg-blue-500 hover:bg-blue-600";
      default: return "bg-slate-500 hover:bg-slate-600";
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!canEdit) {
        toast.error("Modo Lectura: No tienes permisos para mover tareas.");
        return;
    }

    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newColumns = [...board.columns];
    const sourceColIndex = newColumns.findIndex((col: any) => col.id === source.droppableId);
    const destColIndex = newColumns.findIndex((col: any) => col.id === destination.droppableId);

    const sourceCol = newColumns[sourceColIndex];
    const destCol = newColumns[destColIndex];
    const sourceTasks = [...sourceCol.tasks];
    const destTasks = sourceColIndex === destColIndex ? sourceTasks : [...destCol.tasks];

    const [removed] = sourceTasks.splice(source.index, 1);
    const movedTask = { ...removed, columnId: destination.droppableId };
    destTasks.splice(destination.index, 0, movedTask);

    newColumns[sourceColIndex] = { ...sourceCol, tasks: sourceTasks };
    newColumns[destColIndex] = { ...destCol, tasks: destTasks };

    setBoard({ ...board, columns: newColumns });
  };

  const openCreateModal = (columnId: string) => {
    if (!canEdit) return;
    setTargetColumnId(columnId);
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: any) => {
    if (!canEdit) {
        toast.info("Vista de Visitante: Solo lectura.");
        return;
    }
    setTargetColumnId(task.columnId);
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  // 👇 ACTUALIZADO: formData ahora puede recibir URL y los IDs de los asignados
  const handleModalSubmit = async (formData: any) => {
    if (!canEdit) return; 

    const selectedAssignees = (formData.assigneeIds || [])
      .map((id: string) => allUsers.find((user) => user.id === id))
      .filter(Boolean);

    if (taskToEdit) {
      const newColumns = board.columns.map((col: any) => {
        return {
          ...col,
          tasks: col.tasks.map((t: any) =>
            t.id === taskToEdit.id ? { ...t, ...formData, assignees: selectedAssignees } : t
          )
        };
      });
      setBoard({ ...board, columns: newColumns });
    } else if (targetColumnId) {
      const optimisticTask = {
        id: "temp-" + Date.now(),
        ...formData,
        columnId: targetColumnId,
        links: [],
        assignees: selectedAssignees
      };

      const newColumns = board.columns.map((col: any) => {
        if (col.id === targetColumnId) {
          return { ...col, tasks: [...col.tasks, optimisticTask] };
        }
        return col;
      });
      setBoard({ ...board, columns: newColumns });
    }
  };

  const onDeleteTask = async (e: React.MouseEvent, taskId: string, columnId: string) => {
    e.stopPropagation();
    if (!canEdit) return;

    if (!confirm("¿Eliminar esta tarea?")) return;
    
    const newColumns = board.columns.map((col: any) => {
      if (col.id === columnId) {
        return { ...col, tasks: col.tasks.filter((t: any) => t.id !== taskId) };
      }
      return col;
    });
    setBoard({ ...board, columns: newColumns });
    
    // Solo actualización local en modo prueba
  };

  if (!enabled) return <div className="p-8 text-slate-400">Cargando tablero...</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-full flex flex-col relative">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {board.title}
              <Badge variant="outline" className="text-xs font-normal text-slate-500">
                {board.members.length} Miembros
              </Badge>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Espacio de trabajo: Sumaq Projects ✅
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col gap-3">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pregunta a Gemini</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ej. ¿Qué tareas son críticas?"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <button
              type="button"
              onClick={analyzeBoard}
              disabled={isAnalyzing}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {isAnalyzing ? "Analizando..." : "Preguntar a Gemini"}
            </button>
            {!canEdit && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                <Lock size={12} /> VISTA VISITANTE (Solo Lectura)
              </div>
            )}
          </div>
        </div>

        {analysis && (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Análisis de IA del tablero</h2>
                <p className="text-xs text-slate-500">Recomendaciones y observaciones generadas por Gemini.</p>
              </div>
              {isAnalyzing ? (
                <span className="text-xs font-medium text-blue-600">Generando análisis...</span>
              ) : null}
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{analysis}</pre>
          </div>
        )}

        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full gap-6 pb-4">
            
            {board.columns.map((col: any) => (
              <div key={col.id} className="w-80 shrink-0 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200 h-full max-h-full">
                <div className="p-3 bg-white rounded-t-xl border-b border-slate-100 shadow-sm sticky top-0 z-10">
                  <div className="h-1.5 w-full rounded-full mb-2" style={{ backgroundColor: col.color }} />
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">{col.title}</h3>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{col.tasks.length}</span>
                  </div>
                </div>

                <Droppable droppableId={col.id} isDropDisabled={!canEdit}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="p-2 flex-1 overflow-y-auto space-y-2 custom-scrollbar min-h-100px">
                      {col.tasks.map((task: any, index: number) => (
                        <Draggable 
                            key={task.id} 
                            draggableId={task.id} 
                            index={index}
                            isDragDisabled={!canEdit}
                        >
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => openEditModal(task)}
                              style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.8 : 1 }}
                              className={`bg-white p-3 rounded-lg shadow-sm border border-slate-200 
                                ${canEdit ? "hover:shadow-md cursor-pointer group" : "cursor-default opacity-90"} 
                                transition-all ${snapshot.isDragging ? "rotate-2 shadow-xl ring-2 ring-blue-400" : ""}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-sm font-medium text-slate-800 leading-tight">{task.title}</h4>
                                
                                {canEdit && (
                                    <button 
                                    onClick={(e) => onDeleteTask(e, task.id, col.id)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-colors p-1"
                                    >
                                    <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge className={`${getPriorityColor(task.priority)} text-[10px] px-1.5 py-0 h-5`}>{task.priority}</Badge>
                                
                                {/* 👇 NUEVO: Mostrar indicador de URL si la tarea tiene un enlace */}
                                {task.url && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 h-5 text-purple-600 bg-purple-50 border-purple-200">
                                    <LinkIcon className="w-3 h-3 mr-1"/> URL
                                  </Badge>
                                )}

                                {task.links.length > 0 && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 h-5 text-blue-600 bg-blue-50">📎 {task.links.length} Link</Badge>
                                )}
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between items-center mt-2">
                                <div className="flex -space-x-2">
                                  
                                  {/* 👇 ACTUALIZADO: Ahora usa 'assignees' y dibuja varios avatares */}
                                  {(task.assignees || task.assignedTo)?.map((user: any) => (
                                    <Avatar key={user.id} className="h-6 w-6 border-2 border-white" title={user.name}>
                                      <AvatarImage src={user.image || ""} />
                                      <AvatarFallback className="text-[9px] bg-slate-200 text-slate-600">
                                        {user.name ? user.name.substring(0, 2).toUpperCase() : "??"}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  
                                </div>
                                <div className="flex items-center text-xs text-slate-400"><Clock className="h-3 w-3 mr-1" /><span>Hoy</span></div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {canEdit && (
                        <button 
                            onClick={() => openCreateModal(col.id)}
                            className="w-full py-2 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors text-sm border border-dashed border-slate-300 mt-2"
                        >
                            <Plus className="h-4 w-4" /> Nueva Tarea
                        </button>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>

          <TaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          columnTitle={targetColumnId ? board.columns.find((c:any) => c.id === targetColumnId)?.title : ""}
          taskToEdit={taskToEdit}
          members={allUsers} // <--- 3. EL TRUCO FINAL: Le pasamos TODOS los usuarios del sistema
        />
      </div>
    </DragDropContext>
  );
}