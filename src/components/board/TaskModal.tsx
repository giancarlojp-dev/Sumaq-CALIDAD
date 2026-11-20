"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Link as LinkIcon, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 👇 Actualizamos lo que envía el formulario al guardar
  onSubmit: (data: { title: string; priority: string; description: string; deadline: string; url: string; assigneeIds: string[] }) => void;
  columnTitle?: string;
  taskToEdit?: any;
  members?: any[]; // 👈 NUEVO: Recibe la lista real de usuarios del tablero
}

export default function TaskModal({ isOpen, onClose, onSubmit, columnTitle, taskToEdit, members = [] }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [deadline, setDeadline] = useState("");
  const [url, setUrl] = useState(""); // 👈 NUEVO ESTADO PARA URL
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]); // 👈 NUEVO ESTADO PARA MÚLTIPLES RESPONSABLES

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || "");
        setPriority(taskToEdit.priority);
        setDeadline(taskToEdit.deadline ? new Date(taskToEdit.deadline).toISOString().split('T')[0] : "");
        setUrl(taskToEdit.url || "");
        // Cargamos los responsables que ya tenía la tarea
        setAssigneeIds(
          taskToEdit.assignees?.map((a: any) => a.id) ||
          taskToEdit.assignedTo?.map((a: any) => a.id) ||
          []
        );
      } else {
        setTitle("");
        setDescription("");
        setPriority("MEDIUM");
        setDeadline("");
        setUrl("");
        setAssigneeIds([]);
      }
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Enviamos todos los datos (incluyendo url y los IDs de los asignados)
    onSubmit({ title, priority, description, deadline, url, assigneeIds });
    onClose();
  };

  // Función para seleccionar/quitar un responsable
  const toggleAssignee = (id: string) => {
    setAssigneeIds(prev => 
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const isEditing = !!taskToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isEditing ? "Editar Tarea" : "Nueva Tarea"}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {isEditing ? "Modificando detalles" : `Columna: ${columnTitle}`}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-1.5 rounded-lg transition-colors border border-slate-200 shadow-sm">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* TÍTULO */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título de la tarea</label>
            <input 
              autoFocus
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
              placeholder="Ej. Revisar diseño final..."
              required
            />
          </div>

          {/* RESPONSABLES MULTIPLES (NUEVO DISEÑO) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Asignar Responsables</label>
            <div className="grid grid-cols-2 gap-2">
              {members.map(member => {
                const isSelected = assigneeIds.includes(member.id);
                return (
                  <div 
                    key={member.id}
                    onClick={() => toggleAssignee(member.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-all select-none
                      ${isSelected ? "bg-blue-50 border-blue-300 ring-1 ring-blue-500" : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"}
                    `}
                  >
                    <Avatar className="h-7 w-7 border border-white shadow-sm">
                      <AvatarImage src={member.image || ""} />
                      <AvatarFallback className="text-[10px] bg-slate-200 text-slate-600 font-bold">
                        {member.name ? member.name.substring(0, 2).toUpperCase() : "??"}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`text-xs flex-1 truncate ${isSelected ? "font-bold text-blue-700" : "font-medium text-slate-700"}`}>
                      {member.name}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                  </div>
                );
              })}
              {members.length === 0 && (
                 <p className="text-xs text-amber-600 col-span-2 p-2 bg-amber-50 rounded border border-amber-200">
                    No hay miembros en este proyecto.
                 </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* PRIORIDAD */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prioridad</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium bg-white text-slate-900"
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">🔥 Crítica</option>
              </select>
            </div>

            {/* VENCIMIENTO */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Fecha Límite
              </label>
              <input 
                type="date" 
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-900"
              />
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción / Notas</label>
            <textarea 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none text-slate-900 placeholder:text-slate-400"
              placeholder="Detalles de lo que hay que hacer..."
            />
          </div>

          {/* NUEVO: CAMPO URL */}
          <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <LinkIcon className="h-3.5 w-3.5" /> URL de Entregable / Trabajo
            </label>
            <input 
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-900 placeholder:text-slate-400 bg-white"
              placeholder="https://docs.google.com/..."
            />
            <p className="text-[10px] text-slate-400 mt-1 ml-1">Pega el link del documento, diseño o repositorio aquí.</p>
          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all flex items-center gap-2">
              {isEditing ? "Guardar Cambios" : "Crear Tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}