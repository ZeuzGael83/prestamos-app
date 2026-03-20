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

  return (
    <main style={{ padding: 20 }}>
      <h1>Préstamos híbrido</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <button onClick={() => (window.location.href = "/dashboard")}>
          ← Volver al dashboard
        </button>
        <button onClick={() => (window.location.href = "/pagos")}>
          Ver pagos
        </button>
      </div>

      <div style={{ display: "grid", gap: 10, maxWidth: 400 }}>
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Selecciona un cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <select value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
          <option value="gota">Gota a gota</option>
          <option value="cuotas">Cuotas + interés</option>
        </select>

        <input
          placeholder="Capital"
          value={capital}
          onChange={(e) => setCapital(e.target.value)}
        />

        {/* Cálculo en vivo */}
        <div>
          Total estimado: $
          {tipo === "gota"
            ? Number(capital || 0) + Number(utilidad || 0)
            : Number(capital || 0) +
              Number(capital || 0) * (Number(interes || 0) / 100)}
        </div>

        {tipo === "gota" ? (
          <>
            <input
              placeholder="Utilidad"
              value={utilidad}
              onChange={(e) => setUtilidad(e.target.value)}
            />
            <input
              placeholder="Días"
              value={dias}
              onChange={(e) => setDias(e.target.value)}
            />
          </>
        ) : (
          <>
            <input
              placeholder="Interés %"
              value={interes}
              onChange={(e) => setInteres(e.target.value)}
            />
            <input
              placeholder="Número de pagos"
              value={numeroPagos}
              onChange={(e) => setNumeroPagos(e.target.value)}
            />
          </>
        )}

        <button onClick={guardar}>Guardar préstamo</button>
      </div>

      <hr />

      <h2>Listado de préstamos</h2>

      {prestamos.length === 0 ? (
        <p>No hay préstamos registrados.</p>
      ) : (
        prestamos.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              marginBottom: 10,
            }}
          >
            <strong>{p.clienteNombre}</strong>
            <div>Tipo: {p.tipo === "gota" ? "Gota a gota" : "Cuotas + interés"}</div>
            <div>Capital: ${p.capital}</div>
            <div>Total: ${p.total}</div>
            <div>Saldo: ${p.saldo}</div>

            {p.tipo === "gota" ? (
              <>
                <div>Utilidad: ${p.utilidad}</div>
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