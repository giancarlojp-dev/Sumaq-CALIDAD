"use client";

import { useState } from "react";

export default function PerfilPage() {
  const [foto, setFoto] = useState<string | null>(null);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageUrl = URL.createObjectURL(e.target.files[0]);
      setFoto(imageUrl);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Perfil</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        {/* FOTO DE PERFIL */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
            {foto ? (
              <img src={foto} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-500 text-sm">Sin foto</span>
            )}
          </div>

          <label className="cursor-pointer">
            <span className="text-sm text-blue-600 hover:underline">
              Cambiar foto
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="hidden"
            />
          </label>
        </div>

        {/* FORMULARIO */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium">
              Nombre completo
            </label>
            <input
              id="nombre"
              type="text"
              placeholder="Ej. Luis Choccllo"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>

          {/* Correo */}
          <div>
            <label htmlFor="correo" className="block text-sm font-medium">
              Correo
            </label>
            <input
              id="correo"
              type="email"
              placeholder="correo@sumaqprojects.com"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>

          {/* Área */}
          <div>
            <label htmlFor="area" className="block text-sm font-medium">
              Área
            </label>
            <select
              id="area"
              className="mt-1 w-full rounded-md border px-3 py-2"
            >
              <option>Civil</option>
              <option>Sistemas</option>
              <option>Administración</option>
              <option>Arquitectura</option>
            </select>
          </div>

          {/* Rol */}
          <div>
            <label htmlFor="rol" className="block text-sm font-medium">
              Rol
            </label>
            <input
              id="rol"
              value="Invitado"
              disabled
              className="mt-1 w-full rounded-md border bg-sky-100 text-sky-700 px-3 py-2"
            />
          </div>

          {/* Ubicación */}
          <div className="md:col-span-2">
            <label htmlFor="ubicacion" className="block text-sm font-medium">
              Ubicación / Sede
            </label>
            <input
              id="ubicacion"
              type="text"
              placeholder="San Vicente de Cañete"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>
        </form>

        <div className="flex justify-end">
          <button className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}