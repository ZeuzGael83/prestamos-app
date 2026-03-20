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
    try {
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
        const lista = JSON.parse(prestamosGuardados);
        if (Array.isArray(lista)) {
          setPrestamos(lista);
        }
      }
    } catch (error) {
      console.log("Error cargando datos de préstamos", error);
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

      if (utilidadNum < 0 || !diasNum || diasNum <= 0) {
        alert("Ingresa utilidad y días válidos");
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

    if (interesNum < 0 || !pagosNum || pagosNum <= 0) {
      alert("Ingresa interés y número de pagos válidos");
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
            <div>Capital: ${Number(p.capital || 0).toFixed(2)}</div>
            <div>Total: ${Number(p.total || 0).toFixed(2)}</div>
            <div>Saldo: ${Number(p.saldo || 0).toFixed(2)}</div>

            {p.tipo === "gota" ? (
              <>
                <div>Utilidad: ${Number(p.utilidad || 0).toFixed(2)}</div>
                <div>Días: {p.dias || 0}</div>
              </>
            ) : (
              <>
                <div>Interés: {Number(p.interes || 0)}%</div>
                <div>Número de pagos: {Number(p.numeroPagos || 0)}</div>
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