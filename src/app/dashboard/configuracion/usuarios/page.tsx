"use client";

import { useState } from "react";

type Usuario = {
  nombre?: string;
  correo: string;
  area: string;
  rol: "Administrador" | "Colaborador" | "Invitado";
  estado: "Activo" | "Pendiente";
};

export default function UsuariosPage() {
  const [openModal, setOpenModal] = useState(false);

  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      correo: "luis@sumaq.com",
      area: "Civil",
      rol: "Administrador",
      estado: "Activo",
    },
    {
      correo: "maria@sumaq.com",
      area: "Sistemas",
      rol: "Invitado",
      estado: "Pendiente",
    },
  ]);

  const [nuevoUsuario, setNuevoUsuario] = useState<Usuario>({
    correo: "",
    area: "Civil",
    rol: "Invitado",
    estado: "Pendiente",
  });

  const invitarUsuario = () => {
    if (!nuevoUsuario.correo) return;
    setUsuarios([...usuarios, nuevoUsuario]);
    setOpenModal(false);
    setNuevoUsuario({
      correo: "",
      area: "Civil",
      rol: "Invitado",
      estado: "Pendiente",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          + Invitar usuario
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left">Correo</th>
              <th className="px-4 py-3 text-left">Área</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3">{u.correo}</td>
                <td className="px-4 py-3">{u.area}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      u.rol === "Invitado"
                        ? "bg-sky-100 text-sky-700"
                        : u.rol === "Administrador"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200"
                    }`}
                  >
                    {u.rol}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      u.estado === "Pendiente"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {u.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">Invitar usuario</h2>

            <div>
              <label className="text-sm">Correo</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2"
                placeholder="correo@empresa.com"
                value={nuevoUsuario.correo}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, correo: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm">Área</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={nuevoUsuario.area}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, area: e.target.value })
                }
              >
                <option>Civil</option>
                <option>Sistemas</option>
                <option>Administración</option>
              </select>
            </div>

            <div>
              <label className="text-sm">Rol</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={nuevoUsuario.rol}
                onChange={(e) =>
                  setNuevoUsuario({
                    ...nuevoUsuario,
                    rol: e.target.value as any,
                  })
                }
              >
                <option>Invitado</option>
                <option>Colaborador</option>
                <option>Administrador</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancelar
              </button>
              <button
                onClick={invitarUsuario}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Invitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}