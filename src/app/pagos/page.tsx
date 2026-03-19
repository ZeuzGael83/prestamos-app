"use client";
// force redeploy pagos
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
  saldoPendiente: number;
  estado: "activo" | "liquidado";
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
      setPrestamos(JSON.parse(prestamosGuardados));
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

    const nuevoSaldo = Math.max(prestamo.saldoPendiente - monto, 0);
    const nuevoEstado = nuevoSaldo === 0 ? "liquidado" : "activo";

    const prestamosActualizados = prestamos.map((p) =>
      p.id === prestamoId
        ? { ...p, saldoPendiente: nuevoSaldo, estado: nuevoEstado }
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

  const prestamosActivos = prestamos.filter((p) => p.estado === "activo");

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
        <h1 style={{ margin: 0 }}>Pagos</h1>

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
        <h2 style={{ marginTop: 0 }}>Registrar pago</h2>

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
                  {prestamo.clienteNombre} - Saldo: $
                  {prestamo.saldoPendiente.toFixed(2)}
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
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          marginBottom: 20,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Estado de préstamos</h2>

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
                <div style={{ fontWeight: 700 }}>{prestamo.clienteNombre}</div>
                <div>
                  <strong>Total:</strong> ${prestamo.totalPagar.toFixed(2)}
                </div>
                <div>
                  <strong>Saldo pendiente:</strong> $
                  {prestamo.saldoPendiente.toFixed(2)}
                </div>
                <div>
                  <strong>Estado:</strong> {prestamo.estado}
                </div>
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
        <h2 style={{ marginTop: 0 }}>Historial de pagos</h2>

        {pagos.length === 0 ? (
          <p>No hay pagos registrados todavía.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {pag