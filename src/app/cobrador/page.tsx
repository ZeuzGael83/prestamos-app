"use client";

import { useEffect, useState } from "react";

type Prestamo = {
  id: string;
  clienteId?: string;
  clienteNombre: string;
  saldo: number;
  total: number;
  fecha?: string;
};

type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  ubicacion?: string;
};

export default function CobradorPage() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [prestamoId, setPrestamoId] = useState("");
  const [monto, setMonto] = useState("");

  useEffect(() => {
    const prestamosData = JSON.parse(localStorage.getItem("prestamos") || "[]");
    const clientesData = JSON.parse(localStorage.getItem("clientes") || "[]");

    setPrestamos(prestamosData);
    setClientes(clientesData);
  }, []);

  // 🔴 FILTRO: SOLO MOROSOS
  const morosos = prestamos.filter((p) => p.saldo > 0);

  const registrarPago = () => {
    if (!prestamoId || !monto) return;

    const pagos = JSON.parse(localStorage.getItem("pagos") || "[]");

    const prestamo = prestamos.find((p) => p.id === prestamoId);
    if (!prestamo) return;

    const nuevoSaldo = prestamo.saldo - Number(monto);

    const nuevoPago = {
      prestamoId,
      clienteNombre: prestamo.clienteNombre,
      monto: Number(monto),
      fecha: new Date().toLocaleDateString(),
      saldoRestante: nuevoSaldo,
    };

    const nuevosPagos = [nuevoPago, ...pagos];
    localStorage.setItem("pagos", JSON.stringify(nuevosPagos));

    const nuevosPrestamos = prestamos.map((p) =>
      p.id === prestamoId
        ? { ...p, saldo: nuevoSaldo < 0 ? 0 : nuevoSaldo }
        : p
    );

    localStorage.setItem("prestamos", JSON.stringify(nuevosPrestamos));
    setPrestamos(nuevosPrestamos);

    alert("Pago registrado");

    setMonto("");
    setPrestamoId("");
  };

  const enviarWhatsApp = (nombre: string, telefono: string, saldo: number) => {
    const numero = "52" + telefono.replace(/\D/g, "");

    const mensaje = `Hola ${nombre}, tienes un saldo pendiente de $${saldo}. Por favor realiza tu pago hoy.`;

    window.open(
      `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  };

  const abrirMaps = (ubicacion?: string) => {
    if (!ubicacion) return;

    if (ubicacion.startsWith("http")) {
      window.open(ubicacion, "_blank");
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          ubicacion
        )}`,
        "_blank"
      );
    }
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
      {/* HEADER */}
      <section
        style={{
          background: "linear-gradient(135deg, #7f1d1d, #dc2626)",
          color: "white",
          borderRadius: 24,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>
          Modo cobrador
        </h1>
        <p>Prioriza morosos y cobra más rápido</p>
      </section>

      {/* PAGO RÁPIDO */}
      <section
        style={{
          background: "white",
          padding: 16,
          borderRadius: 20,
          marginBottom: 16,
        }}
      >
        <h3>Pago rápido</h3>

        <select
          value={prestamoId}
          onChange={(e) => setPrestamoId(e.target.value)}
          style={inputStyle}
        >
          <option value="">Selecciona cliente</option>
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
          style={inputStyle}
        />

        <button onClick={registrarPago} style={botonVerde}>
          Registrar pago
        </button>
      </section>

      {/* LISTADO MOROSOS */}
      <section>
        <h2>Morosos</h2>

        <div style={{ display: "grid", gap: 12 }}>
          {morosos.map((p) => {
            const cliente = clientes.find(
              (c) =>
                c.id === p.clienteId ||
                c.nombre === p.clienteNombre
            );

            return (
              <div key={p.id} style={cardRoja}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>
                  {p.clienteNombre}
                </div>

                <div>Saldo: ${p.saldo}</div>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    onClick={() =>
                      enviarWhatsApp(
                        p.clienteNombre,
                        cliente?.telefono || "",
                        p.saldo
                      )
                    }
                    style={botonWhatsapp}
                  >
                    WhatsApp
                  </button>

                  <button
                    onClick={() => abrirMaps(cliente?.ubicacion)}
                    style={botonMaps}
                  >
                    Maps
                  </button>

                  <button
                    onClick={() => {
                      setPrestamoId(p.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={botonAzul}
                  >
                    Cobrar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

/* estilos */
const inputStyle = {
  width: "100%",
  padding: 12,
  marginBottom: 10,
  borderRadius: 10,
  border: "1px solid #ccc",
};

const botonVerde = {
  background: "#16a34a",
  color: "white",
  padding: 12,
  borderRadius: 10,
  width: "100%",
  fontWeight: 700,
};

const botonWhatsapp = {
  background: "#16a34a",
  color: "white",
  padding: 10,
  borderRadius: 8,
};

const botonMaps = {
  background: "#1d4ed8",
  color: "white",
  padding: 10,
  borderRadius: 8,
};

const botonAzul = {
  background: "#0f172a",
  color: "white",
  padding: 10,
  borderRadius: 8,
};

const cardRoja = {
  background: "#fee2e2",
  border: "1px solid #fecaca",
  padding: 14,
  borderRadius: 14,
};