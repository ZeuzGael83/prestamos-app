"use client";

import { useEffect, useMemo, useState } from "react";

type Prestamo = {
  id: string;
  clienteId?: string;
  clienteNombre: string;
  saldo?: number;
  total?: number;
};

type Cliente = {
  id: string;
  nombre: string;
  telefono?: string;
  ubicacion?: string;
  direccion?: string;
};

type Pago = {
  prestamoId: string;
  monto: number;
  fecha: string;
};

type RutaItem = {
  prestamoId: string;
  clienteId?: string;
  clienteNombre: string;
  saldo: number;
  dias: number;
  telefono?: string;
  ubicacion?: string;
  direccion?: string;
};

export default function CobradorPage() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [prestamoId, setPrestamoId] = useState("");
  const [monto, setMonto] = useState("");

  useEffect(() => {
    setPrestamos(JSON.parse(localStorage.getItem("prestamos") || "[]"));
    setClientes(JSON.parse(localStorage.getItem("clientes") || "[]"));
    setPagos(JSON.parse(localStorage.getItem("pagos") || "[]"));
  }, []);

  const parseFecha = (f: string) => {
    const [d, m, y] = f.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const ultimoPago = (id: string) => {
    const lista = pagos.filter((p) => p.prestamoId === id);
    if (!lista.length) return null;

    return [...lista].sort(
      (a, b) => parseFecha(b.fecha).getTime() - parseFecha(a.fecha).getTime()
    )[0];
  };

  const diasSinPagar = (id: string) => {
    const u = ultimoPago(id);
    if (!u) return 999;

    const diff = new Date().getTime() - parseFecha(u.fecha).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const clienteInfo = (p: Prestamo) =>
    clientes.find(
      (c) =>
        c.id === p.clienteId ||
        c.nombre.trim().toLowerCase() === p.clienteNombre.trim().toLowerCase()
    );

  const ruta = useMemo(() => {
    const items: RutaItem[] = prestamos
      .filter((p) => (p.saldo ?? 0) > 0)
      .map((p) => {
        const cliente = clienteInfo(p);
        return {
          prestamoId: p.id,
          clienteId: p.clienteId,
          clienteNombre: p.clienteNombre,
          saldo: p.saldo ?? p.total ?? 0,
          dias: diasSinPagar(p.id),
          telefono: cliente?.telefono,
          ubicacion: cliente?.ubicacion,
          direccion: cliente?.direccion,
        };
      })
      .sort((a, b) => {
        const aTieneUbicacion = a.ubicacion ? 1 : 0;
        const bTieneUbicacion = b.ubicacion ? 1 : 0;

        if (b.dias !== a.dias) return b.dias - a.dias;
        if (b.saldo !== a.saldo) return b.saldo - a.saldo;
        return bTieneUbicacion - aTieneUbicacion;
      });

    return items;
  }, [prestamos, clientes, pagos]);

  const normalizarTelefono = (telefono?: string) => {
    const digitos = (telefono || "").replace(/\D/g, "");
    if (!digitos) return "";
    if (digitos.length === 10) return `52${digitos}`;
    if (digitos.startsWith("52") && digitos.length === 12) return digitos;
    return digitos;
  };

  const mensaje = (nombre: string, saldo: number, dias: number) => {
    if (dias > 7) {
      return `⚠️ ${nombre}, tienes un atraso de ${dias} días. Tu saldo pendiente es $${saldo}. Es importante realizar tu pago hoy.`;
    }
    if (dias > 3) {
      return `Hola ${nombre}, tienes ${dias} días de atraso. Tu saldo pendiente es $${saldo}. Te pedimos regularizar tu pago.`;
    }
    return `Hola ${nombre}, tu saldo pendiente es de $${saldo}. Te recordamos realizar tu pago.`;
  };

  const enviarWhatsApp = (item: RutaItem) => {
    const numero = normalizarTelefono(item.telefono);
    if (!numero) {
      alert("Este cliente no tiene teléfono registrado.");
      return;
    }

    window.open(
      `https://wa.me/${numero}?text=${encodeURIComponent(
        mensaje(item.clienteNombre, item.saldo, item.dias)
      )}`,
      "_blank"
    );
  };

  const abrirMaps = (item: RutaItem) => {
    if (!item.ubicacion) {
      alert("Este cliente no tiene ubicación registrada.");
      return;
    }

    if (item.ubicacion.startsWith("http")) {
      window.open(item.ubicacion, "_blank");
      return;
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        item.ubicacion
      )}`,
      "_blank"
    );
  };

  const registrarPago = () => {
    const montoNum = Number(monto);
    if (!prestamoId || !montoNum || montoNum <= 0) {
      alert("Selecciona un préstamo e ingresa un monto válido.");
      return;
    }

    const prestamo = prestamos.find((p) => p.id === prestamoId);
    if (!prestamo) return;

    const saldoActual = prestamo.saldo ?? prestamo.total ?? 0;
    if (montoNum > saldoActual) {
      alert("El pago no puede ser mayor al saldo.");
      return;
    }

    const nuevoSaldo = saldoActual - montoNum;

    const nuevoPago: Pago = {
      prestamoId,
      monto: montoNum,
      fecha: new Date().toLocaleDateString(),
    };

    const nuevosPagos = [nuevoPago, ...pagos];
    const nuevosPrestamos = prestamos.map((p) =>
      p.id === prestamoId
        ? { ...p, saldo: nuevoSaldo < 0 ? 0 : nuevoSaldo }
        : p
    );

    localStorage.setItem("pagos", JSON.stringify(nuevosPagos));
    localStorage.setItem("prestamos", JSON.stringify(nuevosPrestamos));

    setPagos(nuevosPagos);
    setPrestamos(nuevosPrestamos);
    setMonto("");
    setPrestamoId("");

    alert("Pago registrado correctamente.");
  };

  const colorEstado = (dias: number) => {
    if (dias > 7) return "#fecaca";
    if (dias > 3) return "#fde68a";
    return "#dcfce7";
  };

  const textoEstado = (dias: number) => {
    if (dias > 7) return "Crítico";
    if (dias > 3) return "Atención";
    return "Normal";
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
          background: "linear-gradient(135deg, #7f1d1d, #dc2626)",
          color: "white",
          borderRadius: 24,
          padding: 20,
          marginBottom: 16,
          boxShadow: "0 10px 30px rgba(127, 29, 29, 0.28)",
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
          Operación de campo
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 800,
            lineHeight: 1.05,
          }}
        >
          Ruta
          <br />
          inteligente
        </h1>

        <p
          style={{
            marginTop: 14,
            marginBottom: 0,
            color: "rgba(255,255,255,0.88)",
            fontSize: 17,
            lineHeight: 1.5,
          }}
        >
          Prioriza clientes por atraso, saldo y ubicación para cobrar más rápido.
        </p>
      </section>

      <section
        style={{
          background: "white",
          padding: 16,
          borderRadius: 22,
          marginBottom: 16,
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          border: "1px solid #dbe4f0",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#0f172a" }}>Pago rápido</h2>

        <select
          value={prestamoId}
          onChange={(e) => setPrestamoId(e.target.value)}
          style={inputStyle}
        >
          <option value="">Selecciona cliente</option>
          {ruta.map((p) => (
            <option key={p.prestamoId} value={p.prestamoId}>
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

        <button onClick={registrarPago} style={botonPrincipal}>
          Registrar pago
        </button>
      </section>

      <section>
        <h2 style={{ color: "#0f172a", margin: "0 0 12px 2px" }}>
          Ruta de cobranza
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          {ruta.length === 0 ? (
            <div style={emptyCard}>No hay clientes pendientes de cobro.</div>
          ) : (
            ruta.map((item, index) => (
              <div
                key={item.prestamoId}
                style={{
                  background: colorEstado(item.dias),
                  padding: 16,
                  borderRadius: 18,
                  border: "1px solid rgba(15,23,42,0.08)",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        opacity: 0.75,
                        marginBottom: 4,
                      }}
                    >
                      Parada #{index + 1}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {item.clienteNombre}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(255,255,255,0.75)",
                      padding: "8px 10px",
                      borderRadius: 12,
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    {textoEstado(item.dias)}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 6, color: "#334155" }}>
                  <div><strong>Saldo:</strong> ${item.saldo}</div>
                  <div><strong>Días sin pagar:</strong> {item.dias}</div>
                  <div><strong>Dirección:</strong> {item.direccion || "No registrada"}</div>
                  <div><strong>Ubicación:</strong> {item.ubicacion || "No registrada"}</div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <button onClick={() => enviarWhatsApp(item)} style={botonWhatsapp}>
                    WhatsApp
                  </button>

                  <button onClick={() => abrirMaps(item)} style={botonMaps}>
                    Maps
                  </button>

                  <button
                    onClick={() => {
                      setPrestamoId(item.prestamoId);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={botonCobrar}
                  >
                    Cobrar
                  </button>
                </div>
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
  padding: 12,
  marginBottom: 10,
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  fontSize: 16,
};

const botonPrincipal: React.CSSProperties = {
  background: "#16a34a",
  color: "white",
  padding: 12,
  width: "100%",
  borderRadius: 12,
  fontWeight: 700,
  border: "none",
};

const botonWhatsapp: React.CSSProperties = {
  background: "#16a34a",
  color: "white",
  padding: "10px 12px",
  borderRadius: 10,
  border: "none",
  fontWeight: 700,
};

const botonMaps: React.CSSProperties = {
  background: "#1d4ed8",
  color: "white",
  padding: "10px 12px",
  borderRadius: 10,
  border: "none",
  fontWeight: 700,
};

const botonCobrar: React.CSSProperties = {
  background: "#0f172a",
  color: "white",
  padding: "10px 12px",
  borderRadius: 10,
  border: "none",
  fontWeight: 700,
};

const emptyCard: React.CSSProperties = {
  background: "white",
  padding: 16,
  borderRadius: 18,
  color: "#64748b",
  border: "1px solid #dbe4f0",
};