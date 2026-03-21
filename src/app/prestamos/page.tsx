"use client";

import { useEffect, useState } from "react";

type Cliente = {
  id: string;
  nombre: string;
};

type Prestamo = {
  id: string;
  clienteId: string;
  clienteNombre: string;
  tipo: "gota" | "cuotas";
  capital: number;
  total: number;
  saldo: number;
  utilidad?: number;
  dias?: number;
  interes?: number;
  numeroPagos?: number;
};

export default function PrestamosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [tipo, setTipo] = useState<"gota" | "cuotas">("gota");
  const [capital, setCapital] = useState("");
  const [utilidad, setUtilidad] = useState("");
  const [dias, setDias] = useState("");
  const [interes, setInteres] = useState("");
  const [numeroPagos, setNumeroPagos] = useState("");

  useEffect(() => {
    try {
      const auth = localStorage.getItem("auth");
      if (auth !== "true") {
        window.location.href = "/login";
        return;
      }

      const clientesGuardados = localStorage.getItem("clientes");
      if (clientesGuardados) {
        const listaClientes = JSON.parse(clientesGuardados);
        if (Array.isArray(listaClientes)) setClientes(listaClientes);
      }

      const prestamosGuardados = localStorage.getItem("prestamos");
      if (prestamosGuardados) {
        const listaPrestamos = JSON.parse(prestamosGuardados);
        if (Array.isArray(listaPrestamos)) setPrestamos(listaPrestamos);
      }
    } catch (error) {
      console.log("Error cargando datos", error);
      setPrestamos([]);
    }
  }, []);

  const guardarPrestamos = (lista: Prestamo[]) => {
    setPrestamos(lista);
    localStorage.setItem("prestamos", JSON.stringify(lista));
  };

  const limpiar = () => {
    setClienteId("");
    setTipo("gota");
    setCapital("");
    setUtilidad("");
    setDias("");
    setInteres("");
    setNumeroPagos("");
  };

  const guardar = () => {
    if (!clienteId) {
      alert("Selecciona un cliente");
      return;
    }

    const capitalNum = Number(capital);
    if (!capitalNum || capitalNum <= 0) {
      alert("Ingresa un capital válido");
      return;
    }

    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) {
      alert("Cliente no encontrado");
      return;
    }

    if (tipo === "gota") {
      const utilidadNum = Number(utilidad);
      const diasNum = Number(dias);

      if (!utilidadNum || !diasNum) {
        alert("Completa utilidad y días");
        return;
      }

      const total = capitalNum + utilidadNum;

      const nuevo: Prestamo = {
        id: Date.now().toString(),
        clienteId,
        clienteNombre: cliente.nombre,
        tipo: "gota",
        capital: capitalNum,
        utilidad: utilidadNum,
        dias: diasNum,
        total,
        saldo: total,
      };

      guardarPrestamos([nuevo, ...prestamos]);
      limpiar();
      return;
    }

    const interesNum = Number(interes);
    const pagosNum = Number(numeroPagos);

    if (!interesNum || !pagosNum) {
      alert("Completa interés y número de pagos");
      return;
    }

    const total = capitalNum + capitalNum * (interesNum / 100);

    const nuevo: Prestamo = {
      id: Date.now().toString(),
      clienteId,
      clienteNombre: cliente.nombre,
      tipo: "cuotas",
      capital: capitalNum,
      interes: interesNum,
      numeroPagos: pagosNum,
      total,
      saldo: total,
    };

    guardarPrestamos([nuevo, ...prestamos]);
    limpiar();
  };

  const eliminar = (id: string) => {
    guardarPrestamos(prestamos.filter((p) => p.id !== id));
  };

  const totalEstimado =
    tipo === "gota"
      ? Number(capital || 0) + Number(utilidad || 0)
      : Number(capital || 0) +
        Number(capital || 0) * (Number(interes || 0) / 100);

  const pagoEstimado =
    tipo === "gota"
      ? Number(dias || 0) > 0
        ? totalEstimado / Number(dias || 0)
        : 0
      : Number(numeroPagos || 0) > 0
      ? totalEstimado / Number(numeroPagos || 0)
      : 0;

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
          Registro y control de préstamos
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
          de préstamos
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
          Crea préstamos gota a gota o por cuotas con cálculo automático y control de saldo.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <HeaderButton label="Dashboard" onClick={() => (window.location.href = "/dashboard")} primary />
          <HeaderButton label="Clientes" onClick={() => (window.location.href = "/clientes")} />
          <HeaderButton label="Pagos" onClick={() => (window.location.href = "/pagos")} />
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
          Nuevo préstamo
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Selecciona un cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "gota" | "cuotas")}
            style={inputStyle}
          >
            <option value="gota">Gota a gota</option>
            <option value="cuotas">Cuotas + interés</option>
          </select>

          <input
            placeholder="Capital"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            style={inputStyle}
          />

          {tipo === "gota" ? (
            <>
              <input
                placeholder="Utilidad"
                value={utilidad}
                onChange={(e) => setUtilidad(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Días"
                value={dias}
                onChange={(e) => setDias(e.target.value)}
                style={inputStyle}
              />
            </>
          ) : (
            <>
              <input
                placeholder="Interés %"
                value={interes}
                onChange={(e) => setInteres(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Número de pagos"
                value={numeroPagos}
                onChange={(e) => setNumeroPagos(e.target.value)}
                style={inputStyle}
              />
            </>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            <MetricBox label="Total estimado" value={`$${totalEstimado.toFixed(2)}`} />
            <MetricBox
              label={tipo === "gota" ? "Pago por día" : "Pago por cuota"}
              value={`$${pagoEstimado.toFixed(2)}`}
            />
          </div>

          <button
            onClick={guardar}
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
            Guardar préstamo
          </button>
        </div>
      </section>

      <section>
        <h2
          style={{
            margin: "0 0 12px 2px",
            fontSize: 18,
            color: "#0f172a",
          }}
        >
          Listado de préstamos
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          {prestamos.length === 0 ? (
            <EmptyCard texto="No hay préstamos registrados." />
          ) : (
            prestamos.map((p) => (
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

                <div style={{ marginBottom: 12 }}>
                  <span
                    style={{
                      background: p.tipo === "gota" ? "#dbeafe" : "#dcfce7",
                      color: p.tipo === "gota" ? "#1d4ed8" : "#166534",
                      border: `1px solid ${p.tipo === "gota" ? "#bfdbfe" : "#bbf7d0"}`,
                      padding: "8px 12px",
                      borderRadius: 999,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {p.tipo === "gota" ? "Gota a gota" : "Cuotas + interés"}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <MetricBox label="Capital" value={`$${p.capital}`} />
                  <MetricBox label="Total" value={`$${p.total}`} />
                  <MetricBox label="Saldo" value={`$${p.saldo}`} />
                  <MetricBox
                    label={p.tipo === "gota" ? "Detalle" : "Condición"}
                    value={
                      p.tipo === "gota"
                        ? `${p.dias || 0} días`
                        : `${p.numeroPagos || 0} pagos`
                    }
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    marginBottom: 14,
                    color: "#475569",
                  }}
                >
                  {p.tipo === "gota" ? (
                    <>
                      <DataRow label="Utilidad" value={`$${p.utilidad || 0}`} />
                      <DataRow
                        label="Pago por día"
                        value={`$${((p.total || 0) / (p.dias || 1)).toFixed(2)}`}
                      />
                    </>
                  ) : (
                    <>
                      <DataRow label="Interés" value={`${p.interes || 0}%`} />
                      <DataRow
                        label="Pago por cuota"
                        value={`$${((p.total || 0) / (p.numeroPagos || 1)).toFixed(2)}`}
                      />
                    </>
                  )}
                </div>

                <button
                  onClick={() => eliminar(p.id)}
                  style={{
                    background: "#fee2e2",
                    color: "#991b1b",
                    border: "1px solid #fecaca",
                    padding: "12px 14px",
                    borderRadius: 12,
                    fontWeight: 700,
                    width: "100%",
                  }}
                >
                  Eliminar préstamo
                </button>
              </div>
            ))
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
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong style={{ color: "#0f172a" }}>{label}:</strong> {value}
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