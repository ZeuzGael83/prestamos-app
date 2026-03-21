"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

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
  clienteId?: string;
  clienteNombre?: string;
  monto: number;
  fecha: string;
  folio?: string;
  saldoRestante?: number;
};

type ResultadoIA = {
  score: number;
  nivel: string;
  color: string;
  recomendacion: string;
  montoFactor: number;
  factores: string[];
};

export default function ClienteDetalle() {
  const router = useRouter();
  const params = useParams();

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [resultadoIA, setResultadoIA] = useState<ResultadoIA | null>(null);

  useEffect(() => {
    const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
    const clienteEncontrado = clientes.find((c: Cliente) => c.id === params.id);

    if (!clienteEncontrado) {
      router.push("/clientes");
      return;
    }

    setCliente(clienteEncontrado);

    const prestamosGuardados = JSON.parse(localStorage.getItem("prestamos") || "[]");
    const pagosGuardados = JSON.parse(localStorage.getItem("pagos") || "[]");

    const prestamosCliente = prestamosGuardados.filter(
      (p: Prestamo) =>
        p.clienteId === clienteEncontrado.id ||
        p.clienteNombre?.trim().toLowerCase() ===
          clienteEncontrado.nombre.trim().toLowerCase()
    );

    const pagosCliente = pagosGuardados.filter(
      (p: Pago) =>
        p.clienteId === clienteEncontrado.id ||
        p.clienteNombre?.trim().toLowerCase() ===
          clienteEncontrado.nombre.trim().toLowerCase()
    );

    setPrestamos(prestamosCliente);
    setPagos(pagosCliente);
  }, [params.id, router]);

  const guardarDocumento = (tipo: string, file: File) => {
    if (!cliente) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result;
      const expedientes = JSON.parse(localStorage.getItem("expedientes") || "{}");

      if (!expedientes[cliente.id]) {
        expedientes[cliente.id] = {};
      }

      expedientes[cliente.id][tipo] = base64;
      localStorage.setItem("expedientes", JSON.stringify(expedientes));

      alert("Documento guardado");
      window.location.reload();
    };

    reader.readAsDataURL(file);
  };

  const obtenerDocumento = (tipo: string) => {
    if (!cliente) return null;
    const expedientes = JSON.parse(localStorage.getItem("expedientes") || "{}");
    return expedientes[cliente.id]?.[tipo] || null;
  };

  const enviarWhatsApp = () => {
    if (!cliente?.telefono) return;

    const numero = "52" + cliente.telefono.replace(/\D/g, "");
    const mensaje = `Hola ${cliente.nombre}, tienes un saldo pendiente de $${totalPendiente}. Por favor realiza tu pago hoy.`;

    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const abrirMaps = () => {
    if (!cliente?.ubicacion) return;

    if (cliente.ubicacion.startsWith("http")) {
      window.open(cliente.ubicacion, "_blank");
      return;
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cliente.ubicacion)}`,
      "_blank"
    );
  };

  const parseFecha = (fecha: string) => {
    const [d, m, y] = fecha.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const diasSinPagar = (prestamoId: string) => {
    const pagosPrestamo = pagos.filter((p) => p.prestamoId === prestamoId);
    if (!pagosPrestamo.length) return 999;

    const ultimo = [...pagosPrestamo].sort(
      (a, b) => parseFecha(b.fecha).getTime() - parseFecha(a.fecha).getTime()
    )[0];

    const diff = new Date().getTime() - parseFecha(ultimo.fecha).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const evaluarClienteIA = () => {
    if (!cliente) return;

    let score = 100;
    const factores: string[] = [];

    const diasArray = prestamos.map((p) => diasSinPagar(p.id) || 0);
    const maxDias = Math.max(...diasArray, 0);

    const totalPagos = pagos.length;
    const totalPrestamosCliente = prestamos.length;
    const saldoPendiente = prestamos.reduce((acc, p) => {
      const saldo = p.saldo ?? p.saldoPendiente ?? p.total ?? p.totalPagar ?? 0;
      return acc + saldo;
    }, 0);

    const expedienteCompleto =
      !!obtenerDocumento("ineFrente") &&
      !!obtenerDocumento("ineReverso") &&
      !!obtenerDocumento("domicilio");

    if (maxDias > 7) {
      score -= 30;
      factores.push("Atraso mayor a 7 días");
    } else if (maxDias > 3) {
      score -= 15;
      factores.push("Atraso reciente");
    }

    if (totalPagos === 0) {
      score -= 20;
      factores.push("Sin historial de pagos");
    }

    if (saldoPendiente > 0) {
      score -= 10;
      factores.push("Saldo pendiente activo");
    }

    if (!expedienteCompleto) {
      score -= 15;
      factores.push("Expediente incompleto");
    }

    if (totalPagos > 5) {
      score += 10;
      factores.push("Buen historial de pagos");
    }

    if (totalPrestamosCliente > 1) {
      score += 10;
      factores.push("Cliente recurrente");
    }

    score = Math.max(0, Math.min(100, score));

    let nivel = "";
    let color = "";
    let recomendacion = "";
    let monto = 0;

    if (score >= 75) {
      nivel = "🟢 Cliente seguro";
      color = "#dcfce7";
      recomendacion = "Aprobado para nuevo préstamo";
      monto = 1;
    } else if (score >= 50) {
      nivel = "🟡 Cliente con área de oportunidad";
      color = "#fef9c3";
      recomendacion = "Aprobar con monto moderado y seguimiento";
      monto = 0.6;
    } else {
      nivel = "🔴 Cliente moroso / de riesgo";
      color = "#fee2e2";
      recomendacion = "No recomendable otorgar préstamo por ahora";
      monto = 0;
    }

    setResultadoIA({
      score,
      nivel,
      color,
      recomendacion,
      montoFactor: monto,
      factores,
    });
  };

  if (!cliente) return <div style={{ padding: 20 }}>Cargando...</div>;

  const totalPrestamos = prestamos.reduce((acc, p) => {
    const total = p.total ?? p.totalPagar ?? 0;
    return acc + total;
  }, 0);

  const totalPagado = pagos.reduce((acc, p) => acc + (p.monto || 0), 0);
  const totalPendiente = totalPrestamos - totalPagado;

  const documentosCompletos =
    !!obtenerDocumento("ineFrente") &&
    !!obtenerDocumento("ineReverso") &&
    !!obtenerDocumento("domicilio");

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
          Perfil y expediente del cliente
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 38,
            lineHeight: 1.05,
            fontWeight: 800,
          }}
        >
          Ficha
          <br />
          del cliente
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
          Consulta datos, expediente digital, ubicación, préstamos, pagos y evaluación inteligente.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <HeaderButton label="Volver a clientes" onClick={() => router.push("/clientes")} primary />
          <HeaderButton label="WhatsApp" onClick={enviarWhatsApp} />
          <HeaderButton label="Abrir en Maps" onClick={abrirMaps} />
          <HeaderButton label="🤖 Evaluación IA" onClick={evaluarClienteIA} />
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            {cliente.nombre}
          </div>

          <div
            style={{
              background: documentosCompletos ? "#dcfce7" : "#fef3c7",
              color: documentosCompletos ? "#166534" : "#92400e",
              border: `1px solid ${documentosCompletos ? "#bbf7d0" : "#fde68a"}`,
              padding: "8px 12px",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {documentosCompletos ? "✅ Expediente completo" : "⏳ Expediente incompleto"}
          </div>
        </div>

        <div style={{ display: "grid", gap: 8, color: "#475569", marginBottom: 14 }}>
          <DataRow label="Teléfono" value={cliente.telefono} />
          <DataRow label="Dirección" value={cliente.direccion} />
          <DataRow label="Ubicación" value={cliente.ubicacion || "No registrada"} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 10,
          }}
        >
          <MetricBox label="Préstamos" value={String(prestamos.length)} />
          <MetricBox label="Pagado" value={`$${totalPagado}`} />
          <MetricBox label="Pendiente" value={`$${totalPendiente}`} />
        </div>
      </section>

      {resultadoIA && (
        <section
          style={{
            background: resultadoIA.color,
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 22,
            padding: 16,
            marginBottom: 16,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 12,
              color: "#0f172a",
            }}
          >
            🤖 Evaluación IA
          </div>

          <div style={{ display: "grid", gap: 8, color: "#334155", marginBottom: 10 }}>
            <div><strong>Score:</strong> {resultadoIA.score}/100</div>
            <div><strong>Estado:</strong> {resultadoIA.nivel}</div>
            <div><strong>Recomendación:</strong> {resultadoIA.recomendacion}</div>
            <div>
              <strong>Monto sugerido:</strong>{" "}
              {resultadoIA.montoFactor === 0
                ? "No recomendable"
                : `${Math.round(resultadoIA.montoFactor * 100)}% del monto habitual`}
            </div>
          </div>

          <div>
            <strong style={{ color: "#0f172a" }}>Factores:</strong>
            <ul style={{ marginTop: 8, paddingLeft: 18, color: "#334155" }}>
              {resultadoIA.factores.map((f, i) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

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
          Expediente digital
        </h2>

        <div style={{ display: "grid", gap: 16 }}>
          <DocBlock
            titulo="INE Frente"
            imagen={obtenerDocumento("ineFrente")}
            onChange={(file) => guardarDocumento("ineFrente", file)}
          />

          <DocBlock
            titulo="INE Reverso"
            imagen={obtenerDocumento("ineReverso")}
            onChange={(file) => guardarDocumento("ineReverso", file)}
          />

          <DocBlock
            titulo="Comprobante de domicilio"
            imagen={obtenerDocumento("domicilio")}
            onChange={(file) => guardarDocumento("domicilio", file)}
          />
        </div>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h2
          style={{
            margin: "0 0 12px 2px",
            fontSize: 18,
            color: "#0f172a",
          }}
        >
          Préstamos del cliente
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          {prestamos.length === 0 ? (
            <EmptyCard texto="No hay préstamos asociados." />
          ) : (
            prestamos.map((p, i) => {
              const total = p.total ?? p.totalPagar ?? 0;
              const saldo = p.saldo ?? p.saldoPendiente ?? total;

              return (
                <div
                  key={i}
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
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 10,
                    }}
                  >
                    <MetricBox label="Total" value={`$${total}`} />
                    <MetricBox label="Saldo" value={`$${saldo}`} />
                  </div>
                </div>
              );
            })
          )}
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
          Historial de pagos
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          {pagos.length === 0 ? (
            <EmptyCard texto="No hay pagos registrados." />
          ) : (
            pagos.map((p, i) => (
              <div
                key={i}
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
                    display: "grid",
                    gap: 8,
                    color: "#475569",
                  }}
                >
                  <DataRow label="Monto" value={`$${p.monto}`} />
                  <DataRow label="Fecha" value={p.fecha} />
                  <DataRow label="Folio" value={p.folio || "Sin folio"} />
                  <DataRow
                    label="Saldo restante"
                    value={
                      typeof p.saldoRestante === "number"
                        ? `$${p.saldoRestante}`
                        : "No disponible"
                    }
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

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

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong style={{ color: "#0f172a" }}>{label}:</strong> {value}
    </div>
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

function DocBlock({
  titulo,
  imagen,
  onChange,
}: {
  titulo: string;
  imagen: string | null;
  onChange: (file: File) => void;
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: 10,
        }}
      >
        {titulo}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onChange(e.target.files[0]);
          }
        }}
      />

      {imagen ? (
        <img
          src={imagen}
          alt={titulo}
          style={{
            width: "100%",
            maxWidth: 240,
            marginTop: 12,
            borderRadius: 12,
            border: "1px solid #dbe4f0",
          }}
        />
      ) : (
        <div style={{ marginTop: 10, color: "#64748b" }}>No cargado</div>
      )}
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