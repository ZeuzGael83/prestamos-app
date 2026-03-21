"use client";

import { useEffect, useState } from "react";

export default function CobradorPage() {
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [prestamoId, setPrestamoId] = useState("");
  const [monto, setMonto] = useState("");

  useEffect(() => {
    setPrestamos(JSON.parse(localStorage.getItem("prestamos") || "[]"));
    setClientes(JSON.parse(localStorage.getItem("clientes") || "[]"));
    setPagos(JSON.parse(localStorage.getItem("pagos") || "[]"));
  }, []);

  const parseFecha = (f: string) => {
    const [d, m, y] = f.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const ultimoPago = (id: string) => {
    const lista = pagos.filter((p) => p.prestamoId === id);
    if (!lista.length) return null;

    return lista.sort(
      (a, b) => parseFecha(b.fecha).getTime() - parseFecha(a.fecha).getTime()
    )[0];
  };

  const diasSinPagar = (id: string) => {
    const u = ultimoPago(id);
    if (!u) return 999;

    const diff = new Date().getTime() - parseFecha(u.fecha).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // 🔥 ORDEN INTELIGENTE
  const morosos = prestamos
    .filter((p) => p.saldo > 0)
    .map((p) => ({
      ...p,
      dias: diasSinPagar(p.id),
    }))
    .sort((a, b) => {
      if (b.dias !== a.dias) return b.dias - a.dias;
      return b.saldo - a.saldo;
    });

  const clienteInfo = (p: any) =>
    clientes.find(
      (c) => c.id === p.clienteId || c.nombre === p.clienteNombre
    );

  // 🔥 MENSAJE INTELIGENTE
  const mensaje = (nombre: string, saldo: number, dias: number) => {
    if (dias > 7) {
      return `⚠️ ${nombre}, tienes un atraso de ${dias} días. Tu saldo es $${saldo}. Es necesario realizar tu pago hoy.`;
    }
    if (dias > 3) {
      return `Hola ${nombre}, tienes ${dias} días de atraso. Tu saldo es $${saldo}. Te pedimos regularizar tu pago.`;
    }
    return `Hola ${nombre}, tu saldo pendiente es $${saldo}. Te recordamos realizar tu pago.`;
  };

  const enviarWhatsApp = (p: any) => {
    const cliente = clienteInfo(p);
    if (!cliente?.telefono) return;

    const numero = "52" + cliente.telefono.replace(/\D/g, "");

    window.open(
      `https://wa.me/${numero}?text=${encodeURIComponent(
        mensaje(p.clienteNombre, p.saldo, p.dias)
      )}`
    );
  };

  const abrirMaps = (p: any) => {
    const cliente = clienteInfo(p);
    if (!cliente?.ubicacion) return;

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        cliente.ubicacion
      )}`
    );
  };

  const registrarPago = () => {
    if (!prestamoId || !monto) return;

    const prestamo = prestamos.find((p) => p.id === prestamoId);
    if (!prestamo) return;

    const nuevoSaldo = prestamo.saldo - Number(monto);

    const nuevoPago = {
      prestamoId,
      monto: Number(monto),
      fecha: new Date().toLocaleDateString(),
    };

    const nuevosPagos = [nuevoPago, ...pagos];
    localStorage.setItem("pagos", JSON.stringify(nuevosPagos));

    const nuevosPrestamos = prestamos.map((p) =>
      p.id === prestamoId
        ? { ...p, saldo: nuevoSaldo < 0 ? 0 : nuevoSaldo }
        : p
    );

    localStorage.setItem("prestamos", JSON.stringify(nuevosPrestamos));

    setPagos(nuevosPagos);
    setPrestamos(nuevosPrestamos);

    setMonto("");
    setPrestamoId("");
  };

  const colorEstado = (dias: number) => {
    if (dias > 7) return "#fecaca"; // rojo
    if (dias > 3) return "#fde68a"; // amarillo
    return "#dcfce7"; // verde
  };

  return (
    <main style={{ padding: 16, background: "#eef2ff" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>
        🚀 Modo Cobrador PRO
      </h1>

      {/* PAGO RÁPIDO */}
      <div style={{ background: "white", padding: 16, borderRadius: 12 }}>
        <select
          value={prestamoId}
          onChange={(e) => setPrestamoId(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        >
          <option value="">Selecciona</option>
          {morosos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.clienteNombre} - ${p.saldo}
            </option>
          ))}
        </select>

        <input
          placeholder="Monto"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          style={{ width: "100%", padding: 10 }}
        />

        <button
          onClick={registrarPago}
          style={{
            marginTop: 10,
            background: "#16a34a",
            color: "white",
            padding: 12,
            width: "100%",
            borderRadius: 10,
          }}
        >
          Registrar pago
        </button>
      </div>

      {/* LISTA */}
      <div style={{ marginTop: 20 }}>
        {morosos.map((p) => (
          <div
            key={p.id}
            style={{
              background: colorEstado(p.dias),
              padding: 14,
              borderRadius: 12,
              marginBottom: 10,
            }}
          >
            <strong>{p.clienteNombre}</strong>
            <div>Saldo: ${p.saldo}</div>
            <div>Días: {p.dias}</div>

            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <button onClick={() => enviarWhatsApp(p)}>WhatsApp</button>
              <button onClick={() => abrirMaps(p)}>Maps</button>
              <button
                onClick={() => {
                  setPrestamoId(p.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Cobrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}