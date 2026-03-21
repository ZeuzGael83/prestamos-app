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
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [monto, setMonto] = useState("");
  const [prestamoId, setPrestamoId] = useState("");

  // 🔥 FILTRO
  const [filtro, setFiltro] = useState<"todos" | "morosos" | "corriente">("todos");

  useEffect(() => {
    try {
      const clientesData = localStorage.getItem("clientes");
      if (clientesData) setClientes(JSON.parse(clientesData));

      const prestamosData = localStorage.getItem("prestamos");
      if (prestamosData) setPrestamos(JSON.parse(prestamosData));

      const pagosData = localStorage.getItem("pagos");
      if (pagosData) setPagos(JSON.parse(pagosData));
    } catch (e) {
      console.log("Error cargando datos", e);
    }
  }, []);

  const obtenerTelefonoCliente = (prestamo: Prestamo) => {
    const cliente = clientes.find(
      (c) =>
        c.id === prestamo.clienteId ||
        c.nombre.toLowerCase() === prestamo.clienteNombre.toLowerCase()
    );
    return cliente?.telefono || "";
  };

  const normalizarTelefonoWhatsapp = (telefono: string) => {
    const digitos = telefono.replace(/\D/g, "");
    if (digitos.length === 10) return `52${digitos}`;
    return digitos;
  };

  const generarFolio = () => {
    const ahora = new Date();
    return `PG-${ahora.getTime()}`;
  };

  const abrirWhatsappSaldo = (prestamo: Prestamo, saldo: number) => {
    const telefono = normalizarTelefonoWhatsapp(
      obtenerTelefonoCliente(prestamo)
    );

    const mensaje = `Hola ${prestamo.clienteNombre}, tu saldo pendiente es de $${saldo}.`;

    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`);
  };

  const guardarPago = () => {
    const montoNum = Number(monto);

    if (!prestamoId || montoNum <= 0) return;

    const prestamo = prestamos.find((p) => p.id === prestamoId);
    if (!prestamo) return;

    const saldoActual = prestamo.saldo ?? prestamo.total ?? 0;
    const nuevoSaldo = saldoActual - montoNum;

    const nuevosPrestamos = prestamos.map((p) =>
      p.id === prestamoId
        ? { ...p, saldo: nuevoSaldo < 0 ? 0 : nuevoSaldo }
        : p
    );

    const nuevoPago: Pago = {
      prestamoId,
      clienteNombre: prestamo.clienteNombre,
      monto: montoNum,
      fecha: new Date().toLocaleDateString(),
      folio: generarFolio(),
      saldoRestante: nuevoSaldo,
    };

    const nuevosPagos = [nuevoPago, ...pagos];

    localStorage.setItem("pagos", JSON.stringify(nuevosPagos));
    localStorage.setItem("prestamos", JSON.stringify(nuevosPrestamos));

    setPagos(nuevosPagos);
    setPrestamos(nuevosPrestamos);

    setMonto("");
    setPrestamoId("");
  };

  const parseFecha = (fecha: string) => {
    const [d, m, y] = fecha.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const obtenerUltimoPago = (id: string) => {
    const lista = pagos.filter((p) => p.prestamoId === id);
    if (!lista.length) return null;
    return lista.sort(
      (a, b) => parseFecha(b.fecha).getTime() - parseFecha(a.fecha).getTime()
    )[0];
  };

  const diasSinPagar = (id: string) => {
    const ultimo = obtenerUltimoPago(id);
    if (!ultimo) return null;
    const diff = new Date().getTime() - parseFecha(ultimo.fecha).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const estadoPrestamo = (p: Prestamo, saldo: number) => {
    if (saldo <= 0) return "liquidado";

    const dias = diasSinPagar(p.id);
    if (dias === null) return "sinpagos";

    if (dias > 3) return "moroso";

    return "corriente";
  };

  const prestamosFiltrados = prestamos.filter((p) => {
    const saldo = p.saldo ?? p.total ?? 0;
    const estado = estadoPrestamo(p, saldo);

    if (filtro === "morosos") return estado === "moroso";
    if (filtro === "corriente") return estado === "corriente";

    return true;
  });

  return (
    <main style={{ padding: 20 }}>
      <h1>Pagos</h1>

      <h3>Registrar pago</h3>

      <select onChange={(e) => setPrestamoId(e.target.value)}>
        <option>Selecciona préstamo</option>
        {prestamos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.clienteNombre}
          </option>
        ))}
      </select>

      <input
        placeholder="Monto"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
      />

      <button onClick={guardarPago}>Guardar</button>

      <hr />

      {/* 🔥 FILTROS */}
      <div style={{ marginBottom: 15 }}>
        <button onClick={() => setFiltro("todos")}>Todos</button>
        <button onClick={() => setFiltro("morosos")}>Morosos</button>
        <button onClick={() => setFiltro("corriente")}>Al corriente</button>
      </div>

      <h2>Estado</h2>

      {prestamosFiltrados.map((p) => {
        const saldo = p.saldo ?? p.total ?? 0;
        const estado = estadoPrestamo(p, saldo);
        const dias = diasSinPagar(p.id);

        return (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: 10 }}>
            <strong>{p.clienteNombre}</strong>
            <div>Saldo: ${saldo}</div>

            <div style={{ marginTop: 5 }}>
              {estado === "moroso" && (
                <span style={{ color: "red" }}>
                  ⚠️ MOROSO ({dias} días)
                </span>
              )}

              {estado === "corriente" && (
                <span style={{ color: "green" }}>
                  ✅ Al corriente ({dias} días)
                </span>
              )}

              {estado === "sinpagos" && (
                <span>Sin pagos registrados</span>
              )}

              {estado === "liquidado" && <span>Liquidado</span>}
            </div>

            <button
              onClick={() => abrirWhatsappSaldo(p, saldo)}
              style={{ marginTop: 10 }}
            >
              WhatsApp
            </button>
          </div>
        );
      })}
    </main>
  );
}