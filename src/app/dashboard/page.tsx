"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("prestamos_auth");
    if (auth !== "ok") {
      router.push("/login");
      return;
    }
    setReady(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("prestamos_auth");
    router.push("/login");
  };

  if (!ready) {
    return (
      <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
        Cargando...
      </main>
    );
  }

  const cards = [
    ["Cartera activa", "$245,000"],
    ["Capital disponible", "$80,000"],
    ["Cobranza del día", "$6,250"],
    ["Cobranza del mes", "$82,450"],
    ["Ganancia realizada", "$21,300"],
    ["Monto vencido", "$10,500"],
    ["Préstamos activos", "128"],
    ["Clientes activos", "94"],
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
        color: "#111827",
      }}
    >
      <header
        style={{
          background: "#0f172a",
          color: "white",
          padding: "18px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>Panel administrativo</div>
            <h1 style={{ margin: 0, fontSize: 28 }}>Dashboard de préstamos</h1>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "12px 16px",
              fontWeight: 700,
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <section style={{ padding: 24 }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {cards.map(([label, value]) => (
            <div
              key={label}
              style={{
                background: "white",
                borderRadius: 18,
                padding: 20,
                boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
              }}
            >
              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
                {label}
              </div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>{value}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}