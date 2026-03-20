"use client";

import { useEffect, useState } from "react";

type Cliente = {
  id: string;
  nombre: string;
};

type Prestamo = {
  id: string;
  clienteNombre: string;
  tipo: "gota" | "cuotas";
  capital: number;
  total: number;
  saldo: number;
};

export default function Page() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);

  const [cliente, setCliente] = useState("");
  const [tipo, setTipo] = useState<"gota" | "cuotas">("gota");

  const [capital, setCapital] = useState("");
  const [utilidad, setUtilidad] = useState("");
  const [dias, setDias] = useState("");

  const [interes, setInteres] = useState("");
  const [pagos, setPagos] = useState("");

  useEffect(() => {
    const c = localStorage.getItem("clientes");
    if (c) setClientes(JSON.parse(c));

    const p = localStorage.getItem("prestamos");
    if (p) setPrestamos(JSON.parse(p));
  }, []);

  const guardar = () => {
    if (!cliente || !capital) return alert("Completa los datos");

    let total = 0;

    if (tipo === "gota") {
      total = Number(capital) + Number(utilidad);
    } else {
      total = Number(capital) + Number(capital) * (Number(interes) / 100);
    }

    const nuevo: Prestamo = {
      id: Date.now().toString(),
      clienteNombre:
        clientes.find((c) => c.id === cliente)?.nombre || "Cliente",
      tipo,
      capital: Number(capital),
      total,
      saldo: total,
    };

    const lista = [nuevo, ...prestamos];
    setPrestamos(lista);
    localStorage.setItem("prestamos", JSON.stringify(lista));

    // reset
    setCliente("");
    setCapital("");
    setUtilidad("");
    setDias("");
    setInteres("");
    setPagos("");
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Préstamos (Híbrido)</h1>

      <div style={{ display: "grid", gap: 10, maxWidth: 400 }}>
        <select value={cliente} onChange={(e) => setCliente(e.target.value)}>
          <option value="">Cliente</option>
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
          type="number"
          value={capital}
          onChange={(e) => setCapital(e.target.value)}
        />

        {tipo === "gota" ? (
          <>
            <input
              placeholder="Utilidad"
              type="number"
              value={utilidad}
              onChange={(e) => setUtilidad(e.target.value)}
            />
            <input
              placeholder="Días (opcional)"
              type="number"
              value={dias}
              onChange={(e) => setDias(e.target.value)}
            />
          </>
        ) : (
          <>
            <input
              placeholder="Interés %"
              type="number"
              value={interes}
              onChange={(e) => setInteres(e.target.value)}
            />
            <input
              placeholder="Número de pagos"
              type="number"
              value={pagos}
              onChange={(e) => setPagos(e.target.value)}
            />
          </>
        )}

        <button onClick={guardar}>Guardar</button>
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h2>Préstamos</h2>

      {prestamos.map((p) => (
        <div key={p.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <div><strong>{p.clienteNombre}</strong></div>
          <div>Tipo: {p.tipo}</div>
          <div>Total: ${p.total}</div>
          <div>Saldo: ${p.saldo}</div>
        </div>
      ))}
    </main>
  );
}