
export default function Page() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#111827",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
          color: "white",
          padding: "48px 24px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.12)",
              padding: "8px 14px",
              borderRadius: 999,
              fontSize: 14,
              marginBottom: 18,
            }}
          >
            Sistema de administración de préstamos
          </div>

          <h1
            style={{
              fontSize: 42,
              lineHeight: 1.1,
              margin: "0 0 14px 0",
              fontWeight: 800,
            }}
          >
            Controla tu cartera, cobranza y ganancias en un solo lugar
          </h1>

          <p
            style={{
              fontSize: 18,
              maxWidth: 760,
              lineHeight: 1.6,
              margin: 0,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Administra clientes, registra préstamos, genera cuotas, controla
            pagos y visualiza indicadores clave de tu operación financiera desde
            cualquier dispositivo.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 28,
            }}
          >
            <a
              href="/login"
              style={{
                background: "white",
                color: "#111827",
                textDecoration: "none",
                padding: "14px 20px",
                borderRadius: 12,
                fontWeight: 700,
              }}
            >
              Entrar al sistema
            </a>

            <a
              href="#kpis"
              style={{
                background: "transparent",
                color: "white",
                textDecoration: "none",
                padding: "14px 20px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.35)",
                fontWeight: 700,
              }}
            >
              Ver KPIs
            </a>
          </div>
        </div>
      </section>

      <section style={{ padding: "24px" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginTop: -34,
          }}
        >
          {[
            ["Cartera activa", "$ 245,000"],
            ["Cobranza del mes", "$ 82,450"],
            ["Préstamos activos", "128"],
            ["Morosidad", "4.2%"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                background: "white",
                borderRadius: 18,
                padding: 20,
                boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
              }}
            >
              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
                {label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="kpis" style={{ padding: "24px 24px 48px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 30, marginBottom: 10 }}>
            KPIs que visualizará el sistema
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 14,
              marginTop: 24,
            }}
          >
            {[
              "Capital disponible",
              "Cartera activa",
              "Monto vencido",
              "Cobranza del día",
              "Cobranza del mes",
              "Ganancia realizada",
              "Clientes activos",
              "Préstamos liquidados",
            ].map((item) => (
              <div
                key={item}
                style={{
                  background: "#eef2ff",
                  color: "#1e3a8a",
                  borderRadius: 14,
                  padding: "14px 16px",
                  fontWeight: 700,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}