"use client";

import { useEffect, useState } from "react";

type Prestamo = {
  id: string;
  clienteNombre: string;
  totalPagar: number;
  saldoPendiente?: number;
  estado?: string;
};

type Pago = {
  id: string;
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
      const lista = JSON.parse(prestamosGuardados);
      setPrestamos(lista);
    }

    const pagosGuardados = localStorage.getItem("pagos");
    if (pagosGuardados) {
      setPagos(JSON.parse(pagosGuardados));
    }
  }, []);

  const registrarPago = () => {
    const monto = Number(montoPagado);

    if (!prestamoId) {
      alert("Selecciona un préstamo");
      return;
    }

    if (!monto || monto <= 0) {
      alert("Ingresa un monto válido");
      return;
    }

    const prestamoSeleccionado = prestamos.find((p) => p.id === prestamoId);
    if (!prestamoSeleccionado) {
      alert("Préstamo no encontrado");
      return;
    }

    const saldoActual =
      typeof prestamoSeleccionado.saldoPendiente === "number"
        ? prestamoSeleccionado.saldoPendiente
        : prestamoSeleccionado.totalPagar;

    const nuevoSaldo = Math.max(saldoActual - monto, 0);

    const actualizados = prestamos.map((p) =>
      p.id === prestamoId
        ? {
            ...p,
            saldoPendiente: nuevoSaldo,
            estado: nuevoSaldo === 0 ? "liquidado" : "activo",
          }
        : p
    );

    setPrestamos(actualizados);
    localStorage.setItem("prestamos", JSON.stringify(actualizados));

    const nuevoPago: Pago = {
      id: Date.now().toString(),
      clienteNombre: prestamoSeleccionado.clienteNombre,
      montoPagado: monto,
      fecha: new Date().toLocaleDateString(),
    };

    const historial = [nuevoPago, ...pagos];
    setPagos(historial);
    localStorage.setItem("pagos", JSON.stringify(historial));

    setPrestamoId("");
    setMontoPagado("");
  };

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>Pagos</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => (window.location.href = "/dashboard")}>
          ← Dashboard
        </button>
        <button onClick={() => (window.location.href = "/prestamos")}>
          Ver préstamos
        </button>
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2>Registrar pago</h2>

        {prestamos.length === 0 ? (
          <p>No hay préstamos registrados.</p>
        ) : (
          <div style={{ display: "grid", gap: 10, maxWidth: 500 }}>
            <select
              value={prestamoId}
              onChange={(e) => setPrestamoId(e.target.value)}
              style={{ padding: 10 }}
            >
              <option value="">Selecciona un préstamo</option>
              {prestamos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.clienteNombre} - Saldo $
                  {(
                    typeof p.saldoPendiente === "number"
                      ? p.saldoPendiente
                      : p.totalPagar
                  ).toFixed(2)}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Monto pagado"
              value={montoPagado}
              onChange={(e) => setMontoPagado(e.target.value)}
              style={{ padding: 10 }}
            />

            <button onClick={registrarPago} style={{ padding: 10 }}>
              Guardar pago
            </button>
          </div>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Estado de préstamos</h2>
        {prestamos.length === 0 ? (
          <p>No hay préstamos.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {prestamos.map((p) => (
              <div key={p.id} style={{ border: "1px solid #ccc", padding: 10 }}>
                <div><strong>Cliente:</strong> {p.clienteNombre}</div>
                <div><strong>Total:</strong> ${p.totalPagar.toFixed(2)}</div>
                <div>
                  <strong>Saldo:</strong> $
                  {(
                    typeof p.saldoPendiente === "number"
                      ? p.saldoPendiente
                      : p.totalPagar
                  ).toFixed(2)}
                </div>
                <div><strong>Estado:</strong> {p.estado || "activo"}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Historial de pagos</h2>
        {pagos.length === 0 ? (
          <p>No hay pagos registrados.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {pagos.map((p) => (
              <div key={p.id} style={{ border: "1px solid #ccc", padding: 10 }}>
                <div><strong>Cliente:</strong> {p.clienteNombre}</div>
                <div><strong>Monto:</strong> ${p.montoPagado.toFixed(2)}</div>
                <div><strong>Fecha:</strong> {p.fecha}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}