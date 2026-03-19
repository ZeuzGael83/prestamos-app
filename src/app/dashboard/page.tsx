"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("auth");

    if (auth !== "true") {
      router.push("/login");
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem("auth");
    router.push("/login");
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>

      <button onClick={logout}>Cerrar sesión</button>

      <h2>KPIs</h2>

      <ul>
        <li>Cartera activa: $245,000</li>
        <li>Cobranza del mes: $82,450</li>
        <li>Clientes activos: 94</li