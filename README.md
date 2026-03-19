# Prestamos App

MVP descargable para administración de préstamos, cobranza y KPIs.

## Incluye
- Next.js + TypeScript
- NextAuth con credenciales
- Prisma + PostgreSQL
- Dashboard inicial con KPIs
- Alta rápida de clientes
- Alta de préstamo con generación automática de cuotas
- Endpoint de pagos con aplicación a cuotas pendientes

## Requisitos
- Node.js 20+
- PostgreSQL

## Instalación
1. Copia `.env.example` a `.env`
2. Ajusta `DATABASE_URL`, `NEXTAUTH_SECRET` y credenciales iniciales
3. Instala dependencias:

```bash
npm install
```

4. Genera cliente Prisma y corre migración:

```bash
npx prisma migrate dev --name init
```

5. Ejecuta seed:

```bash
npm run db:seed
```

6. Inicia el proyecto:

```bash
npm run dev
```

## Acceso inicial
- Correo: `admin@prestamos.local`
- Contraseña: `Admin123!`

## Rutas principales
- `/login`
- `/dashboard`
- `/clientes`
- `/prestamos/nuevo`

## Notas importantes
- Este paquete es una base funcional de MVP, no una versión final de producción.
- La lógica financiera está implementada con interés simple para acelerar el arranque.
- Los módulos de PDF, reportes avanzados, permisos granulares y WhatsApp quedan listos para la siguiente fase.
