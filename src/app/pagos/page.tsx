"use client";

import { useEffect, useState } from "react";

type Prestamo = {
  id: string;
  clienteId: string;
  clienteNombre: string;
  monto: number;
  interes: number;
  numeroPagos: number;
  totalPagar: number;
  pagoPorCuota: number;
  saldoPendiente?: number;
  estado?: "activo" | "liquidado";
  fecha: string;
};

type Pago = {
  id: string;
  prestamoId: string;
  clienteNombre: string;
  montoPagado: number;
  fecha: string;
};

export default function PagosPage() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [prestamoId, setPrestamoId] = useState("");
  const [montoPagado, setMontoPagado] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth !== "true") {
      window.location.href = "/login";
      return;
    }

    const prestamosGuardados = localStorage.getItem("prestamos");
    if (prestamosGuardados) {
      const lista: Prestamo[] = JSON.parse(prestamosGuardados).map((p: Prestamo) => ({
        ...p,
        saldoPendiente:
          typeof p.saldoPendiente === "number" ? p.saldoPendiente : p.totalPagar,
        estado:
          p.estado || ((typeof p.saldoPendiente === "number" ? p.saldoPendiente : p.totalPagar) <= 0
            ? "liquidado"
            : "activo"),
      }));
      setPrestamos(lista);
      localStorage.setItem("prestamos", JSON.stringify(lista));
    }

    const pagosGuardados = localStorage.getItem("pagos");
    if (pagosGuardados) {
      setPagos(JSON.parse(pagosGuardados));
    }
  }, []);

  const guardarPrestamos = (lista: Prestamo[]) => {
    setPrestamos(lista);
    localStorage.setItem("prestamos", JSON.stringify(lista));
  };

  const guardarPagos = (lista: Pago[]) => {
    setPagos(lista);
    localStorage.setItem("pagos", JSON.stringify(lista));
  };

  const registrarPago = () => {
    const monto = Number(montoPagado || 0);

    if (!prestamoId) {
      alert("Selecciona un préstamo");
      return;
    }

    if (monto <= 0) {
      alert("El monto pagado debe ser mayor a 0");
      return;
    }

    const prestamo = prestamos.find((p) => p.id === prestamoId);
    if (!prestamo) {
      alert("Préstamo no encontrado");
      return;
    }

    const saldoActual = prestamo.saldoPendiente ?? prestamo.totalPagar;

    if (monto > saldoActual) {
      alert("El pago no puede ser mayor al saldo pendiente");
      return;
    }

    const nuevoSaldo = saldoActual - monto;
    const nuevoEstado = nuevoSaldo <= 0 ? "liquidado" : "activo";

    const prestamosActualizados = prestamos.map((p) =>
      p.id === prestamoId
        ? {
            ...p,
            saldoPendiente: nuevoSaldo,
            estado: nuevoEstado,
          }
        : p
    );

    guardarPrestamos(prestamosActualizados);

    const nuevoPago: Pago = {
      id: Date.now().toString(),
      prestamoId,
      clienteNombre: prestamo.clienteNombre,
      montoPagado: monto,
      fecha: new Date().toLocaleDateString(),
    };

    guardarPagos([nuevoPago, ...pagos]);

    setPrestamoId("");
    setMontoPagado("");
  };

  const prestamosActivos = prestamos.filter(
    (p) => (p.estado ?? "activo") === "activo"
  );

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
      <h1>Pagos</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => (window.location.href = "/dashboard")}>
          ← Dashboard
        </button>
        <button onClick={() => (window.location.href = "/prestamos")}>
          Ver préstamos
        </button>
      </div>

      <section
        style={{
          background: "white",
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <h2>Registrar pago</h2>

        {prestamosActivos.length === 0 ? (
          <p>No hay préstamos activos para registrar pagos.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <select
              value={prestamoId}
              onChange={(e) => setPrestamoId(e.target.value)}
              style={{ padding: 12 }}
            >
              <option value="">Selecciona un préstamo</option>
              {prestamosActivos.map((prestamo) => (
                <option key={prestamo.id} value={prestamo.id}>
                  {prestamo.clienteNombre} - Saldo $
                  {(prestamo.saldoPendiente ?? prestamo.totalPagar).toFixed(2)}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Monto pagado"
              value={montoPagado}
              onChange={(e) => setMontoPagado(e.target.value)}
              style={{ padding: 12 }}
            />

            <button
              onClick={registrarPago}
              style={{
                padding: 12,
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
              }}
            >
              Guardar pago
            </button>
          </div>
        )}
      </section>

      <section
        style={{
          background: "white",
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <h2>Estado de préstamos</h2>

        {prestamos.length === 0 ? (
          <p>No hay préstamos registrados.</p>
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
                <div><strong>Cliente:</strong> {prestamo.clienteNombre}</div>
                <div><strong>Total:</strong> ${prestamo.totalPagar.toFixed(2)}</div>
                <div>
                  <strong>Saldo pendiente:</strong> $
                  {(prestamo.saldoPendiente ?? prestamo.totalPagar).toFixed(2)}
                </div>
                <div><strong>Estado:</strong> {prestamo.estado ?? "activo"}</div>
              </div>
            ))}
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
        <h2>Historial de pagos</h2>

        {pagos.length === 0 ? (
          <p>No hay pagos registrados todavía.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {pagos.map((pago) => (
              <div
                key={pago.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div><strong>Cliente:</strong> {pago.clienteNombre}</div>
                <div><strong>Monto:</strong> ${pago.montoPagado.toFixed(2)}</div>
                <div><strong>Fecha:</strong> {pago.fecha}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}