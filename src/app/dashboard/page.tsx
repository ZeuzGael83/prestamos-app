"use client";

import { useEffect, useMemo, useState } from "react";

type Cliente = {
  id: string;
  nombre: string;
  telefono?: string;
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

  const clientePorNombre = (nombre: string) =>
    clientes.find((c) => c.nombre === nombre);

  const abrirWhatsAppMoroso = (nombre: string, saldo: number) => {
    const cliente = clientePorNombre(nombre);
    if (!cliente?.telefono) {
      alert("El cliente no tiene teléfono registrado.");
      return;
    }

    const numero = "52" + cliente.telefono.replace(/\D/g, "");
    const mensaje = `Hola ${cliente.nombre}, tienes un saldo pendiente de $${saldo}. Por favor realiza tu pago hoy.`;

    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, "_blank");
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
      <section
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
          color: "white",
          borderRadius: 24,
          padding: 20,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.25)",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "8px 14px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.14)",
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          Sistema de administración de préstamos
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 40,
            lineHeight: 1.05,
            fontWeight: 800,
          }}
        >
          Dashboard
          <br />
          ejecutivo
        </h1>

        <p
          style={{
            marginTop: 14,
            marginBottom: 18,
            color: "rgba(255,255,255,0.88)",
            fontSize: 18,
            lineHeight: 1.5,
          }}
        >
          Controla cartera, recuperación, morosidad y cobranza en un solo lugar.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <ActionButton
            label="Clientes"
            onClick={() => (window.location.href = "/clientes")}
            primary
          />
          <ActionButton
            label="Préstamos"
            onClick={() => (window.location.href = "/prestamos")}
          />
          <ActionButton
            label="Pagos"
            onClick={() => (window.location.href = "/pagos")}
          />
          <ActionButton
            label="Cerrar sesión"
            onClick={() => {
              localStorage.removeItem("auth");
              window.location.href = "/login";
            }}
          />
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <KpiCard titulo="Clientes registrados" valor={String(kpis.clientesRegistrados)} />
        <KpiCard titulo="Préstamos activos" valor={String(kpis.prestamosActivos)} />
        <KpiCard titulo="Cartera colocada" valor={`$${kpis.carteraColocada.toFixed(2)}`} />
        <KpiCard titulo="Saldo por cobrar" valor={`$${kpis.saldoPorCobrar.toFixed(2)}`} />
        <KpiCard titulo="Total recuperado" valor={`$${kpis.totalRecuperado.toFixed(2)}`} />
        <KpiCard titulo="Morosos" valor={String(kpis.morosos)} danger={kpis.morosos > 0} />
        <KpiCard titulo="Al corriente" valor={String(kpis.alCorriente)} success={kpis.alCorriente > 0} />
        <KpiCard titulo="Pagos registrados" valor={String(kpis.pagosRegistrados)} />
      </section>

      <section style={{ marginBottom: 14 }}>
        <h2
          style={{
            margin: "0 0 12px 2px",
            fontSize: 18,
            color: "#0f172a",
          }}
        >
          Resumen ejecutivo
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
          }}
        >
          <PanelCard titulo="Cobrado hoy">
            <div style={{ fontSize: 36, fontWeight: 800, color: "#0f172a" }}>
              ${kpis.cobradoHoy.toFixed(2)}
            </div>
            <div style={{ color: "#64748b", marginTop: 6 }}>
              Recuperación registrada en la fecha actual
            </div>
          </PanelCard>

          <PanelCard titulo="Último pago registrado">
            {kpis.ultimoPagoRegistrado ? (
              <>
                <InfoRow label="Monto" value={`$${kpis.ultimoPagoRegistrado.monto}`} />
                <InfoRow label="Fecha" value={kpis.ultimoPagoRegistrado.fecha} />
              </>
            ) : (
              <div style={{ color: "#64748b" }}>No hay pagos registrados.</div>
            )}
          </PanelCard>

          <PanelCard titulo="Top 3 morosos">
            {kpis.topMorosos.length > 0 ? (
              kpis.topMorosos.map((m, i) => (
                <div
                  key={m.id}
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid #e5e7eb",
                    paddingTop: i === 0 ? 0 : 10,
                    marginTop: i === 0 ? 0 : 10,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#111827",
                      marginBottom: 4,
                    }}
                  >
                    {i + 1}. {m.clienteNombre}
                  </div>
                  <div style={{ color: "#475569" }}>Saldo: ${m.saldo}</div>
                  <div style={{ color: "#475569", marginBottom: 8 }}>
                    Días sin pagar: {m.dias}
                  </div>

                  <button
                    onClick={() => abrirWhatsAppMoroso(m.clienteNombre, m.saldo)}
                    style={{
                      background: "#16a34a",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 10,
                      fontWeight: 700,
                    }}
                  >
                    Cobrar por WhatsApp
                  </button>
                </div>
              ))
            ) : (
              <div style={{ color: "#64748b" }}>No hay morosos.</div>
            )}
          </PanelCard>
        </div>
      </section>
    </main>
  );
}

function KpiCard({
  titulo,
  valor,
  success,
  danger,
}: {
  titulo: string;
  valor: string;
  success?: boolean;
  danger?: boolean;
}) {
  const bg = danger ? "#fee2e2" : success ? "#dcfce7" : "#ffffff";
  const border = danger ? "#fecaca" : success ? "#bbf7d0" : "#dbe4f0";
  const color = danger ? "#991b1b" : success ? "#166534" : "#0f172a";

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 22,
        padding: 16,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#64748b",
          marginBottom: 10,
        }}
      >
        {titulo}
      </div>
      <div
        style={{
          fontSize: 34,
          fontWeight: 800,
          color,
          lineHeight: 1.05,
        }}
      >
        {valor}
      </div>
    </div>
  );
}

function PanelCard({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #dbe4f0",
        borderRadius: 22,
        padding: 16,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: "#0f172a",
          marginBottom: 12,
        }}
      >
        {titulo}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 8, color: "#334155" }}>
      <strong>{label}:</strong> {value}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  primary,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: primary ? "#ffffff" : "rgba(255,255,255,0.12)",
        color: primary ? "#0f172a" : "#ffffff",
        border: primary ? "none" : "1px solid rgba(255,255,255,0.18)",
        padding: "12px 16px",
        borderRadius: 14,
        fontWeight: 700,
      }}
    >
      {label}
    </button>
  );
}