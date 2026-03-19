"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleLogin = () => {
    const correo = email.trim().toLowerCase();
    const clave = password.trim();

    if (correo === "admin@prestamos.local" && clave === "Admin123!") {
      localStorage.setItem("auth", "true");
      setMensaje("Acceso correcto. Entrando al dashboard...");
      window.location.href = "/dashboard";
      return;
    }

    setMensaje("Credenciales incorrectas");
  };

  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>Login</h1>

      <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 12 }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 12 }}
        />

        <button
          type="button"
          onClick={handleLogin}
          style={{ padding: 12, cursor: "pointer" }}
        >
          Entrar
        </button>
      </div>

      <p style={{ marginTop: 20 }}>
        admin@prestamos.local / Admin123!
      </p>

      {mensaje ? (
        <p style={{ marginTop: 12, fontWeight: 700 }}>{mensaje}</p>
      ) : null}
    </main>
  );
}