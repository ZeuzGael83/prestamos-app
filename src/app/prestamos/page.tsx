"use client";

import { useEffect, useState } from "react";

type Cliente = {
  id: string;
  nombre: string;
  telefono?: string;
  direccion?: string;
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

export default function Page() {
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
    const auth = localStorage.getItem("auth");
    if (auth !== "true") {
      window.location.href = "/login";
      return;
    }

    const clientesGuardados = localStorage.getItem("clientes");
    if (clientesGuardados) {
      setClientes(JSON.parse(clientesGuardados));
    }

    const prestamosGuardados = localStorage.getItem("prestamos");
    if (prestamosGuardados) {
      setPrestamos(JSON.parse(prestamosGuardados));
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

    if (!capital || Number(capital) <= 0) {
      alert("Ingresa un capital válido");
      return;
    }

    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) {
      alert("Cliente no encontrado");
      return;
    }

    if (tipo === "gota") {
      if (!utilidad || Number(utilidad) < 0) {
        alert("Ingresa una utilidad válida");
        return;
      }

      if (!dias || Number(dias) <= 0) {
        alert("Ingresa días válidos");
        return;
      }

      const total = Number(capital) + Number(utilidad);

      const nuevo: Prestamo = {
        id: Date.now().toString(),
        clienteId,
        clienteNombre: cliente.nombre,
        tipo: "gota",
        capital: Number(capital),
        utilidad: Number(utilidad),
        dias: Number(dias),
        total,
        saldo: total,
      };

      const lista = [nuevo, ...prestamos];
      guardarPrestamos(lista);
      limpiar();
      return;
    }

    if (!interes || Number(interes) < 0) {
      alert("Ingresa un interés válido");
      return;
    }

    if (!numeroPagos || Number(numeroPagos) <= 0) {
      alert("Ingresa número de pagos válido");
      return;
    }

    const total = Number(capital) + Number(capital) * (Number(interes) / 100);

    const nuevo: Prestamo = {
      id: Date.now().toString(),
      clienteId,
      clienteNombre: cliente.nombre,
      tipo: "cuotas",
      capital: Number(capital),
      interes: Number(interes),
      numeroPagos: Number(numeroPagos),
      total,
      saldo: total,
    };

    const lista = [nuevo, ...prestamos];
    guardarPrestamos(lista);
    limpiar();
  };

  const eliminar = (id: string) => {
    const lista = prestamos.filter((p) => p.id !== id);
    guardarPrestamos(lista);
  };

  return (
    <main style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Préstamos híbrido</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <button onClick={() => (window.location.href = "/dashboard")}>
          ← Volver al dashboard
        </button>
        <button onClick={() => (window.location.href = "/pagos")}>
          Ver pagos
        </button>
      </div>

      <section style={{ display: "grid", gap: 10, maxWidth: 500 }}>
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Selecciona un cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <select value={tipo} onChange={(e) => setTipo(e.target.value as "gota" | "cuotas")}>
          <option value="gota">Gota a gota</option>
          <option value="cuotas">Cuotas + interés</option>
        </select>

        <input
          type="number"
          placeholder="Capital"
          value={capital}
          onChange={(e) => setCapital(e.target.value)}
        />

        {tipo === "gota" ? (
          <>
            <input
              type="number"
              placeholder="Utilidad"
              value={utilidad}
              onChange={(e) => setUtilidad(e.target.value)}
            />
            <input
              type="number"
              placeholder="Días"
              value={dias}
              onChange={(e) => setDias(e.target.value)}
            />
          </>
        ) : (
          <>
            <input
              type="number"
              placeholder="Interés %"
              value={interes}
              onChange={(e) => setInteres(e.target.value)}
            />
            <input
              type="number"
              placeholder="Número de pagos"
              value={numeroPagos}
              onChange={(e) => setNumeroPagos(e.target.value)}
            />
          </>
        )}

        <button onClick={guardar}>Guardar préstamo</button>
      </section>

      <hr style={{ margin: "24px 0" }} />

      <h2>Listado de préstamos</h2>

      {prestamos.length === 0 ? (
        <p>No hay préstamos registrados.</p>
      ) : (
        prestamos.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ccc",
              padding: 12,
              marginBottom: 12,
              maxWidth: 520,
            }}
          >
            <div><strong>{p.clienteNombre}</strong></div>
            <div>Tipo: {p.tipo === "gota" ? "Gota a gota" : "Cuotas + interés"}</div>
            <div>Capital: ${p.capital.toFixed(2)}</div>
            <div>Total: ${p.total.toFixed(2)}</div>
            <div>Saldo: ${p.saldo.toFixed(2)}</div>

            {p.tipo === "gota" ? (
              <>
                <div>Utilidad: ${Number(p.utilidad || 0).toFixed(2)}</div>
                <div>Días: {p.dias}</div>
              </>
            ) : (
              <>
                <div>Interés: {p.interes}%</div>
                <div>Número de pagos: {p.numeroPagos}</div>
              </>
            )}

            <button onClick={() => eliminar(p.id)} style={{ marginTop: 10 }}>
              Eliminar
            </button>
          </div>
        ))
      )}
    </main>
  );
}