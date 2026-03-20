"use client";

import { useEffect, useState } from "react";

type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  useEffect(() => {
    try {
      const auth = localStorage.getItem("auth");
      if (auth !== "true") {
        window.location.href = "/login";
        return;
      }

      const data = localStorage.getItem("clientes");
      if (data) {
        const lista = JSON.parse(data);
        if (Array.isArray(lista)) setClientes(lista);
      }
    } catch (e) {
      console.log("Error cargando clientes", e);
    }
  }, []);

  const guardarClientes = (lista: Cliente[]) => {
    setClientes(lista);
    localStorage.setItem("clientes", JSON.stringify(lista));
  };

  const normalizarTelefono = (valor: string) => {
    const digitos = valor.replace(/\D/g, "");

    if (digitos.startsWith("52") && digitos.length >= 12) {
      return digitos.slice(-10);
    }

    if (digitos.length > 10) {
      return digitos.slice(-10);
    }

    return digitos;
  };

  const guardarCliente = () => {
    const telefonoLimpio = normalizarTelefono(telefono);

    if (!nombre.trim()) {
      alert("Ingresa el nombre del cliente");
      return;
    }

    if (telefonoLimpio.length !== 10) {
      alert("Ingresa un teléfono válido de 10 dígitos");
      return;
    }

    if (!direccion.trim()) {
      alert("Ingresa la dirección");
      return;
    }

    const nuevo: Cliente = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      telefono: telefonoLimpio,
      direccion: direccion.trim(),
    };

    const lista = [nuevo, ...clientes];
    guardarClientes(lista);

    setNombre("");
    setTelefono("");
    setDireccion("");
  };

  const eliminarCliente = (id: string) => {
    const lista = clientes.filter((c) => c.id !== id);
    guardarClientes(lista);
  };

  return (
    <main style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Clientes</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <button onClick={() => (window.location.href = "/dashboard")}>
          ← Volver al dashboard
        </button>
        <button onClick={() => (window.location.href = "/prestamos")}>
          Ver préstamos
        </button>
      </div>

      <section style={{ display: "grid", gap: 10, maxWidth: 450 }}>
        <h2>Alta rápida de cliente</h2>

        <input
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          placeholder="Teléfono (10 dígitos)"
          value={telefono}
          onChange={(e) => setTelefono(normalizarTelefono(e.target.value))}
        />

        <input
          placeholder="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />

        <button onClick={guardarCliente}>Guardar cliente</button>
      </section>

      <hr style={{ margin: "24px 0" }} />

      <h2>Listado de clientes</h2>

      {clientes.length === 0 ? (
        <p>No hay clientes registrados.</p>
      ) : (
        clientes.map((cliente) => (
          <div
            key={cliente.id}
            style={{
              border: "1px solid #ccc",
              padding: 12,
              marginBottom: 12,
              maxWidth: 520,
            }}
          >
            <div><strong>{cliente.nombre}</strong></div>
            <div>Teléfono: {cliente.telefono}</div>
            <div>Dirección: {cliente.direccion}</div>

            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => (window.location.href = `/clientes/${cliente.id}`)}
              >
                Ver detalle
              </button>

              <button onClick={() => eliminarCliente(cliente.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ))
      )}
    </main>
  );
}