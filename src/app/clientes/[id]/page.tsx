"use client";

import { useEffect, useState } from "react";

type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
  ubicacion?: string;
};

type Prestamo = {
  id: string;
  clienteId?: string;
  clienteNombre: string;
  total?: number;
  totalPagar?: number;
  saldo?: number;
  saldoPendiente?: number;
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
    try {
      const clientesData = JSON.parse(localStorage.getItem("clientes") || "[]");
      const prestamosData = JSON.parse(localStorage.getItem("prestamos") || "[]");
      const pagosData = JSON.parse(localStorage.getItem("pagos") || "[]");

      const clienteEncontrado = clientesData.find(
        (c: Cliente) => c.id === params.id
      );

      setCliente(clienteEncontrado || null);

      const prestamosCliente = prestamosData.filter((p: Prestamo) => {
        if (p.clienteId) return p.clienteId === params.id;
        return (
          clienteEncontrado &&
          p.clienteNombre?.trim().toLowerCase() ===
            clienteEncontrado.nombre.trim().toLowerCase()
        );
      });

      setPrestamos(prestamosCliente);
      setPagos(Array.isArray(pagosData) ? pagosData : []);
    } catch (e) {
      console.log("Error cargando detalle del cliente", e);
    }
  }, [params.id]);

  if (!cliente) {
    return <main style={{ padding: 20 }}>Cliente no encontrado.</main>;
  }

  const totalPendiente = prestamos.reduce((acc, p) => {
    const totalBase =
      typeof p.total === "number"
        ? p.total
        : typeof p.totalPagar === "number"
        ? p.totalPagar
        : 0;

    const saldo =
      typeof p.saldo === "number"
        ? p.saldo
        : typeof p.saldoPendiente === "number"
        ? p.saldoPendiente
        : totalBase;

    return acc + saldo;
  }, 0);

  const telefonoWhatsapp = `52${cliente.telefono}`;
  const mensaje = `Hola ${cliente.nombre}, tu saldo pendiente total es de $${totalPendiente}.`;
  const urlWhatsapp = `https://wa.me/${telefonoWhatsapp}?text=${encodeURIComponent(
    mensaje
  )}`;

  const abrirMaps = () => {
    if (!cliente.ubicacion) {
      alert("Este cliente no tiene ubicación registrada.");
      return;
    }

    const valor = cliente.ubicacion.trim();

    if (valor.startsWith("http")) {
      window.open(valor, "_blank");
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      valor
    )}`;
    window.open(url, "_blank");
  };

  return (
    <main style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Ficha del cliente</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <button onClick={() => (window.location.href = "/clientes")}>
          ← Volver a clientes
        </button>

        <button
          onClick={() => window.open(urlWhatsapp, "_blank")}
          style={{ background: "green", color: "white" }}
        >
          WhatsApp
        </button>

        <button onClick={abrirMaps}>
          Abrir en Maps
        </button>
      </div>

      <section
        style={{
          border: "1px solid #ccc",
          padding: 12,
          marginBottom: 20,
          maxWidth: 600,
        }}
      >
        <div><strong>Nombre:</strong> {cliente.nombre}</div>
        <div><strong>Teléfono:</strong> {cliente.telefono}</div>
        <div><strong>Dirección:</strong> {cliente.direccion}</div>
        <div><strong>Ubicación:</strong> {cliente.ubicacion || "No registrada"}</div>
        <div><strong>Total pendiente:</strong> ${totalPendiente}</div>
      </section>

      <h2>Préstamos del cliente</h2>

      {prestamos.length === 0 ? (
        <p>No hay préstamos asociados.</p>
      ) : (
        prestamos.map((prestamo) => {
          const totalBase =
            typeof prestamo.total === "number"
              ? prestamo.total
              : typeof prestamo.totalPagar === "number"
              ? prestamo.totalPagar
              : 0;

          const saldo =
            typeof prestamo.saldo === "number"
              ? prestamo.saldo
              : typeof prestamo.saldoPendiente === "number"
              ? prestamo.saldoPendiente
              : totalBase;

          const pagosPrestamo = pagos.filter(
            (pago) => pago.prestamoId === prestamo.id
          );

          return (
            <div
              key={prestamo.id}
              style={{
                border: "1px solid #ccc",
                padding: 12,
                marginBottom: 16,
                maxWidth: 650,
              }}
            >
              <div><strong>Total:</strong> ${totalBase}</div>
              <div><strong>Saldo:</strong> ${saldo}</div>

              <h3 style={{ marginTop: 16 }}>Historial de pagos</h3>

              {pagosPrestamo.length === 0 ? (
                <p>No hay pagos registrados para este préstamo.</p>
              ) : (
                pagosPrestamo.map((pago, index) => (
                  <div
                    key={index}
                    style={{
                      borderTop: "1px solid #eee",
                      paddingTop: 8,
                      marginTop: 8,
                    }}
                  >
                    <div>Monto: ${pago.monto}</div>
                    <div>Fecha: {pago.fecha}</div>
                  </div>
                ))
              )}
            </div>
          );
        })
      )}
    </main>
  );
}