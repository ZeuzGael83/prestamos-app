"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "admin@prestamos.local" && password === "Admin123!") {
      localStorage.setItem("prestamos_auth", "ok");
      router.push("/dashboard");
      return;
    }

    setError("Credenciales incorrectas");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 30 }}>Iniciar sesión</h1>
        <p style={{ color: "#6b7280", lineHeight: 1.6 }}>
          Accede al panel administrativo del sistema de préstamos.
        </p>

        <form
          onSubmit={handleLogin}
          style={{ display: "grid", gap: 14, marginTop: 20 }}
        >
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@prestamos.local"
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 12,
                border: "1px solid #d1d5db",
                fontSize: 16,
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6 }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin123!"
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 12,
                border: "1px solid #d1d5db",
                fontSize: 16,
              }}
            />
          </div>

          {error ? (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: 12,
                borderRadius: 12,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            style={{
              background: "#1d4ed8",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: 14,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Entrar
          </button>
        </form>

        <div
          style={{
            marginTop: 18,
            fontSize: 14,
            color: "#6b7280",
            lineHeight: 1.6,
          }}
        >
          <strong>Acceso demo:</strong>
          <br />
          admin@prestamos.local
          <br />
          Admin123!
        </div>
      </div>
    </main>
  );
}