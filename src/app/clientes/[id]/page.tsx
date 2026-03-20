"use client";

import { useEffect, useState } from "react";

type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
};

type Prestamo = {
  id: string;
  clienteId?: string;
  clienteNombre: string;
  total?: number;
  saldo?: number;
};

type Pago = {
  prestamoId: string;
  monto: number;
  fecha: string;
};

export default function ClienteDetalle({ params }: any) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);

  useEffect(() => {
    const clientesData = JSON.parse(localStorage.getItem("clientes") || "[]");
    const prestamosData = JSON.parse(localStorage.getItem("prestamos") || "[]");
    const pagosData = JSON.parse(localStorage.getItem("pagos") || "[]");

    const clienteEncontrado = clientesData.find(
      (c: Cliente) => c.id === params.id
    );

    setCliente(clienteEncontrado || null);

    const prestamosCliente = prestamosData.filter(
      (p: Prestamo) => p.clienteId === params.id
    );

    setPrestamos(prestamosCliente);
    setPagos(pagosData);
  }, [params.id]);

  if (!cliente) return <div>Cargando...</div>;

  const totalSaldo = prestamos.reduce((acc, p) => {
    return acc + (p.saldo || p.total || 0);
  }, 0);

  const abrirWhatsapp = () => {
    const telefono = `52${cliente.telefono}`;
    const mensaje = `Hola ${cliente.nombre}, tienes un saldo pendiente total de $${totalSaldo}.`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Ficha del cliente</h1>

      <button onClick={() => (window.location.href = "/clientes")}>
        ← Volver
      </button>

      <hr />

      <h2>{cliente.nombre}</h2>
      <p>📞 {cliente.telefono}</p>
      <p>📍 {cliente.direccion}</p>

      <button
        onClick={abrirWhatsapp}
        style={{ background: "green", color: "white" }}
      >
        WhatsApp
      </button>

      <hr />

      <h3>Préstamos</h3>

      {prestamos.map((p) => (
        <div key={p.id} style={{ border: "1px solid #ccc", padding: 10 }}>
          <div>Total: ${p.total}</div>
          <div>Saldo: ${p.saldo}</div>

          <h4>Pagos:</h4>

          {pagos
            .filter((pg) => pg.prestamoId === p.id)
            .map((pg, i) => (
              <div key={i}>
                💰 ${pg.monto} — {pg.fecha}
              </div>
            ))}
        </div>
      ))}

      <hr />

      <h3>Total pendiente: ${totalSaldo}</h3>
    </main>
  );
}