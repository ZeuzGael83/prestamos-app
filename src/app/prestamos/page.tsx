"use client";

import { useEffect, useState } from "react";

type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
};

type Prestamo = {
  id: string;
  clienteId: string;
  clienteNombre: string;

  tipo: "gota_a_gota" | "cuotas";

  capital: number;
  totalPagar: number;
  saldoPendiente: number;
  estado: "activo" | "liquidado";
  fecha: string;

  utilidad?: number;
  dias?: number;
  cuotaDiaria?: number;

  interes?: number;
  numeroPagos?: number;
  pagoPorCuota?: number;
};

export default function PrestamosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [tipo, setTipo] = useState<"gota_a_gota" | "cuotas">("gota_a_gota");

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

  const clienteSeleccionado = clientes.find((c) => c.id === clienteId);

  const capitalNum = Number(capital || 0);
  const utilidadNum = Number(utilidad || 0);
  const diasNum = Number(dias || 0);

  const interesNum = Number(interes || 0);
  const pagosNum = Number(numeroPagos || 0);

  const totalGota = capitalNum + utilidadNum;
  const cuotaDiaria = diasNum > 0 ? totalGota / diasNum : 0;

  const totalCuotas = capitalNum + capitalNum * (interesNum / 100);
  const pagoPorCuota = pagosNum > 0 ? totalCuotas / pagosNum : 0;

  const guardarPrestamos = (lista: Prestamo[]) => {
    setPrestamos(lista);
    localStorage.setItem("prestamos", JSON.stringify(lista));
  };

  const crearPrestamo = () => {
    if (!clienteId) {
      alert("Selecciona un cliente");
      return;
    }

    if (capitalNum <= 0) {
      alert("El capital debe ser mayor a 0");
      return;
    }

    if (tipo === "gota_a_gota") {
      if (utilidadNum < 0) {
        alert("La utilidad no puede ser negativa");
        return;
      }

      if (diasNum <= 0) {
        alert("Los días deben ser mayores a 0");
        return;
      }

      const nuevoPrestamo: Prestamo = {
        id: Date.now().toString(),
        clienteId,
        clienteNombre: clienteSeleccionado?.nombre || "Cliente",
        tipo: "gota_a_gota",
        capital: capitalNum,
        utilidad: utilidadNum,
        dias: diasNum,
        cuotaDiaria,
        totalPagar: totalGota,
        saldoPendiente: totalGota,
        estado: "activo",
        fecha: new Date().toLocaleDateString(),
      };

      guardarPrestamos([nuevoPrestamo, ...prestamos]);
    } else {
      if (interesNum < 0) {
        alert("El interés no puede ser negativo");
        return;
      }

      if (pagosNum <= 0) {
        alert("El número de pagos debe ser mayor a 0");
        return;
      }

      const nuevoPrestamo: Prestamo = {
        id: Date.now().toString(),
        clienteId,
        clienteNombre: clienteSeleccionado?.nombre || "Cliente",
        tipo: "cuotas",
        capital: capitalNum,
        interes: interesNum,
        numeroPagos: pagosNum,
        pagoPorCuota,
        totalPagar: totalCuotas,
        saldoPendiente: totalCuotas,
        estado: "activo",
        fecha: new Date().toLocaleDateString(),
      };

      guardarPrestamos([nuevoPrestamo, ...prestamos]);
    }

    setClienteId("");
    setCapital("");
    setUtilidad("");
    setDias("");
    setInteres("");
    setNumeroPagos("");
    setTipo("gota_a_gota");
  };

  const eliminarPrestamo = (id: string) => {
    const nuevaLista = prestamos.filter((p) => p.id !== id);
    guardarPrestamos(nuevaLista);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        color: "#111827",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <h1 style={{ margin: 0 }}>Préstamos</h1>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => (window.location.href = "/dashboard")}>
            ← Volver al dashboard
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("auth");
              window.location.href = "/login";
            }}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 14px",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <section
        style={{
          background: "white",
          padding: 16,
          borderRadius: 12,
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          marginBottom: 20,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Nuevo préstamo</h2>

        {clientes.length === 0 ? (
          <p>Primero registra al menos un cliente.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              style={{ padding: 12 }}
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>

            <select
              value={tipo}
              onChange={(e) =>
                setTipo(e.target.value as "gota_a_gota" | "cuotas")
              }
              style={{ padding: 12 }}
            >
              <option value="gota_a_gota">Gota a gota</option>
              <option value="cuotas">Cuotas + interés</option>
            </select>

            <input
              type="number"
              placeholder="Capital prestado"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              style={{ padding: 12 }}
            />

            {tipo === "gota_a_gota" ? (
              <>
                <input
                  type="number"
                  placeholder="Utilidad total"
                  value={utilidad}
                  onChange={(e) => setUtilidad(e.target.value)}
                  style={{ padding: 12 }}
                />

                <input
                  type="number"
                  placeholder="Días de cobro"
                  value={dias}
                  onChange={(e) => setDias(e.target.value)}
                  style={{ padding: 12 }}
                />

                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 10,
                    padding: 14,
                    lineHeight: 1.8,
                  }}
                >
                  <div>
                    <strong>Total a cobrar:</strong> ${totalGota.toFixed(2)}
                  </div>
                  <div>
                    <strong>Cuota diaria:</strong> ${cuotaDiaria.toFixed(2)}
                  </div>
                </div>
              </>
            ) : (
              <>
                <input
                  type="number"
                  placeholder="Interés (%)"
                  value={interes}
                  onChange={(e) => setInteres(e.target.value)}
                  style={{ padding: 12 }}
                />

                <input
                  type="number"
                  placeholder="Número de pagos"
                  value={numeroPagos}
                  onChange={(e) => setNumeroPagos(e.target.value)}
                  style={{ padding: 12 }}
                />

                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 10,
                    padding: 14,
                    lineHeight: 1.8,
                  }}
                >
                  <div>
                    <strong>Total a pagar:</strong> ${totalCuotas.toFixed(2)}
                  </div>
                  <div>
                    <strong>Pago por cuota:</strong> ${pagoPorCuota.toFixed(2)}
                  </div>
                </div>
              </>
            )}

            <button
              onClick={crearPrestamo}
              style={{
                padding: 12,
                background: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
              }}
            >
              Guardar préstamo
            </button>
          </div>
        )}
      </section>

      <section
        style={{
          background: "white",
          padding: 16,
          borderRadius: 12,
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Listado de préstamos</h2>

        {prestamos.length === 0 ? (
          <p>No hay préstamos registrados todavía.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {prestamos.map((prestamo) => (
              <div
                key={prestamo.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {prestamo.clienteNombre}
                </div>

                <div><strong>Tipo:</strong> {prestamo.tipo}</div>
                <div><strong>Capital:</strong> ${prestamo.capital.toFixed(2)}</div>
                <div><strong>Total:</strong> ${prestamo.totalPagar.toFixed(2)}</div>
                <div><strong>Saldo pendiente:</strong> ${prestamo.saldoPendiente.toFixed(2)}</div>
                <div><strong>Estado:</strong> {prestamo.estado}</div>
                <div><strong>Fecha:</strong> {prestamo.fecha}</div>

                {prestamo.tipo === "gota_a_gota" ? (
                  <>
                    <div><strong>Utilidad:</strong> ${Number(prestamo.utilidad || 0).toFixed(2)}</div>
                    <div><strong>Días:</strong> {prestamo.dias}</div>
                    <div><strong>Cuota diaria:</strong> ${Number(prestamo.cuotaDiaria || 0).toFixed(2)}</div>
                  </>
                ) : (
                  <>
                    <div><strong>Interés:</strong> {prestamo.interes}%</div>
                    <div><strong>Número de pagos:</strong> {prestamo.numeroPagos}</div>
                    <div><strong>Pago por cuota:</strong> ${Number(prestamo.pagoPorCuota || 0).toFixed(2)}</div>
                  </>
                )}

                <button
                  onClick={() => eliminarPrestamo(prestamo.id)}
                  style={{
                    marginTop: 10,
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}