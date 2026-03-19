"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "admin@prestamos.local" && password === "Admin123!") {
      localStorage.setItem("auth", "true");
      router.push("/dashboard");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Login</h1>

      <form onSubmit={handleLogin} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Entrar</button>
      </form>

      <p>admin@prestamos.local / Admin123!</p>
    </main>
  );
}