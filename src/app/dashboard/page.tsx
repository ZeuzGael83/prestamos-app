"use client";

import { useEffect, useMemo, useState } from "react";

type Cliente = {
  id: string;
  nombre: string;
};

type Prestamo = {
  id: string;
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

export default function DashboardPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);

  useEffect(() => {
    try {
      const auth = localStorage.getItem("auth");
      if (auth !== "true") {
        window.location.href = "/login";
        return;
      }

      const clientesData = JSON.parse(localStorage.getItem("clientes") || "[]");
      const prestamosData = JSON.parse(localStorage.getItem("prestamos") || "[]");
      const pagosData = JSON.parse(localStorage.getItem("pagos") || "[]");

      setClientes(Array.isArray(clientesData) ? clientesData : []);
      setPrestamos(Array.isArray(prestamosData) ? prestamosData : []);
      setPagos(Array.isArray(pagosData) ? pagosData : []);
    } catch (e) {
      console.log("Error cargando dashboard", e);
    }
  }, []);

  const parseFecha = (fecha: string) => {
    const [d, m, y] = fecha.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const obtenerUltimoPago = (prestamoId: string) => {
    const lista = pagos.filter((p) => p.prestamoId === prestamoId);
    if (!lista.length) return null;

    return [...lista].sort(
      (a, b) => parseFecha(b.fecha).getTime() - parseFecha(a.fecha).getTime()
    )[0];
  };

  const diasSinPagar = (prestamoId: string) => {
    const ultimo = obtenerUltimoPago(prestamoId);
    if (!ultimo) return null;

    const diff = new Date().getTime() - parseFecha(ultimo.fecha).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const hoyTexto = new Date().toLocaleDateString();

  const kpis = useMemo(() => {
    const clientesRegistrados = clientes.length;

    const prestamosActivos = prestamos.filter((p) => {
      const saldo =
        typeof p.saldo === "number"
          ? p.saldo
          : typeof p.saldoPendiente === "number"
          ? p.saldoPendiente
          : typeof p.total === "number"
          ? p.total
          : typeof p.totalPagar === "number"
          ? p.totalPagar
          : 0;

      return saldo > 0;
    }).length;

    const carteraColocada = prestamos.reduce((acc, p) => {
      const total =
        typeof p.total === "number"
          ? p.total
          : typeof p.totalPagar === "number"
          ? p.totalPagar
          : 0;
      return acc + total;
    }, 0);

    const saldoPorCobrar = prestamos.reduce((acc, p) => {
      const saldo =
        typeof p.saldo === "number"
          ? p.saldo
          : typeof p.saldoPendiente === "number"
          ? p.saldoPendiente
          : typeof p.total === "number"
          ? p.total
          : typeof p.totalPagar === "number"
          ? p.totalPagar
          : 0;
      return acc + saldo;
    }, 0);

    const totalRecuperado = pagos.reduce((acc, p) => acc + (p.monto || 0), 0);

    const morosos = prestamos.filter((p) => {
      const saldo =
        typeof p.saldo === "number"
          ? p.saldo
          : typeof p.saldoPendiente === "number"
          ? p.saldoPendiente
          : typeof p.total === "number"
          ? p.total
          : typeof p.totalPagar === "number"
          ? p.totalPagar
          : 0;

      if (saldo <= 0) return false;

      const dias = diasSinPagar(p.id);
      return dias !== null && dias > 3;
    }).length;

    const alCorriente = prestamos.filter((p) => {
      const saldo =
        typeof p.saldo === "number"
          ? p.saldo
          : typeof p.saldoPendiente === "number"
          ? p.saldoPendiente
          : typeof p.total === "number"
          ? p.total
          : typeof p.totalPagar === "number"
          ? p.totalPagar
          : 0;

      if (saldo <= 0) return false;

      const dias = diasSinPagar(p.id);
      return dias !== null && dias <= 3;
    }).length;

    const pagosRegistrados = pagos.length;

    const cobradoHoy = pagos
      .filter((p) => p.fecha === hoyTexto)
      .reduce((acc, p) => acc + (p.monto || 0), 0);

    const ultimoPagoRegistrado =
      pagos.length > 0
        ? [...pagos].sort(
            (a, b) => parseFecha(b.fecha).getTime() - parseFecha(a.fecha).getTime()
          )[0]
        : null;

    const topMorosos = prestamos
      .map((p) => {
        const saldo =
          typeof p.saldo === "number"
            ? p.saldo
            : typeof p.saldoPendiente === "number"
            ? p.saldoPendiente
            : typeof p.total === "number"
            ? p.total
            : typeof p.totalPagar === "number"
            ? p.totalPagar
            : 0;

        const dias = diasSinPagar(p.id);

        return {
          id: p.id,
          clienteNombre: p.clienteNombre,
          saldo,
          dias: dias ?? 0,
        };
      })
      .filter((p) => p.saldo > 0 && p.dias > 3)
      .sort((a, b) => {
        if (b.dias !== a.dias) return b.dias - a.dias;
        return b.saldo - a.saldo;
      })
      .slice(0, 3);

    return {
      clientesRegistrados,
      prestamosActivos,
      carteraColocada,
      saldoPorCobrar,
      totalRecuperado,
      morosos,
      alCorriente,
      pagosRegistrados,
      cobradoHoy,
      ultimoPagoRegistrado,
      topMorosos,
    };
  }, [clientes, prestamos, pagos, hoyTexto]);

  return (
    <main style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Dashboard</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <button onClick={() => (window.location.href = "/clientes")}>Clientes</button>
        <button onClick={() => (window.location.href = "/prestamos")}>Préstamos</button>
        <button onClick={() => (window.location.href = "/pagos")}>Pagos</button>
        <button
          onClick={() => {
            localStorage.removeItem("auth");
            window.location.href = "/login";
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Card titulo="Clientes registrados" valor={String(kpis.clientesRegistrados)} />
        <Card titulo="Préstamos activos" valor={String(kpis.prestamosActivos)} />
        <Card titulo="Cartera colocada" valor={`$${kpis.carteraColocada.toFixed(2)}`} />
        <Card titulo="Saldo por cobrar" valor={`$${kpis.saldoPorCobrar.toFixed(2)}`} />
        <Card titulo="Total recuperado" valor={`$${kpis.totalRecuperado.toFixed(2)}`} />
        <Card titulo="Morosos" valor={String(kpis.morosos)} />
        <Card titulo="Al corriente" valor={String(kpis.alCorriente)} />
        <Card titulo="Pagos registrados" valor={String(kpis.pagosRegistrados)} />
      </div>

      <h2>Resumen ejecutivo</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Box titulo="Cobrado hoy">
          <strong style={{ fontSize: 28 }}>${kpis.cobradoHoy.toFixed(2)}</strong>
        </Box>

        <Box titulo="Último pago registrado">
          {kpis.ultimoPagoRegistrado ? (
            <>
              <div><strong>Monto:</strong> ${kpis.ultimoPagoRegistrado.monto}</div>
              <div><strong>Fecha:</strong> {kpis.ultimoPagoRegistrado.fecha}</div>
            </>
          ) : (
            <div>No hay pagos registrados.</div>
          )}
        </Box>

        <Box titulo="Top 3 morosos">
          {kpis.topMorosos.length > 0 ? (
            kpis.topMorosos.map((m, i) => (
              <div key={m.id} style={{ marginBottom: 8 }}>
                <div><strong>{i + 1}. {m.clienteNombre}</strong></div>
                <div>Saldo: ${m.saldo}</div>
                <div>Días sin pagar: {m.dias}</div>
              </div>
            ))
          ) : (
            <div>No hay morosos.</div>
          )}
        </Box>
      </div>
    </main>
  );
}

function Card({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 14,
        borderRadius: 10,
        background: "white",
      }}
    >
      <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>{titulo}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{valor}</div>
    </div>
  );
}

function Box({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 14,
        borderRadius: 10,
        background: "white",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{titulo}</div>
      {children}
    </div>
  );
}