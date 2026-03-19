"use client";

export default function Page() {
  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>Dashboard OK</h1>
      <p>El login redirigió correctamente.</p>
      <button
        type="button"
        onClick={() => {
          localStorage.removeItem("auth");
          window.location.href = "/login";
        }}
      >
        Cerrar sesión
      </button>
    </main>
  );
}