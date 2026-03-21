"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ClienteDetalle() {
  const router = useRouter();
  const params = useParams();

  const [cliente, setCliente] = useState<any>(null);
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);

  useEffect(() => {
    const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
    const clienteEncontrado = clientes.find((c: any) => c.id === params.id);

    if (!clienteEncontrado) {
      router.push("/clientes");
      return;
    }

    setCliente(clienteEncontrado);

    const prestamosGuardados = JSON.parse(localStorage.getItem("prestamos") || "[]");
    const pagosGuardados = JSON.parse(localStorage.getItem("pagos") || "[]");

    const prestamosCliente = prestamosGuardados.filter(
      (p: any) => p.clienteId === clienteEncontrado.id
    );

    const pagosCliente = pagosGuardados.filter(
      (p: any) => p.clienteId === clienteEncontrado.id
    );

    setPrestamos(prestamosCliente);
    setPagos(pagosCliente);
  }, [params.id]);

  // 📂 GUARDAR DOCUMENTO
  const guardarDocumento = (tipo: string, file: File) => {
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

  // 📂 OBTENER DOCUMENTO
  const obtenerDocumento = (tipo: string) => {
    const expedientes = JSON.parse(localStorage.getItem("expedientes") || "{}");
    return expedientes[cliente?.id]?.[tipo];
  };

  // 📱 WHATSAPP
  const enviarWhatsApp = () => {
    if (!cliente?.telefono) return;

    const numero = "52" + cliente.telefono.replace(/\D/g, "");
    const mensaje = `Hola ${cliente.nombre}, tienes un saldo pendiente de $${totalPendiente}. Por favor realiza tu pago hoy.`;

    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`);
  };

  // 📍 MAPS
  const abrirMaps = () => {
    if (!cliente?.ubicacion) return;
    window.open(cliente.ubicacion, "_blank");
  };

  if (!cliente) return <div>Cargando...</div>;

  const totalPrestamos = prestamos.reduce((acc, p) => acc + p.total, 0);
  const totalPagado = pagos.reduce((acc, p) => acc + p.monto, 0);
  const totalPendiente = totalPrestamos - totalPagado;

  return (
    <div style={{ padding: 20 }}>
      <h1>Ficha del cliente</h1>

      <button onClick={() => router.push("/clientes")}>
        ← Volver a clientes
      </button>

      <button onClick={enviarWhatsApp} style={{ marginLeft: 10 }}>
        WhatsApp
      </button>

      {cliente.ubicacion && (
        <button onClick={abrirMaps} style={{ marginLeft: 10 }}>
          Abrir en Maps
        </button>
      )}

      <div style={{ marginTop: 20 }}>
        <p><strong>Nombre:</strong> {cliente.nombre}</p>
        <p><strong>Teléfono:</strong> {cliente.telefono}</p>
        <p><strong>Dirección:</strong> {cliente.direccion}</p>
        <p><strong>Total pendiente:</strong> ${totalPendiente}</p>
      </div>

      {/* 📂 EXPEDIENTE DIGITAL */}
      <h2>Expediente digital</h2>

      <div>
        <p>INE Frente</p>
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              guardarDocumento("ineFrente", e.target.files[0]);
            }
          }}
        />
        {obtenerDocumento("ineFrente") && (
          <img src={obtenerDocumento("ineFrente")} width={200} />
        )}
      </div>

      <div>
        <p>INE Reverso</p>
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              guardarDocumento("ineReverso", e.target.files[0]);
            }
          }}
        />
        {obtenerDocumento("ineReverso") && (
          <img src={obtenerDocumento("ineReverso")} width={200} />
        )}
      </div>

      <div>
        <p>Comprobante domicilio</p>
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              guardarDocumento("domicilio", e.target.files[0]);
            }
          }}
        />
        {obtenerDocumento("domicilio") && (
          <img src={obtenerDocumento("domicilio")} width={200} />
        )}
      </div>

      {/* 💰 PRÉSTAMOS */}
      <h2>Préstamos del cliente</h2>

      {prestamos.map((p, i) => (
        <div key={i} style={{ border: "1px solid #ccc", marginBottom: 10 }}>
          <p>Total: ${p.total}</p>
          <p>Saldo: ${p.saldo}</p>
        </div>
      ))}

      {/* 🧾 HISTORIAL */}
      <h3>Historial de pagos</h3>

      {pagos.map((p, i) => (
        <div key={i}>
          <p>Monto: ${p.monto}</p>
          <p>Fecha: {p.fecha}</p>
        </div>
      ))}
    </div>
  );
}