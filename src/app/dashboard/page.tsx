"use client";

export default function DashboardPage() {
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
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>Panel de control</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        <Card title="Cartera activa" value="$245,000" />
        <Card title="Cobranza del mes" value="$82,450" />
        <Card title="Clientes activos" value="94" />
        <Card title="Préstamos activos" value="128" />
      </div>

      <div style={{ marginTop: 30, display: "grid", gap: 10 }}>
        <button
          onClick={() => {
            window.location.href = "/clientes";
          }}
        >
          👤 Clientes
        </button>

        <button onClick={() => alert("Préstamos (siguiente módulo)")}>
          💰 Préstamos
        </button>

        <button onClick={() => alert("Pagos (siguiente módulo)")}>
          💳 Pagos
        </button>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("auth");
          window.location.href = "/login";
        }}
        style={{
          marginTop: 40,
          padding: 12,
          background: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: 10,
          fontWeight: 700,
        }}
      >
        Cerrar sesión
      </button>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        background: "white",
        padding: 16,
        borderRadius: 12,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.6 }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  );
}