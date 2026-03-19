"use client";

import { useEffect, useMemo, useState } from "react";

type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
};

export default function ClientesPage() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth !== "true") {
      window.location.href = "/login";
      return;
    }

    const guardados = localStorage.getItem("clientes");
    if (guardados) {
      setClientes(JSON.parse(guardados));
    }
  }, []);

  const guardarClientes = (lista: Cliente[]) => {
    setClientes(lista);
    localStorage.setItem("clientes", JSON.stringify(lista));
  };

  const limpiarFormulario = () => {
    setNombre("");
    setTelefono("");
    setDireccion("");
    setEditandoId(null);
  };

  const agregarOActualizar = () => {
    if (!nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    if (editandoId) {
      const actualizados = clientes.map((c) =>
        c.id === editandoId
          ? { ...c, nombre, telefono, direccion }
          : c
      );
      guardarClientes(actualizados);
      limpiarFormulario();
      return;
    }

    const nuevo: Cliente = {
      id: Date.now().toString(),
      nombre,
      telefono,
      direccion,
    };

    guardarClientes([nuevo, ...clientes]);
    limpiarFormulario();
  };

  const eliminar = (id: string) => {
    const nueva = clientes.filter((c) => c.id !== id);
    guardarClientes(nueva);
  };

  const editar = (cliente: Cliente) => {
    setNombre(cliente.nombre);
    setTelefono(cliente.telefono);
    setDireccion(cliente.direccion);
    setEditandoId(cliente.id);
  };

  const filtrados = useMemo(() => {
    return clientes.filter((c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [clientes, busqueda]);

  return (
    <main style={{ padding: 24, fontFamily: "Arial" }}>
      <h1>Clientes</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => (window.location.href = "/dashboard")}>
          ← Dashboard
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("auth");
            window.location.href = "/login";
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* FORM */}
      <section style={{ marginBottom: 20 }}>
        <h2>{editandoId ? "Editar cliente" : "Nuevo cliente"}</h2>

        <div style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <input
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />

          <button onClick={agregarOActualizar}>
            {editandoId ? "Actualizar" : "Guardar"}
          </button>

          {editandoId && (
            <button onClick={limpiarFormulario}>Cancelar</button>
          )}
        </div>
      </section>

      {/* BUSCADOR */}
      <input
        placeholder="Buscar cliente..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ marginBottom: 20, padding: 8 }}
      />

      {/* LISTA */}
      <section>
        <h2>Listado</h2>

        {filtrados.length === 0 ? (
          <p>No hay resultados</p>
        ) : (
          filtrados.map((c) => (
            <div key={c.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
              <strong>{c.nombre}</strong>
              <div>{c.telefono}</div>
              <div>{c.direccion}</div>

              <div style={{ marginTop: 8 }}>
                <button onClick={() => editar(c)}>Editar</button>
                <button onClick={() => eliminar(c.id)}>Eliminar</button>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}