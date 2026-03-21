import { ui } from "../ui";
"use client";

import { useState } from "react";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const iniciarSesion = () => {
    if (usuario === "admin" && password === "1234") {
      localStorage.setItem("auth", "true");
      window.location.href = "/dashboard";
      return;
    }

    alert("Usuario o contraseña incorrectos");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0e7ff 0%, #eef2ff 45%, #dbeafe 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
        }}
      >
        <section
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
            color: "white",
            borderRadius: 28,
            padding: 24,
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.25)",
            marginBottom: 14,
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
            Plataforma de cobranza y control
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 40,
              lineHeight: 1.02,
              fontWeight: 800,
            }}
          >
            Acceso
            <br />
            seguro
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
            Ingresa para administrar clientes, préstamos, pagos, expediente digital y cobranza.
          </p>
        </section>

        <section
          style={{
            background: "white",
            border: "1px solid #dbe4f0",
            borderRadius: 28,
            padding: 22,
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 16,
            }}
          >
            Iniciar sesión
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <input
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />

            <button
              onClick={iniciarSesion}
              style={{
                background: "#1d4ed8",
                color: "white",
                border: "none",
                padding: "14px 16px",
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 16,
                marginTop: 6,
                boxShadow: "0 10px 20px rgba(29, 78, 216, 0.25)",
              }}
            >
              Entrar al sistema
            </button>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 16,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#475569",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: "#0f172a" }}>Acceso de prueba</strong>
            <br />
            Usuario: <strong>admin</strong>
            <br />
            Contraseña: <strong>1234</strong>
          </div>
        </section>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 14px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  fontSize: 16,
  outline: "none",
  background: "#f8fafc",
  color: "#0f172a",
};