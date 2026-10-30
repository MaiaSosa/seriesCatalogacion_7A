# seriesCatalogacion_7A

Aplicación web desarrollada con Next.js, TypeScript y PostgreSQL para gestionar plataformas, series y valoraciones.

## Requisitos

- Node.js 20+
- npm
- PostgreSQL
- Cuenta o instancia de PostgreSQL disponible para la conexión

## Instalación

1. Clona el repositorio.
2. Instala las dependencias:

```bash
npm install
```

3. Crea una copia del archivo de entorno:

```bash
cp .env.example .env.local
```

4. Configura la variable `DATABASE_URL` en `.env.local` con la cadena de conexión de PostgreSQL real:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/seriescatalogacion_7a?schema=public"
```

5. Crea la base de datos y sincroniza el esquema:

```bash
npx prisma db push
```

6. Genera el cliente de Prisma:

```bash
npx prisma generate
```

7. Inicia la aplicación:

```bash
npm run dev
```

La app quedará disponible en http://localhost:3000.

## Scripts disponibles

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Estructura principal

- `app/`: páginas y rutas API de la aplicación.
- `app/api/plataformas`: endpoints de CRUD para plataformas.
- `app/api/series`: endpoints de CRUD para series.
- `app/api/valoraciones`: endpoints de CRUD para valoraciones.
- `prisma/schema.prisma`: modelo relacional para PostgreSQL.
- `.env.example`: plantilla de variables de entorno.

## Despliegue en Vercel

1. Subir el repositorio a GitHub.
2. Crear un proyecto en Vercel.
3. Conectar el repositorio.
4. Definir la variable de entorno `DATABASE_URL` en el panel de configuración de Vercel.
5. Desplegar la aplicación.

> Para producción, la base de datos debe existir en PostgreSQL y la conexión debe configurarse con credenciales reales y seguras.

## Reglas de negocio

- Cada serie debe estar asociada a una plataforma existente.
- Cada valoración debe relacionarse con una serie y una plataforma.
- La plataforma seleccionada en la valoración debe coincidir con la plataforma asociada a la serie.
- El puntaje debe estar en el rango de 1 a 10.
