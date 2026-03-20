"use client";

import { useEffect, useState } from "react";

type Cliente = {
  id: string;
  nombre: string;
  telefono?: string;
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

export default function PagosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [monto, setMonto] = useState("");
  const [prestamoId, setPrestamoId] = useState("");

  useEffect(() => {
    try {
      const clientesData = localStorage.getItem("clientes");
      if (clientesData) {
        const listaClientes = JSON.parse(clientesData);
        if (Array.isArray(listaClientes)) setClientes(listaClientes);
      }

      const prestamosData = localStorage.getItem("prestamos");
      if (prestamosData) {
        const listaPrestamos = JSON.parse(prestamosData);
        if (Array.isArray(listaPrestamos)) setPrestamos(listaPrestamos);
      }
    } catch (e) {
      console.log("Error cargando datos", e);
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
        const totalBase =
          typeof p.total === "number"
            ? p.total
            : typeof p.totalPagar === "number"
            ? p.totalPagar
            : 0;

        const saldoActual =
          typeof p.saldo === "number"
            ? p.saldo
            : typeof p.saldoPendiente === "number"
            ? p.saldoPendiente
            : totalBase;

        const nuevoSaldo = saldoActual - montoNum;

        return {
          ...p,
          saldo: nuevoSaldo < 0 ? 0 : nuevoSaldo,
          saldoPendiente: nuevoSaldo < 0 ? 0 : nuevoSaldo,
        };
      }

      return p;
    });

    setPrestamos(nuevos);
    localStorage.setItem("prestamos", JSON.stringify(nuevos));

    setMonto("");
    setPrestamoId("");
  };

  const obtenerTelefonoCliente = (prestamo: Prestamo) => {
    const porId = clientes.find(
      (c) => prestamo.clienteId && c.id === prestamo.clienteId
    );

    if (porId?.telefono) return porId.telefono;

    const porNombre = clientes.find(
      (c) =>
        c.nombre.trim().toLowerCase() ===
        prestamo.clienteNombre.trim().toLowerCase()
    );

    return porNombre?.telefono || "";
  };

  const normalizarTelefonoWhatsapp = (telefono: string) => {
    const digitos = telefono.replace(/\D/g, "");

    if (!digitos) return "";

    if (digitos.startsWith("52") && digitos.length === 12) {
      return digitos;
    }

    if (digitos.length === 10) {
      return `52${digitos}`;
    }

    return digitos;
  };

  const abrirWhatsapp = (prestamo: Prestamo) => {
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

    const telefonoOriginal = obtenerTelefonoCliente(prestamo);
    const telefono = normalizarTelefonoWhatsapp(telefonoOriginal);

    if (!telefono) {
      alert("Cliente sin teléfono válido");
      return;
    }

    const mensajeBase = `Hola ${prestamo.clienteNombre}, tienes un saldo pendiente de $${saldo}. Por favor realiza tu pago hoy.`;

    const mensajeEditado = window.prompt(
      "Edita el mensaje antes de enviarlo:",
      mensajeBase
    );

    if (!mensajeEditado) {
      return;
    }

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(
      mensajeEditado
    )}`;

    window.open(url, "_blank");
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Pagos</h1>

      <h2>Registrar pago</h2>

      <select value={prestamoId} onChange={(e) => setPrestamoId(e.target.value)}>
        <option value="">Selecciona préstamo</option>
        {prestamos.map((p) => {
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

          return (
            <option key={p.id} value={p.id}>
              {p.clienteNombre} - ${saldo.toFixed(2)}
            </option>
          );
        })}
      </select>

      <input
        placeholder="Monto"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
      />

      <button onClick={guardarPago}>Guardar pago</button>

      <hr />

      <h2>Estado</h2>

      {prestamos.map((p) => {
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

        return (
          <div
            key={p.id}
            style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
          >
            <div>
              <strong>{p.clienteNombre}</strong>
            </div>
            <div>Total: ${totalBase}</div>
            <div>Saldo: ${saldo}</div>

            <button
              onClick={() => abrirWhatsapp(p)}
              style={{
                marginTop: 10,
                background: "green",
                color: "white",
              }}
            >
              WhatsApp
            </button>
          </div>
        );
      })}
    </main>
  );
}