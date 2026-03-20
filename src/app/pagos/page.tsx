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
    const prestamosGuardados = localStorage.getItem("prestamos");
    if (prestamosGuardados) {
      setPrestamos(JSON.parse(prestamosGuardados));
    }

    const pagosGuardados = localStorage.getItem("pagos");
    if (pagosGuardados) {
      setPagos(JSON.parse(pagosGuardados));
    }
  }, []);

  const registrarPago = () => {
    const monto = Number(montoPagado);

    if (!prestamoId || monto <= 0) {
      alert("Datos inválidos");
      return;
    }

    const prestamo = prestamos.find((p) => p.id === prestamoId);
    if (!prestamo) return;

    const saldoActual =
      typeof prestamo.saldoPendiente === "number"
        ? prestamo.saldoPendiente
        : prestamo.totalPagar;

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
      clienteNombre: prestamo.clienteNombre,
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
    <main style={{ padding: 20 }}>
      <h1>Pagos</h1>

      <h2>Registrar pago</h2>

      <select
        value={prestamoId}
        onChange={(e) => setPrestamoId(e.target.value)}
      >
        <option value="">Selecciona un préstamo</option>
        {prestamos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.clienteNombre} - $
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
      />

      <button onClick={registrarPago}>Guardar pago</button>

      <hr />

      <h2>Estado de préstamos</h2>

      {prestamos.map((p) => {
        const saldo =
          typeof p.saldoPendiente === "number"
            ? p.saldoPendiente
            : p.totalPagar;

        return (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
            <div><strong>{p.clienteNombre}</strong></div>
            <div>Total: ${p.totalPagar}</div>
            <div>Saldo: ${saldo}</div>

            {/* BOTÓN WHATSAPP */}
            <button
              onClick={() => {
                const telefono = "52555618557964"; // 🔴 CAMBIA ESTE NÚMERO

                const mensaje = `Hola ${p.clienteNombre}, tienes un saldo pendiente de $${saldo}. Por favor realiza tu pago hoy.`;

                const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

                window.open(url, "_blank");
              }}
              style={{
                marginTop: 10,
                background: "#25D366",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: 6,
              }}
            >
              Enviar WhatsApp
            </button>
          </div>
        );
      })}

      <h2>Historial</h2>

      {pagos.map((p) => (
        <div key={p.id}>
          {p.clienteNombre} - ${p.montoPagado}
        </div>
      ))}
    </main>
  );
}