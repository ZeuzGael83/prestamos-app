"use client";

import { useEffect, useState } from "react";

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

  const agregarCliente = () => {
    if (!nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    const nuevoCliente: Cliente = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
    };

    const nuevaLista = [nuevoCliente, ...clientes];
    guardarClientes(nuevaLista);

    setNombre("");
    setTelefono("");
    setDireccion("");
  };

  const eliminarCliente = (id: string) => {
    const nuevaLista = clientes.filter((cliente) => cliente.id !== id);
    guardarClientes(nuevaLista);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        color: "#111827",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <h1 style={{ margin: 0 }}>Clientes</h1>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          >
            ← Volver al dashboard
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("auth");
              window.location.href = "/login";
            }}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 14px",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <section
        style={{
          background: "white",
          padding: 16,
          borderRadius: 12,
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          marginBottom: 20,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Alta rápida de cliente</h2>

        <div style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ padding: 12 }}
          />

          <input
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            style={{ padding: 12 }}
          />

          <input
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            style={{ padding: 12 }}
          />

          <button
            onClick={agregarCliente}
            style={{
              padding: 12,
              background: "#1d4ed8",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
            }}
          >
            Guardar cliente
          </button>
        </div>
      </section>

      <section
        style={{
          background: "white",
          padding: 16,
          borderRadius: 12,
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Listado de clientes</h2>

        {clientes.length === 0 ? (
          <p>No hay clientes registrados todavía.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {clientes.map((cliente) => (
              <div
                key={cliente.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {cliente.nombre}
                </div>
                <div style={{ marginTop: 6 }}>
                  <strong>Teléfono:</strong> {cliente.telefono || "Sin dato"}
                </div>
                <div style={{ marginTop: 4 }}>
                  <strong>Dirección:</strong> {cliente.direccion || "Sin dato"}
                </div>

                <button
                  onClick={() => eliminarCliente(cliente.id)}
                  style={{
                    marginTop: 10,
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}