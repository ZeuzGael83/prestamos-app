"use client";

import { useEffect, useState } from "react";

export default function PagosPage() {
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [monto, setMonto] = useState("");
  const [prestamoId, setPrestamoId] = useState("");

  useEffect(() => {
    try {
      const data = localStorage.getItem("prestamos");
      if (data) {
        setPrestamos(JSON.parse(data));
      }
    } catch (e) {
      console.log("Error cargando préstamos");
    }
  }, []);

  const guardarPago = () => {
    const montoNum = Number(monto);
    if (!prestamoId || montoNum <= 0) {
      alert("Datos inválidos");
      return;
    }

    const nuevos = prestamos.map((p) => {
      if (p.id === prestamoId) {
        const saldo = p.saldo ?? p.total;
        const nuevoSaldo = saldo - montoNum;

        return {
          ...p,
          saldo: nuevoSaldo < 0 ? 0 : nuevoSaldo,
        };
      }
      return p;
    });

    setPrestamos(nuevos);
    localStorage.setItem("prestamos", JSON.stringify(nuevos));

    setMonto("");
    setPrestamoId("");
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Pagos</h1>

      <h3>Registrar pago</h3>

      <select onChange={(e) => setPrestamoId(e.target.value)}>
        <option value="">Selecciona préstamo</option>
        {prestamos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.clienteNombre} - $
            {(p.saldo ?? p.total)?.toFixed?.(2)}
          </option>
        ))}
      </select>

      <input
        placeholder="Monto"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
      />

      <button onClick={guardarPago}>Guardar pago</button>

      <hr />

      <h3>Estado</h3>

      {prestamos.map((p) => {
        const saldo = p.saldo ?? p.total;

        return (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
            <div><strong>{p.clienteNombre}</strong></div>
            <div>Total: ${p.total}</div>
            <div>Saldo: ${saldo}</div>

            {/* WhatsApp seguro */}
            <button
              onClick={() => {
                const mensaje = `Hola ${p.clienteNombre}, tu saldo pendiente es $${saldo}`;
                const url = `https://wa.me/521234567890?text=${encodeURIComponent(mensaje)}`;
                window.open(url);
              }}
              style={{ marginTop: 10, background: "green", color: "white" }}
            >
              WhatsApp
            </button>
          </div>
        );
      })}
    </main>
  );
}