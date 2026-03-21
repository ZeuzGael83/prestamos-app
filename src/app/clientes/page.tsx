"use client";

import { useEffect, useState } from "react";

type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
  ubicacion?: string;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ubicacion, setUbicacion] = useState("");

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
      ubicacion: ubicacion.trim(),
    };

    const lista = [nuevo, ...clientes];
    guardarClientes(lista);

    setNombre("");
    setTelefono("");
    setDireccion("");
    setUbicacion("");
  };

  const eliminarCliente = (id: string) => {
    const lista = clientes.filter((c) => c.id !== id);
    guardarClientes(lista);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 16,
        background: "#eef2ff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
          color: "white",
          borderRadius: 24,
          padding: 20,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.25)",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "8px 14px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.14)",
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          Registro y gestión de clientes
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 38,
            lineHeight: 1.05,
            fontWeight: 800,
          }}
        >
          Gestión
          <br />
          de clientes
        </h1>

        <p
          style={{
            marginTop: 14,
            marginBottom: 18,
            color: "rgba(255,255,255,0.88)",
            fontSize: 18,
            lineHeight: 1.5,
          }}
        >
          Registra datos, ubicación y acceso al expediente de cada cliente en una sola pantalla.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <HeaderButton
            label="Dashboard"
            onClick={() => (window.location.href = "/dashboard")}
            primary
          />
          <HeaderButton
            label="Préstamos"
            onClick={() => (window.location.href = "/prestamos")}
          />
          <HeaderButton
            label="Pagos"
            onClick={() => (window.location.href = "/pagos")}
          />
        </div>
      </section>

      <section
        style={{
          background: "white",
          border: "1px solid #dbe4f0",
          borderRadius: 22,
          padding: 16,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            margin: "0 0 14px 0",
            fontSize: 22,
            color: "#0f172a",
          }}
        >
          Alta rápida de cliente
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          <input
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Teléfono (10 dígitos)"
            value={telefono}
            onChange={(e) => setTelefono(normalizarTelefono(e.target.value))}
            style={inputStyle}
          />

          <input
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Link de Google Maps o ubicación"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            style={inputStyle}
          />

          <button
            onClick={guardarCliente}
            style={{
              background: "#1d4ed8",
              color: "white",
              border: "none",
              padding: "14px 16px",
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Guardar cliente
          </button>
        </div>
      </section>

      <section>
        <h2
          style={{
            margin: "0 0 12px 2px",
            fontSize: 18,
            color: "#0f172a",
          }}
        >
          Listado de clientes
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          {clientes.length === 0 ? (
            <EmptyCard texto="No hay clientes registrados." />
          ) : (
            clientes.map((cliente) => (
              <div
                key={cliente.id}
                style={{
                  background: "white",
                  border: "1px solid #dbe4f0",
                  borderRadius: 22,
                  padding: 16,
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#0f172a",
                    marginBottom: 10,
                  }}
                >
                  {cliente.nombre}
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <DataChip label="Teléfono" value={cliente.telefono} />
                  <DataChip label="Dirección" value={cliente.direccion} />
                  <DataChip
                    label="Ubicación"
                    value={cliente.ubicacion || "No registrada"}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => (window.location.href = `/clientes/${cliente.id}`)}
                    style={primaryButton}
                  >
                    Ver detalle
                  </button>

                  <button
                    onClick={() => eliminarCliente(cliente.id)}
                    style={dangerButton}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 14px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  fontSize: 16,
  outline: "none",
  background: "#f8fafc",
  color: "#0f172a",
};

const primaryButton: React.CSSProperties = {
  background: "#1d4ed8",
  color: "white",
  border: "none",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: 700,
};

const dangerButton: React.CSSProperties = {
  background: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: 700,
};

function HeaderButton({
  label,
  onClick,
  primary,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: primary ? "#ffffff" : "rgba(255,255,255,0.12)",
        color: primary ? "#0f172a" : "#ffffff",
        border: primary ? "none" : "1px solid rgba(255,255,255,0.18)",
        padding: "12px 16px",
        borderRadius: 14,
        fontWeight: 700,
      }}
    >
      {label}
    </button>
  );
}

function DataChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 12,
        color: "#334155",
        wordBreak: "break-word",
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#64748b",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyCard({ texto }: { texto: string }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #dbe4f0",
        borderRadius: 22,
        padding: 18,
        color: "#64748b",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
      }}
    >
      {texto}
    </div>
  );
}