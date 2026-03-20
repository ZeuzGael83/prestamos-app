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

type Pago = {
  prestamoId: string;
  clienteId?: string;
  clienteNombre: string;
  monto: number;
  fecha: string;
  folio: string;
  saldoRestante: number;
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

  const generarFolio = () => {
    const ahora = new Date();
    const yyyy = ahora.getFullYear();
    const mm = String(ahora.getMonth() + 1).padStart(2, "0");
    const dd = String(ahora.getDate()).padStart(2, "0");
    const hh = String(ahora.getHours()).padStart(2, "0");
    const mi = String(ahora.getMinutes()).padStart(2, "0");
    const ss = String(ahora.getSeconds()).padStart(2, "0");

    return `PG-${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
  };

  const abrirWhatsappConTicket = (
    prestamo: Prestamo,
    montoPagado: number,
    saldoRestante: number,
    folio: string
  ) => {
    const telefonoOriginal = obtenerTelefonoCliente(prestamo);
    const telefono = normalizarTelefonoWhatsapp(telefonoOriginal);

    if (!telefono) {
      alert("Pago guardado, pero el cliente no tiene teléfono válido.");
      return;
    }

    const fecha = new Date().toLocaleDateString();

    const mensaje = `🧾 Ticket de pago
Folio: ${folio}
Cliente: ${prestamo.clienteNombre}
Fecha: ${fecha}
Monto pagado: $${montoPagado}
Saldo restante: $${saldoRestante}

Gracias por su pago.`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(url, "_blank");
  };

  const guardarPago = () => {
    const montoNum = Number(monto);

    if (!prestamoId || montoNum <= 0) {
      alert("Datos inválidos");
      return;
    }

    const prestamoSeleccionado = prestamos.find((p) => p.id === prestamoId);

    if (!prestamoSeleccionado) {
      alert("Préstamo no encontrado");
      return;
    }

    const totalBase =
      typeof prestamoSeleccionado.total === "number"
        ? prestamoSeleccionado.total
        : typeof prestamoSeleccionado.totalPagar === "number"
        ? prestamoSeleccionado.totalPagar
        : 0;

    const saldoActual =
      typeof prestamoSeleccionado.saldo === "number"
        ? prestamoSeleccionado.saldo
        : typeof prestamoSeleccionado.saldoPendiente === "number"
        ? prestamoSeleccionado.saldoPendiente
        : totalBase;

    if (montoNum > saldoActual) {
      alert("El pago no puede ser mayor al saldo pendiente");
      return;
    }

    const nuevoSaldo = saldoActual - montoNum < 0 ? 0 : saldoActual - montoNum;

    const nuevosPrestamos = prestamos.map((p) => {
      if (p.id === prestamoId) {
        return {
          ...p,
          saldo: nuevoSaldo,
          saldoPendiente: nuevoSaldo,
        };
      }

      return p;
    });

    const pagosGuardados = JSON.parse(localStorage.getItem("pagos") || "[]");
    const folio = generarFolio();
    const fecha = new Date().toLocaleDateString();

    const nuevoPago: Pago = {
      prestamoId: prestamoId,
      clienteId: prestamoSeleccionado.clienteId,
      clienteNombre: prestamoSeleccionado.clienteNombre,
      monto: montoNum,
      fecha,
      folio,
      saldoRestante: nuevoSaldo,
    };

    const nuevosPagos = [nuevoPago, ...pagosGuardados];

    localStorage.setItem("pagos", JSON.stringify(nuevosPagos));
    setPrestamos(nuevosPrestamos);
    localStorage.setItem("prestamos", JSON.stringify(nuevosPrestamos));

    setMonto("");
    setPrestamoId("");

    abrirWhatsappConTicket(
      prestamoSeleccionado,
      montoNum,
      nuevoSaldo,
      folio
    );
  };

  return (
    <main style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
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
              onClick={() =>
                abrirWhatsappConTicket(p, 0, saldo, "CONSULTA-SALDO")
              }
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