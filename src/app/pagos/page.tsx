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
    if (digitos.startsWith("52") && digitos.length === 12) return digitos;
    if (digitos.length === 10) return `52${digitos}`;
    return digitos;
  };

  const generarFolio = () => {
    const ahora = new Date();
    return `PG-${ahora.getTime()}`;
  };

  const abrirWhatsappConTicket = (
    prestamo: Prestamo,
    montoPagado: number,
    saldoRestante: number,
    folio: string
  ) => {
    const telefono = normalizarTelefonoWhatsapp(
      obtenerTelefonoCliente(prestamo)
    );

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

    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const abrirWhatsappSaldo = (prestamo: Prestamo, saldo: number) => {
    const telefono = normalizarTelefonoWhatsapp(
      obtenerTelefonoCliente(prestamo)
    );

    if (!telefono) {
      alert("Cliente sin teléfono válido.");
      return;
    }

    const mensaje = `Hola ${prestamo.clienteNombre}, tu saldo pendiente actual es de $${saldo}. Por favor realiza tu pago.`;

    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, "_blank");
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
      prestamoId,
      clienteId: prestamoSeleccionado.clienteId,
      clienteNombre: prestamoSeleccionado.clienteNombre,
      monto: montoNum,
      fecha,
      folio,
      saldoRestante: nuevoSaldo,
    };

    const nuevosPagos = [nuevoPago, ...pagosGuardados];

    localStorage.setItem("pagos", JSON.stringify(nuevosPagos));
    localStorage.setItem("prestamos", JSON.stringify(nuevosPrestamos));

    setPagos(nuevosPagos);
    setPrestamos(nuevosPrestamos);
    setMonto("");
    setPrestamoId("");

    abrirWhatsappConTicket(prestamoSeleccionado, montoNum, nuevoSaldo, folio);
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
    const saldo = p.saldo ?? p.saldoPendiente ?? p.total ?? p.totalPagar ?? 0;
    const estado = estadoPrestamo(p, saldo);

    if (filtro === "morosos") return estado === "moroso";
    if (filtro === "corriente") return estado === "corriente";
    return true;
  });

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
          Control y seguimiento de cobranza
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 38,
            lineHeight: 1.05,
            fontWeight: 800,
          }}
        >
          Gestión
          <br />
          de pagos
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
          Registra pagos, genera tickets y da seguimiento visual al estado de cada cliente.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <HeaderButton label="Dashboard" onClick={() => (window.location.href = "/dashboard")} primary />
          <HeaderButton label="Clientes" onClick={() => (window.location.href = "/clientes")} />
          <HeaderButton label="Préstamos" onClick={() => (window.location.href = "/prestamos")} />
        </div>
      </section>

      <section
        style={{
          background: "white",
          border: "1px solid #dbe4f0",
          borderRadius: 22,
          padding: 16,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            margin: "0 0 14px 0",
            fontSize: 22,
            color: "#0f172a",
          }}
        >
          Registrar pago
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          <select
            value={prestamoId}
            onChange={(e) => setPrestamoId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Selecciona préstamo</option>
            {prestamos.map((p) => {
              const saldo = p.saldo ?? p.saldoPendiente ?? p.total ?? p.totalPagar ?? 0;
              return (
                <option key={p.id} value={p.id}>
                  {p.clienteNombre} - ${saldo.toFixed(2)}
                </option>
              );
            })}
          </select>

          <input
            placeholder="Monto del pago"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            style={inputStyle}
          />

          <button
            onClick={guardarPago}
            style={{
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "14px 16px",
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Guardar pago y enviar ticket
          </button>
        </div>
      </section>

      <section
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <FilterButton active={filtro === "todos"} onClick={() => setFiltro("todos")}>
          Todos
        </FilterButton>
        <FilterButton active={filtro === "morosos"} onClick={() => setFiltro("morosos")}>
          Morosos
        </FilterButton>
        <FilterButton active={filtro === "corriente"} onClick={() => setFiltro("corriente")}>
          Al corriente
        </FilterButton>
      </section>

      <section>
        <h2
          style={{
            margin: "0 0 12px 2px",
            fontSize: 18,
            color: "#0f172a",
          }}
        >
          Estado de préstamos
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          {prestamosFiltrados.length === 0 ? (
            <EmptyCard texto="No hay préstamos para este filtro." />
          ) : (
            prestamosFiltrados.map((p) => {
              const total = p.total ?? p.totalPagar ?? 0;
              const saldo = p.saldo ?? p.saldoPendiente ?? total;
              const estado = estadoPrestamo(p, saldo);
              const dias = diasSinPagar(p.id);
              const ultimoPago = obtenerUltimoPago(p.id);

              return (
                <div
                  key={p.id}
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
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#0f172a",
                      marginBottom: 10,
                    }}
                  >
                    {p.clienteNombre}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <MetricBox label="Total" value={`$${total}`} />
                    <MetricBox label="Saldo" value={`$${saldo}`} />
                  </div>

                  <StatusBadge estado={estado} dias={dias} />

                  <div
                    style={{
                      marginTop: 12,
                      color: "#475569",
                      fontSize: 14,
                    }}
                  >
                    Último pago:{" "}
                    {ultimoPago
                      ? `${ultimoPago.fecha} - $${ultimoPago.monto}`
                      : "Sin pagos registrados"}
                  </div>

                  <button
                    onClick={() => abrirWhatsappSaldo(p, saldo)}
                    style={{
                      marginTop: 14,
                      background: "#16a34a",
                      color: "white",
                      border: "none",
                      padding: "12px 14px",
                      borderRadius: 12,
                      fontWeight: 700,
                      width: "100%",
                    }}
                  >
                    Cobrar por WhatsApp
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 14px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  fontSize: 16,
  outline: "none",
  background: "#f8fafc",
  color: "#0f172a",
};

function HeaderButton({
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

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "#1d4ed8" : "white",
        color: active ? "white" : "#0f172a",
        border: active ? "none" : "1px solid #dbe4f0",
        padding: "10px 14px",
        borderRadius: 999,
        fontWeight: 700,
        boxShadow: active ? "0 8px 20px rgba(29, 78, 216, 0.25)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 12,
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#64748b",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatusBadge({
  estado,
  dias,
}: {
  estado: string;
  dias: number | null;
}) {
  if (estado === "moroso") {
    return (
      <div
        style={{
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fecaca",
          padding: "10px 12px",
          borderRadius: 12,
          fontWeight: 700,
        }}
      >
        ⚠️ MOROSO {dias !== null ? `(${dias} días sin pagar)` : ""}
      </div>
    );
  }

  if (estado === "corriente") {
    return (
      <div
        style={{
          background: "#dcfce7",
          color: "#166534",
          border: "1px solid #bbf7d0",
          padding: "10px 12px",
          borderRadius: 12,
          fontWeight: 700,
        }}
      >
        ✅ Al corriente {dias !== null ? `(${dias} días desde último pago)` : ""}
      </div>
    );
  }

  if (estado === "liquidado") {
    return (
      <div
        style={{
          background: "#e0f2fe",
          color: "#075985",
          border: "1px solid #bae6fd",
          padding: "10px 12px",
          borderRadius: 12,
          fontWeight: 700,
        }}
      >
        💧 Liquidado
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fde68a",
        padding: "10px 12px",
        borderRadius: 12,
        fontWeight: 700,
      }}
    >
      ⏳ Sin pagos registrados
    </div>
  );
}

function EmptyCard({ texto }: { texto: string }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #dbe4f0",
        borderRadius: 22,
        padding: 18,
        color: "#64748b",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
      }}
    >
      {texto}
    </div>
  );
}