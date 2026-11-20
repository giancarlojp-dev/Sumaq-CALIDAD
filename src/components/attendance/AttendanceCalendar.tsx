"use client";

import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";

interface Props {
  workedDays: Date[];
}

export function AttendanceCalendar({ workedDays }: Props) {
  
  const modifiers = {
    worked: workedDays,
  };

  const modifiersStyles = {
    worked: {
      color: "white",
      backgroundColor: "#2563eb", // Azul Sumaq
      borderRadius: "50%",
      fontWeight: "bold" as const,
    },
  };

  return (
    <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-center">
      <DayPicker
        locale={es}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        showOutsideDays
      />
      
      {/* INYECCIÓN DE ESTILOS FORCE BRUTE */}
      <style jsx global>{`
        /* 1. TÍTULO DEL MES Y AÑO (Lo que estaba blanco) */
        .rdp-caption_label {
            color: #0f172a !important; /* Negro Azulado Profundo */
            font-weight: 800 !important;
            font-size: 1.1rem !important;
            text-transform: capitalize;
        }

        /* 2. FLECHAS DE NAVEGACIÓN (< >) */
        .rdp-nav_button {
            color: #334155 !important; /* Gris oscuro */
        }
        .rdp-nav_button:hover {
            background-color: #e2e8f0 !important;
        }

        /* 3. DÍAS DE LA SEMANA (Lu, Ma, Mi...) */
        .rdp-head_cell {
            color: #64748b !important; /* Gris medio */
            font-weight: 600 !important;
            font-size: 0.85rem !important;
            text-transform: uppercase;
        }

        /* 4. LOS NÚMEROS DE LOS DÍAS */
        .rdp-day {
            color: #1e293b !important; /* Gris oscuro casi negro */
            font-weight: 500;
        }
        
        /* 5. DÍAS DE OTRO MES */
        .rdp-day_outside {
            color: #cbd5e1 !important; /* Gris claro */
        }
        
        /* 6. HOY */
        .rdp-day_today {
            color: #2563eb !important; /* Azul */
            font-weight: bold !important;
        }
      `}</style>
    </div>
  );
}