"use client";

import { useEffect, useMemo, useState } from "react";

type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
};

type Prestamo = {
  id: string;
  clienteId: string;
  clienteNombre: string;
  monto: number;
  interes: number;
  numeroPagos: number;
  totalPagar: number;
  pagoPorCuota: number;
  saldoPendiente: number;
  estado: "activo" | "liquidado";
  fecha: string;
};

export default function PrestamosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [monto, setMonto] = useState("");
  const [interes, setInteres] = useState("");
  const [numeroPagos, setNumeroPagos] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth !== "true") {
      window.location.href = "/login";
      return;
    }

    const clientesGuardados = localStorage.getItem("clientes");
    if (clientesGuardados) {
      setClientes(JSON.parse(clientesGuardados));
    }

    const prestamosGuardados = localStorage.getItem("prestamos");
    if (prestamosGuardados) {
      setPrestamos(JSON.parse(prestamosGuardados));
    }
  }, []);

  const clienteSeleccionado = useMemo(
    () => clientes.find((c) => c.id === clienteId),
    [clientes, clienteId]
  );

  const montoNum = Number(monto || 0);
  const interesNum = Number(interes || 0);
  const pagosNum = Number(numeroPagos || 0);

  const totalPagar = montoNum + montoNum * (interesNum / 100);
  const pagoPorCuota = pagosNum > 0 ? totalPagar / pagosNum : 0;

  const guardarPrestamos = (lista: Prestamo[]) => {
    setPrestamos(lista);
    localStorage.setItem("prestamos", JSON.stringify(lista));
  };

  const crearPrestamo = () => {
    if (!clienteId) {
      alert("Selecciona un cliente");
      return;
    }

    if (montoNum <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }

    if (interesNum < 0) {
      alert("El interés no puede ser negativo");
      return;
    }

    if (pagosNum <= 0) {
      alert("El número de pagos debe ser mayor a 0");
      return;
    }

    const nuevoPrestamo: Prestamo = {
      id: Date.now().toString(),
      clienteId,
      clienteNombre: clienteSeleccionado?.nombre || "Cliente",
      monto: montoNum,
      interes: interesNum,
      numeroPagos: pagosNum,
      totalPagar,
      pagoPorCuota,
      saldoPendiente: totalPagar,
      estado: "activo",
      fecha: new Date().toLocaleDateString(),
    };

    guardarPrestamos([nuevoPrestamo, ...prestamos]);

    setClienteId("");
    setMonto("");
    setInteres("");
    setNumeroPagos("");
  };

  const eliminarPrestamo = (id: string) => {
    const nuevaLista = prestamos.filter((p) => p.id !== id);
    guardarPrestamos(nuevaLista);
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
        <h1 style={{ margin: 0 }}>Préstamos</h1>

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
        <h2 style={{ marginTop: 0 }}>Nuevo préstamo</h2>

        {clientes.length === 0 ? (
          <p>
            Primero debes registrar al menos un cliente en el módulo de clientes.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              style={{ padding: 12 }}
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Monto del préstamo"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              style={{ padding: 12 }}
            />

            <input
              type="number"
              placeholder="Interés (%)"
              value={interes}
              onChange={(e) => setInteres(e.target.value)}
              style={{ padding: 12 }}
            />

            <input
              type="number"
              placeholder="Número de pagos"
              value={numeroPagos}
              onChange={(e) => setNumeroPagos(e.target.value)}
              style={{ padding: 12 }}
            />

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 10,
                padding: 14,
                lineHeight: 1.8,
              }}
            >
              <div>
                <strong>Total a pagar:</strong> ${totalPagar.toFixed(2)}
              </div>
              <div>
                <strong>Pago por cuota:</strong> ${pagoPorCuota.toFixed(2)}
              </div>
            </div>

            <button
              onClick={crearPrestamo}
              style={{
                padding: 12,
                background: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
              }}
            >
              Guardar préstamo
            </button>
          </div>
        )}
      </section>

      <section
        style={{
          background: "white",
          padding: 16,
          borderRadius: 12,
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Listado de préstamos</h2>

        {prestamos.length === 0 ? (
          <p>No hay préstamos registrados todavía.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {prestamos.map((prestamo) => (
              <div
                key={prestamo.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {prestamo.clienteNombre}
                </div>

                <div style={{ marginTop: 6 }}>
                  <strong>Monto:</strong> ${prestamo.monto.toFixed(2)}
                </div>

                <div style={{ marginTop: 4 }}>
                  <strong>Interés:</strong> {prestamo.interes}%
                </div>

                <div style={{ marginTop: 4 }}>
                  <strong>Número de pagos:</strong> {prestamo.numeroPagos}
                </div>

                <div style={{ marginTop: 4 }}>
                  <strong>Total a pagar:</strong> ${prestamo.totalPagar.toFixed(2)}
                </div>

                <div style={{ marginTop: 4 }}>
                  <strong>Pago por cuota:</strong> ${prestamo.pagoPorCuota.toFixed(2)}
                </div>

                <div style={{ marginTop: 4 }}>
                  <strong>Saldo pendiente:</strong> ${prestamo.saldoPendiente.toFixed(2)}
                </div>

                <div style={{ marginTop: 4 }}>
                  <strong>Estado:</strong> {prestamo.estado}
                </div>

                <div style={{ marginTop: 4 }}>
                  <strong>Fecha:</strong> {prestamo.fecha}
                </div>

                <button
                  onClick={() => eliminarPrestamo(prestamo.id)}
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