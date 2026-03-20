"use client";

import { useState } from "react";

export default function Page() {
  const [tipo, setTipo] = useState("gota");

  return (
    <main style={{ padding: 20 }}>
      <h1>Préstamos híbrido</h1>

      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        style={{ padding: 10, marginBottom: 20 }}
      >
        <option value="gota">Gota a gota</option>
        <option value="cuotas">Cuotas + interés</option>
      </select>

      {tipo === "gota" ? (
        <div>
          <input placeholder="Capital" />
          <input placeholder="Utilidad" />
          <input placeholder="Días" />
        </div>
      ) : (
        <div>
          <input placeholder="Capital" />
          <input placeholder="Interés %" />
          <input placeholder="Número de pagos" />
        </div>
      )}
    </main>
  );
}