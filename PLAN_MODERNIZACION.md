# Plan de Modernización — Student HUB

> **Estado:** documento de recomendaciones. **No se ha modificado ni una línea de código.**
> **Fecha:** 2 de setiembre de 2026
> **Contexto asumido:** uso real en el colegio con datos de estudiantes reales · presupuesto de infraestructura ¢0 · migración híbrida desde Google Sheets · equipo cómodo con full-stack · **identidad = correo institucional del MEP (Office 365)** · **Student HUB es un producto propio del equipo; el CTP es la institución piloto, no la dueña.**

---

## 0. Resumen ejecutivo

| Decisión | Recomendación | Por qué en una línea |
|---|---|---|
| Framework | **Vite + React 19 + TypeScript** (SPA) | Mantiene la PWA instalable, cero servidor propio, la curva más corta desde lo que ya existe. |
| Estilos | **Tailwind CSS v4**, portando el design system actual a `@theme` | El CSS que ya tienen es bueno; Tailwind v4 lo absorbe tal cual en variables nativas. |
| Base de datos | **Supabase (PostgreSQL) con Row Level Security** | Trae Auth + Postgres + Storage + roles en un solo servicio gratuito. |
| Autenticación | **Código de 6 dígitos al correo MEP** (Office 365) | El SSO de Microsoft exige un registro de aplicación en el tenant del ministerio, imposible en la práctica. El código por correo no requiere nada del MEP. |
| Hosting | **Cloudflare Pages** | Gratis, sin cláusula de "solo uso personal" (Vercel Hobby sí la tiene). |
| Google Sheets | **Se queda para horarios y menús; nunca para datos de estudiantes** | Ese es el corte natural: datos públicos en Sheets, datos personales en Postgres con RLS. |
| Modelo de datos | **Multi-institución desde el día uno** | El CTP es el piloto, no el único cliente. Meterle `institucion_id` después, con datos reales adentro, es la migración más cara que existe. |
| Rol legal | **Encargado del tratamiento**, no responsable | El colegio decide el para qué; ustedes procesan por encargo. Eso exige contrato escrito (§7). |
| Migración | **Strangler pattern**: app nueva en paralelo, sección por sección | Nada de reescritura de golpe con la app en producción. |

**La conclusión más importante del análisis:** el problema no es que la app esté en HTML/CSS/JS puro — eso funciona bien. El problema es que **hoy no existe ningún control de acceso**. Los datos del carnet están escritos a mano en `index.html`, cualquiera que abra la app ve el carnet de "Erick Martínez", y el QR es una animación decorativa que no valida nada. React y Tailwind son mejoras de mantenibilidad; la autenticación y la base de datos son un requisito para poder usar la app con estudiantes reales.

---

## 1. Diagnóstico del estado actual

### 1.1 Lo que está bien y hay que conservar

- **El design system.** `css/styles.css` (1 843 líneas) tiene variables bien pensadas: escala de radios, tres niveles de sombra, tintes de marca, modo oscuro completo vía `[data-theme="dark"]`, `prefers-reduced-motion` respetado y breakpoints documentados en el encabezado del archivo. Eso es trabajo real y **no se bota**.
- **La arquitectura responsive.** Nav inferior en móvil, sidebar en ≥1024px, estilos de impresión para el carnet. Está bien resuelto.
- **La PWA funciona.** `sw.js` con stale-while-revalidate, precaché de assets y limpieza de cachés viejos por versión.
- **Los detalles de UX.** Historial con `pushState`/`popstate` (el gesto de "atrás" del celular funciona), feedback háptico, animaciones en cascada, autocuración cuando el API responde vacío. Son detalles que casi nadie implementa.
- **La documentación.** `README.md` y `BASES_DE_DATOS.md` están mejor escritos que los de la mayoría de proyectos profesionales.

### 1.2 Deuda técnica

| Problema | Dónde | Impacto |
|---|---|---|
| Todo el JS en un solo `DOMContentLoaded` de 698 líneas | `js/script.js` | Nada es reutilizable ni testeable; cada función nueva engorda el mismo bloque. |
| Sin build, sin dependencias, sin tests, sin linter | raíz | No hay red de seguridad: un typo llega a producción. |
| `MOCK_MENUS`: 5 semanas de menús duplicadas en el cliente | `js/script.js` líneas 512-560 | ~50 líneas de datos que hay que editar a mano y redesplegar cada ciclo. |
| `comedorSemanaActiva: 4` se cambia a mano | `js/config.js` | Alguien tiene que acordarse cada semana, editar, hacer commit y subir el `CACHE_NAME`. Debería calcularse por fecha. |
| `CACHE_NAME` manual (`studenthub-cache-v19`) | `sw.js` | Si se olvida subirlo, los estudiantes se quedan con la versión vieja pegada en el celular. |
| Datos del estudiante escritos a mano en el HTML | `index.html` sección `#carnet` | La app sirve para exactamente un estudiante. |
| Solo el grupo 11-2 tiene horario | `js/config.js` + `index.html` | Los otros cinco grados son tarjetas deshabilitadas. |
| Google Fonts cargado desde el cliente | `index.html` | Manda la IP de cada estudiante a Google en cada carga. Autohospedar la fuente lo resuelve y además carga más rápido. |
| El logo "SVG" es un PNG de 1,1 MB incrustado en base64 | `assets/SHlogo.svg` 1,15 MB · `SHlarge.svg` 1,17 MB · `SHOG.svg` 1,17 MB | No son vectores: cada archivo es un `<image>` raster embebido dentro de un envoltorio SVG. Un logo real pesaría unos pocos KB. |
| El service worker precachea **6,2 MB** de imágenes | `sw.js` → `ASSETS_TO_CACHE` | Cada estudiante que instala la PWA descarga 6,2 MB, y se repite en cada cambio de `CACHE_NAME`. En datos móviles eso duele. |

> **Nota sobre el peso de los assets.** Verificado archivo por archivo: los tres `.svg` del logo no son vectores sino PNG en base64 (1,13 MB de imagen incrustada cada uno, con metadatos C2PA de generación por IA), y las cinco imágenes del carrusel pesan ~700 KB cada una. `ASSETS_TO_CACHE` precachea ocho de ellas: **6 515 482 bytes** en la instalación.
> **Arreglo rápido, independiente de toda la migración:** vectorizar o re-exportar el logo (bajaría a unos pocos KB), convertir el carrusel a WebP o AVIF con `<img loading="lazy">`, y sacar las noticias del precaché para que se cacheen bajo demanda. Solo eso reduce la instalación de 6,2 MB a menos de 500 KB.

### 1.3 Riesgos de seguridad — ordenados por gravedad

**1. No existe autenticación. (Crítico)**
No hay login, no hay sesión, no hay usuario. La app entera es pública. En el momento en que entren datos de estudiantes reales, no habría nada que impida a cualquier persona verlos.

**2. Los endpoints de datos son públicos y sin llave. (Crítico si migran datos personales)**
Los dos Apps Script están desplegados como *"Cualquier persona"* y sus URLs están en `js/config.js`, que se descarga en el navegador de todo el mundo. Esto es **aceptable hoy** porque solo sirven horarios y menús (datos no personales), y es **inaceptable** para cualquier dato de estudiantes. Una URL en el JS del cliente no es un secreto: no hay forma de esconderla.

**3. XSS por `innerHTML` con datos de una hoja compartida. (Alto)**
En `renderFilasHorario()` y en el render del comedor, los valores que vienen del API se insertan con `innerHTML` sin escapar. Quien tenga permiso de edición en la hoja de cálculo puede escribir `<img src=x onerror="...">` en una celda y ese código se ejecuta en el teléfono de todos los estudiantes. Con React esto se elimina solo: JSX escapa por defecto.

**4. Los identificadores de infraestructura están en el repositorio. (Medio)**
`BASES_DE_DATOS.md` contiene los IDs de las hojas de cálculo y las URLs completas de despliegue de los Apps Script. Si el repositorio es público, eso es un mapa de la infraestructura servido en bandeja.

**5. El QR del carnet es decorativo. (Medio, pero engañoso)**
El "QR" son `<div class="qr-pixel">` a los que un `setInterval` les cambia la opacidad al azar cada segundo. No codifica nada y no se puede escanear. La app dice *"Escanea para validar"* y el botón "Guardar Offline" muestra una alerta de que la credencial quedó *"asegurada"* después de un `setTimeout` de 1,5 s que no hace nada. Un carnet que aparenta validación sin validar nada es peor que no tener carnet, porque genera confianza donde no la hay.

**6. Sin bitácora, sin roles, sin respaldos formales. (Medio)**
Google Sheets no da control de acceso por fila, no registra quién consultó qué, y el respaldo depende del historial de versiones de Google. Para datos de menores eso no alcanza.

---

## 2. La decisión central: qué dato va dónde

Antes de escoger tecnología, hay que clasificar los datos. Esto define toda la arquitectura y resuelve la duda de "híbrido o migrar todo":

| Dato | ¿Personal? | Dónde debe vivir | Quién lo edita |
|---|---|---|---|
| Horarios de clase | No | Postgres, lectura pública | Coordinación (Sheets → sync, luego panel admin) |
| Menú del comedor | No | Postgres, lectura pública | Cocina (Sheets → sync, luego panel admin) |
| Noticias / carrusel | No | Postgres + Storage | Comunicación |
| Nombre, foto, grupo, especialidad | **Sí, de menores** | Postgres con RLS, foto en bucket privado | Solo administración, importación controlada |
| Identificación del estudiante | **Sí** | Postgres con RLS; usar ID interno, no la cédula | Solo administración |
| Notas, asistencia, expediente | **Sí, sensible** | No implementar todavía — ver §7 | — |

**Regla que resuelve el híbrido:** *lo que ya es público sigue en Sheets; lo que identifica a una persona nunca toca Sheets.*

Esto tiene un beneficio inmediato aparte de la seguridad: como los datos de estudiantes entran por Postgres desde el día uno, no hay que migrarlos después.

---

## 3. Frontend: React + Tailwind

### 3.1 Vite vs Next.js

| | **Vite + React (SPA)** ← recomendado | Next.js (App Router) |
|---|---|---|
| PWA instalable offline | Natural. `vite-plugin-pwa` genera el service worker con Workbox y **elimina el `CACHE_NAME` manual** | Se puede, pero pelea contra el modelo de servidor |
| Necesita servidor | No: sale un sitio estático | Sí, funciones de servidor |
| Hosting gratis sin restricciones | Cloudflare Pages, Netlify, GitHub Pages | Vercel Hobby es **solo uso no comercial**; en Cloudflare hay fricción |
| SEO | Irrelevante — es una app tras login | Mejor, pero no aporta aquí |
| Lógica de servidor / secretos | Supabase Edge Functions | Route Handlers |
| Complejidad | Baja | Media-alta |

**Recomendación: Vite.** Student HUB es una app móvil instalable detrás de un login, no un sitio de contenido. El único argumento fuerte a favor de Next.js sería necesitar un servidor propio, y con Supabase no lo necesitan: Auth, base de datos y las funciones para sincronizar y firmar el QR ya vienen incluidas.

### 3.2 Tailwind v4 sin perder el diseño actual

El error más común al migrar a Tailwind es botar el CSS existente y terminar con una app que se ve genérica. **No hagan eso.** Tailwind v4 usa variables CSS nativas, así que el design system actual se porta casi literal:

```css
/* app.css */
@import "tailwindcss";

@theme {
  --color-primary:      #0130B2;
  --color-primary-dark: #0B2B80;
  --color-surface:      #f3f6fc;
  --color-surface-alt:  #eaf0fb;
  --color-text:         #0c142c;
  --color-text-muted:   #5c6b8f;

  --radius-md:  14px;
  --radius-lg:  20px;
  --radius-xl:  28px;

  --shadow-sm: 0 1px 2px rgb(11 43 128 / .06), 0 2px 8px rgb(11 43 128 / .04);
  --shadow-md: 0 4px 12px rgb(11 43 128 / .06), 0 14px 30px rgb(11 43 128 / .06);
}

/* Conserva el modo oscuro tal como está hoy, con data-theme */
@custom-variant dark (&:where([data-theme="dark"] *));
```

Con eso, `bg-primary`, `rounded-xl`, `shadow-md` y `dark:bg-surface-alt` producen exactamente los mismos valores que hoy. El toggle de tema y `localStorage` siguen funcionando sin cambios.

**Componentes:** vale la pena **shadcn/ui**. No es una dependencia — copia el código del componente a `src/components/ui/`, así que ustedes son dueños del estilo. Aporta accesibilidad real (foco, teclado, ARIA) en diálogos, tabs y selects, que es lo que más cuesta hacer bien a mano.

### 3.3 Estructura propuesta

```
src/
  app/
    router.tsx            # rutas: /, /carnet, /horarios, /comedor, /admin
    providers.tsx         # QueryClient, sesión de Supabase, tema
  features/
    auth/                 # login, guard de rutas, hook useSession
    carnet/               # tarjeta, QR firmado, modo offline
    horarios/             # selector de grado, lista, hooks de datos
    comedor/              # menú de hoy, menú semanal
    noticias/             # carrusel
    admin/                # CRUD de horarios, menús, noticias, importar estudiantes
  components/ui/          # shadcn/ui
  lib/
    supabase.ts           # cliente
    db.types.ts           # tipos generados con `supabase gen types`
  styles/app.css
```

Organizar por **feature**, no por tipo de archivo. Las cuatro secciones de la app se mapean 1:1 a carpetas y cada una es portable de forma independiente.

### 3.4 Librerías

| Necesidad | Recomendación |
|---|---|
| Datos del servidor y caché | **TanStack Query** — reemplaza el `Map` de `cacheHorarios` con reintentos, revalidación y estados de carga gratis |
| Rutas | React Router v7 (o TanStack Router si quieren tipado de rutas) |
| Formularios (panel admin) | React Hook Form + Zod |
| Fechas | `date-fns` con locale `es` — resuelve `normalizarDia()` y el cálculo de semana del comedor |
| QR real | `qrcode.react` para pintar, `jose` para firmar/verificar el token |
| PWA | `vite-plugin-pwa` (Workbox) |
| Animaciones | Empezar con CSS puro como hoy; Motion solo si hace falta |
| Tests | Vitest + React Testing Library; Playwright para el flujo de login y carnet |

### 3.5 PWA

`vite-plugin-pwa` con `registerType: 'autoUpdate'` genera el service worker con revisión por hash de cada archivo. Eso **elimina el problema del `CACHE_NAME` manual**: ya no hay que acordarse de subir la versión ni pedirle a nadie que haga `Ctrl+Shift+R`.

Reglas de caché a definir explícitamente:
- Shell de la app y assets → precaché.
- Horarios y menús → `StaleWhileRevalidate` (igual que hoy).
- **Datos del estudiante y el carnet → nunca en caché del service worker.** Si se quiere carnet offline, guardar solo un token firmado de vigencia corta en IndexedDB, no la ficha completa.
- Fuente autohospedada con `@fontsource/poppins` en lugar de Google Fonts.

---

## 4. Backend y base de datos

### 4.1 Comparativa

| | **Supabase** ← recomendado | Firebase | Neon + Auth.js | Cloudflare D1 |
|---|---|---|---|---|
| Motor | PostgreSQL | Firestore (NoSQL) | PostgreSQL | SQLite |
| Auth incluida | Sí | Sí | Hay que montarla | No |
| Permisos por fila | **RLS de Postgres** | Security Rules | Se escribe a mano | Se escribe a mano |
| Storage de fotos | Sí, buckets privados | Sí | No | R2 aparte |
| Plan gratis | 500 MB · 50 000 MAU · 5 GB egress | Generoso | 0.5 GB | 5 GB · 5 M lecturas/día |
| Trampa del plan gratis | **Se pausa tras 1 semana sin actividad**, sin respaldos automáticos, máx. 2 proyectos | Se vuelve caro rápido; NoSQL complica los reportes | Hay que armar la auth completa | Sin auth, SQLite |
| Esfuerzo de backend | Casi nulo | Bajo | Alto | Alto |

### 4.2 Por qué Supabase

1. **RLS es exactamente la herramienta para este problema.** La regla "cada estudiante solo puede leer su propia fila" se escribe una vez en la base de datos y se cumple aunque el frontend tenga un bug. La seguridad no depende de que el React esté bien hecho.
2. **Postgres relacional** encaja con el modelo real (grupos → estudiantes → horarios). Firestore obligaría a duplicar datos.
3. **Auth + Storage + base de datos en un solo proveedor** = menos piezas que administrar para un equipo de colegio.
4. **Sin vendor lock-in real:** es Postgres estándar. Si algún día hace falta, un `pg_dump` se restaura en cualquier lado.

### 4.3 Esquema propuesto (borrador)

```sql
-- La raíz de todo: cada fila del sistema pertenece a una institución
create table instituciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,              -- 'CTP ...'
  slug text unique not null,         -- 'ctp-xxx' → subdominio o ruta
  dominio_correo text not null,      -- dominio permitido para el login
  activa boolean default true,
  creada_en timestamptz default now()
);

-- Catálogos públicos (sin datos personales)
create table grupos (
  id uuid primary key default gen_random_uuid(),
  institucion_id uuid not null references instituciones(id) on delete cascade,
  codigo text not null,              -- '11-2'
  nivel text not null,               -- '11vo'
  jornada text not null,             -- 'nocturna'
  activo boolean default true,
  unique (institucion_id, codigo)
);

create table horarios (
  id bigserial primary key,
  institucion_id uuid not null references instituciones(id) on delete cascade,
  grupo_id uuid references grupos(id) on delete cascade,
  dia smallint not null check (dia between 1 and 7),
  hora_inicio time not null,
  hora_fin time not null,
  materia text not null,
  docente text,
  aula text,
  es_receso boolean default false
);

create table menus (
  id bigserial primary key,
  institucion_id uuid not null references instituciones(id) on delete cascade,
  fecha date not null,               -- fecha real, no "semana 4" manual
  unique (institucion_id, fecha),
  plato text not null,
  acompanamiento text,
  bebida text,
  fruta text
);

-- Datos personales (protegidos con RLS)
create table estudiantes (
  id uuid primary key default gen_random_uuid(),
  institucion_id uuid not null references instituciones(id) on delete cascade,
  user_id uuid unique references auth.users(id) on delete cascade,
  codigo text not null,              -- ID interno, NO la cédula
  correo text unique not null,       -- correo MEP: llave del padrón y de la identidad
  nombre text not null,
  grupo_id uuid references grupos(id),
  especialidad text,
  foto_path text,                    -- ruta en bucket PRIVADO
  estado text default 'activo',
  creado_en timestamptz default now(),
  unique (institucion_id, codigo)
);

create table roles_usuario (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rol text not null check (rol in ('estudiante','docente','admin','cocina'))
);

create table auditoria (
  id bigserial primary key,
  user_id uuid,
  accion text not null,
  tabla text,
  registro_id text,
  ocurrido_en timestamptz default now()
);
```

Nota sobre el comedor: guardar **fecha real**, no "semana 4". Elimina `comedorSemanaActiva`, elimina `MOCK_MENUS` y hace que "el menú de hoy" sea una consulta, no una heurística.

**Nota sobre `institucion_id`, que es lo más importante de este esquema.** Como el CTP es el piloto y no el único cliente, cada tabla nace con su institución. Cuesta prácticamente nada hacerlo ahora y es carísimo después: agregar multi-institución a un esquema con datos reales adentro obliga a reescribir todas las políticas RLS, migrar todas las filas existentes y hacerlo sin dejar caer la app que ya usa un colegio. Es el error de arquitectura que más veces mata a un producto en su segundo cliente.

Y noten que `dominio_correo` vive en `instituciones`: la regla de quién puede pedir código de acceso es una **configuración por institución**, no una constante en el código. El día que entre un segundo colegio, es una fila nueva, no un despliegue.

### 4.4 Row Level Security — el corazón del asunto

```sql
alter table estudiantes enable row level security;

-- Cada quien ve solo su propia ficha
create policy "estudiante ve lo suyo" on estudiantes
  for select using (auth.uid() = user_id);

-- Y NINGUNA consulta cruza la frontera entre instituciones.
-- Esta función resuelve la institución del usuario actual una sola vez
-- y se usa en todas las políticas de las tablas con institucion_id.
create or replace function institucion_actual() returns uuid
  language sql stable security definer as $$
    select institucion_id from estudiantes where user_id = auth.uid()
  $$;

-- Administración ve todo
create policy "admin ve todo" on estudiantes
  for select using (
    exists (select 1 from roles_usuario r
            where r.user_id = auth.uid() and r.rol = 'admin')
  );

-- Horarios y menús: lectura para cualquiera autenticado, escritura solo admin
alter table horarios enable row level security;
create policy "lectura horarios" on horarios
  for select using (institucion_id = institucion_actual());
create policy "escritura horarios" on horarios for all using (
  exists (select 1 from roles_usuario r
          where r.user_id = auth.uid() and r.rol in ('admin','docente'))
);
```

Con esto, aunque alguien saque la llave pública de Supabase del JavaScript (que es pública por diseño), **no puede leer la ficha de otro estudiante**. Ese es el cambio de fondo frente a Apps Script.

### 4.5 Autenticación con el correo MEP (Office 365)

Contexto confirmado: los estudiantes del CTP usan normalmente su cuenta institucional del MEP, que corre sobre Office 365, y **no hay vía realista para que TI del MEP registre una aplicación en su tenant**. Eso descarta el botón de "Iniciar sesión con Microsoft" y define el camino.

#### Por qué el SSO de Microsoft queda descartado

El inicio de sesión con Entra ID exige un *app registration* dentro del tenant del MEP. Hay dos variantes y las dos fallan:

- **Registrar la app en el tenant del MEP** → requiere aprobación de informática del ministerio.
- **Registrar una app multi-tenant en un tenant propio** → los estudiantes verían *"Se necesita aprobación del administrador"*. Los tenants educativos de ese tamaño desactivan el consentimiento de usuario por defecto, justamente para evitar esto.

No construyan el camino crítico sobre eso.

#### Lo que sí funciona: código de un solo uso al correo MEP

`supabase.auth.signInWithOtp()` manda un código de 6 dígitos a la dirección del estudiante. Si lo recibe, es dueño de esa cuenta. **No requiere absolutamente nada del MEP** — solo que el correo llegue.

No es un premio de consuelo; para este caso tiene tres propiedades muy buenas:

- **El correo MEP es la identidad.** La importación del padrón usa ese correo como llave y el primer ingreso amarra el `user_id`.
- **La baja es automática.** Si el MEP desactiva la cuenta de un egresado, deja de recibir el código y pierde el acceso. Nadie tiene que acordarse de dar de baja a nadie — que es exactamente donde fallan estos sistemas.
- **No hay contraseñas** que custodiar, resetear ni filtrar.

#### El detalle que decide si funciona: código, no magic link

Supabase ofrece las dos formas. **Usen el código de 6 dígitos.**

Un magic link abierto desde Outlook en el celular se abre en el navegador interno de Outlook, que es un contexto distinto de la PWA instalada. La sesión queda en el navegador equivocado, el estudiante vuelve a la app y sigue sin sesión, y nadie entiende por qué. Un código que se escribe dentro de la app no tiene ese problema.

#### Tres restricciones técnicas verificadas

1. **El correo integrado de Supabase no sirve.** Manda 2 mensajes por hora y **solo a las direcciones del equipo del proyecto**. Un SMTP propio no es opcional.
2. **Con SMTP propio el límite arranca en 30 por hora** y se sube en la página de *Rate Limits*. Hay que subirlo antes de la matrícula, no durante.
3. **Cupo del SMTP gratuito.** Resend: 100 correos al día, 3 000 al mes. Brevo: 300 al día. En régimen normal el consumo es casi cero porque la sesión dura semanas, pero **la semana de estreno sí revienta el cupo**. Onboarding escalonado: un nivel por día.

#### Riesgo número uno del proyecto: que Exchange filtre el código

El MEP corre sobre Microsoft. Si el dominio remitente no tiene SPF, DKIM y DMARC bien configurados, Exchange Online manda el código a correo no deseado o lo descarta.

**Esta es la primera prueba que hay que hacer, en la Fase 0, con una dirección MEP real de un estudiante.** Si el código no llega a la bandeja de entrada, todo el esquema de autenticación cambia — y es infinitamente mejor saberlo el primer día que en la Fase 3 con la app a medio construir.

#### Reglas de la implementación

- `shouldCreateUser: false` — **nadie se auto-registra.** Solo pueden pedir código los correos que administración ya importó al padrón.
- Un hook de autenticación rechaza cualquier dominio que no sea el del MEP. **Confirmar el dominio exacto** mirando una dirección real de estudiante: el del personal y el estudiantil suelen ser distintos.
- Sesión larga (refresh token de 30 a 60 días) para que el estudiante entre una vez por periodo y no cada día. Esto es lo que mantiene el consumo de correos casi en cero.
- Respaldo para la cuenta MEP rota o inaccesible: un código de un solo uso emitido por administración, válido 24 horas y registrado en `auditoria`. **No agreguen contraseñas.**

#### Si algún día se abre la puerta del SSO

Empezar con código por correo no es un callejón sin salida: Supabase puede enlazar después una identidad de Entra a un usuario existente con el mismo correo, así que migrar a "Iniciar sesión con Microsoft" sería un cambio pequeño y sin tocar el padrón. Vale la pena que la dirección eleve la solicitud en paralelo, siempre que el proyecto no dependa de la respuesta.

### 4.6 Carnet digital y QR de verdad

Reemplazar la animación de píxeles por verificación real:

1. Al abrir el carnet, la app pide a una Edge Function un **token firmado** con `sub = estudiante.id`, `exp = ahora + 90s`.
2. Se pinta como QR con `qrcode.react`.
3. Quien valide (portería, comedor) escanea y abre una página pública que verifica la firma contra la llave pública y muestra ✅ nombre, foto, grupo y estado.
4. Como expira en 90 segundos, **un screenshot no sirve** — que es justo lo que hoy no se cumple.
5. Modo offline: guardar en IndexedDB un token de vigencia más larga (p. ej. 12 h) con un indicador visible de "modo sin conexión", y decidir con la institución si eso se acepta en portería.

### 4.7 Los límites reales del plan gratuito de Supabase

Hay que decirlos claro porque afectan el plan:

- **500 MB de base de datos** — de sobra: un colegio completo con horarios de todo el año son unos pocos MB.
- **50 000 usuarios activos al mes** — de sobra.
- **1 GB de storage** — alcanza para las fotos si se comprimen a ~50 KB (unas 20 000 fotos).
- **Se pausa el proyecto tras 1 semana de inactividad.** ⚠️ En vacaciones de fin de año la app se apaga sola. Se reactiva desde el panel, pero la app queda caída hasta que alguien lo note. **Mitigación:** un cron de GitHub Actions que haga una consulta trivial cada 2 días.
- **Sin respaldos automáticos.** ⚠️ **Mitigación obligatoria:** GitHub Actions diario que corra `pg_dump` y guarde el resultado cifrado como artefacto o en un repo privado. Esto no es opcional cuando se manejan datos de estudiantes.
- **Máximo 2 proyectos activos** — justo para producción + pruebas. Sin margen.

Si en algún momento el colegio puede pagar $25/mes, el plan Pro elimina la pausa y agrega respaldos automáticos. Vale la pena tenerlo como meta.

---

## 5. Estrategia híbrida con Google Sheets

Preguntaron si mantener Sheets o migrar. La respuesta es **las dos cosas, en este orden**:

### Fase A — Sheets sigue siendo la fuente, Postgres sirve la app

```
Google Sheet  ──(trigger onEdit / cron nocturno)──►  Edge Function  ──►  Postgres  ──►  App React
   (cocina y coordinación siguen editando ahí)          (con secreto)      (con RLS)
```

El Apps Script deja de ser un API público y pasa a ser un **emisor de sincronización**: hace `POST` a una Edge Function con un secreto compartido en el header. La app **nunca vuelve a hablarle a Apps Script**.

Ganancias inmediatas, sin pedirle nada nuevo al personal:
- Se acaba el `MOCK_MENUS` de 50 líneas en el cliente.
- Se acaba el `comedorSemanaActiva` manual — el menú se guarda por fecha.
- Se acaba la doble consulta de autocuración (`?semana=4` y después `?semana=Semana 4`).
- Se acaba el XSS: la Edge Function valida y sanea antes de escribir en la base.
- La app deja de depender de que Apps Script responda; si Google se cae, Postgres sigue sirviendo.

### Fase B — Panel admin y salida de Sheets

Cuando el panel admin esté listo y probado, se le enseña a coordinación y cocina, se corren ambos sistemas en paralelo unas semanas y se apaga la sincronización. **Mientras tanto no se pierde nada.** Si el personal nunca se adapta al panel, se puede quedar en la Fase A indefinidamente: sigue siendo una arquitectura correcta.

**Los datos de estudiantes nunca pasan por Sheets, en ninguna fase.** Se cargan con una importación de CSV desde el panel admin, con validación, directo a Postgres.

---

## 6. Hosting y despliegue

| | Cloudflare Pages ← recomendado | Netlify | Vercel Hobby | GitHub Pages |
|---|---|---|---|---|
| Costo | Gratis | Gratis | Gratis | Gratis |
| Ancho de banda | Sin límite práctico | 100 GB/mes | 100 GB/mes | Suave |
| **Uso institucional permitido** | **Sí** | Sí | **No — Hobby es solo uso personal no comercial** | Sí |
| Dominio propio + HTTPS | Sí | Sí | Sí | Sí |
| Previews por PR | Sí | Sí | Sí | No |

⚠️ **Vercel Hobby prohíbe explícitamente el uso comercial.** Antes esto era una zona gris; siendo Student HUB un producto con clientes, ya no lo es: sería un incumplimiento directo de los términos, con suspensión de la cuenta como resultado plausible. Cloudflare Pages hace lo mismo para un sitio estático y permite uso comercial.

**Y lo mismo aplica hacia arriba en el stack.** El plan gratuito de Supabase sí permite uso comercial, pero no tiene SLA, no tiene respaldos y se pausa a la semana de inactividad. Para un proyecto de colegio eso era un inconveniente; **para un producto con un cliente real es un pasivo.** En el momento en que el CTP dependa de la app para operar, los USD 25/mes del plan Pro dejan de ser un lujo y pasan a ser el costo mínimo de ser un proveedor serio. Conviene que el piloto ya contemple quién lo paga.

**CI/CD sugerido (GitHub Actions):** en cada PR → `lint` + `typecheck` + `test` + `build`; en `main` → deploy a Cloudflare Pages. Más dos crons: respaldo diario de la base y ping cada 2 días para que Supabase no se pause.

---

## 7. Cumplimiento legal — Ley 8968 (Costa Rica)

No es un trámite decorativo: van a tratar **datos personales de menores de edad**. Y como Student HUB es un producto propio y el colegio es un cliente piloto, la posición legal del equipo **no** es la de "unos estudiantes haciendo una herramienta para su propio colegio". Es más pesada, y conviene entenderla antes de la primera importación de padrón.

### 7.1 Quién es qué

- **El colegio es el responsable del tratamiento.** Es quien decide para qué se usan los datos de sus estudiantes.
- **Student HUB es el encargado del tratamiento.** Un tercero que procesa datos personales de menores **por cuenta** del colegio.

Esa distinción tiene una consecuencia práctica inmediata: **hace falta un contrato escrito** entre el colegio y ustedes antes de que un solo dato real entre a la base. No es burocracia, y no es solo para proteger al colegio — es lo que los protege a ustedes el día que algo salga mal, porque delimita hasta dónde llega su responsabilidad. Debe decir como mínimo:

- Qué datos se tratan y **para qué exactamente** (y que no se usan para nada más).
- Cuánto tiempo se conservan y qué pasa al terminar el piloto: **exportación al colegio y borrado**, con constancia.
- Qué medidas de seguridad se aplican (las del §4: RLS, cifrado, bitácora, respaldos).
- Que no hay subcontratación sin avisar — ojo, Supabase, Cloudflare y Brevo **son** subencargados y deben quedar nombrados.
- Quién responde ante los padres si alguien pide ver, corregir o borrar los datos de su hijo.

### 7.2 El consentimiento tiene que mencionarlos

La circular o cláusula de matrícula no puede decir solo "el colegio guarda estos datos". Tiene que decir que **un proveedor externo los procesa**, quién es y dónde se alojan. Un consentimiento que no menciona al tercero no cubre al tercero.

### 7.3 La exención de registro ante la PRODHAB se debilita con el segundo colegio

Mientras sea un piloto de uso interno de una institución, el argumento de exención se sostiene. **Pero el modelo de negocio lo cambia:** una base de datos de personas que se licencia o comercializa a varias instituciones se parece mucho más al supuesto que la ley sí obliga a registrar.

Recomendación concreta: **antes de firmar el segundo colegio, consulten a un abogado** sobre si corresponde inscribirse ante la PRODHAB. Con el primero pueden avanzar; con el segundo ya es un producto en el mercado y el costo de equivocarse sube. El arancel anual ronda los USD 200 — barato comparado con una sanción.

### 7.4 Lo que aplica en todos los casos
- **Consentimiento informado, expreso y libre.** Tratándose de menores, lo otorgan los padres o encargados. En la práctica: una circular o una cláusula en la matrícula que diga qué datos se guardan, para qué y por cuánto tiempo. Conviene coordinarlo con la dirección del colegio, no resolverlo desde el código.
- **Medidas técnicas y organizativas apropiadas al riesgo:** control de acceso (RLS), cifrado en tránsito (HTTPS) y en reposo (Supabase cifra el disco), y bitácora de accesos.
- **Registro ante la PRODHAB:** obligatorio para bases de datos que se *distribuyen, divulgan o comercializan*. Una base de uso estrictamente interno del colegio queda fuera de ese supuesto, **pero conviene que la dirección lo confirme** antes de salir a producción. Las obligaciones de consentimiento y seguridad aplican igual.
- **Minimización.** No guardar lo que no se usa. En concreto: **no guardar la cédula del estudiante** — usar un código interno. La app no necesita la cédula para nada.
- **Datos sensibles** (salud, discapacidad, situación socioeconómica, becas) tienen un estándar más alto. **Recomendación: no meterlos en la app.** Notas y asistencia también quedan fuera del alcance inicial — suben mucho el riesgo y no son el problema que Student HUB resuelve hoy.
- **Sanciones:** las infracciones graves van de 5 a 15 salarios base; las muy graves hasta 30. No es simbólico — y como encargados del tratamiento, ustedes también están dentro del alcance, no solo el colegio.

Hay una reforma pendiente (proyecto 23097) que alinearía la ley con el GDPR y agregaría notificación obligatoria de brechas y portabilidad. **Al mes de mayo de 2026 no estaba aprobada**, pero conviene diseñar como si fuera a aprobarse: si el sistema ya tiene bitácora, minimización y borrado de datos, la reforma no obliga a rehacer nada.

**Adicional recomendado:** una política de privacidad breve, en español claro, accesible desde la app, y un procedimiento escrito para cuando un estudiante se gradúa o se retira (¿se borra la ficha? ¿se archiva? ¿por cuánto tiempo?).

---

## 8. Roadmap sugerido

Estimaciones para trabajo de medio tiempo, equipo pequeño.

### Fase 0 — Preparación (3-5 días) · sin tocar la app actual
- [ ] Crear el proyecto de Supabase bajo la cuenta Student HUB, con la recuperación repartida en el equipo (ver §9.1).
- [ ] **Contrato de encargado del tratamiento firmado con el colegio antes de importar el primer padrón real** (§7.1). Con datos inventados se puede avanzar; con datos reales no.
- [ ] Definir el esquema y escribirlo como migraciones versionadas en el repo.
- [ ] Escribir y probar las políticas RLS **antes** de meter datos reales.
- [ ] Sacar `BASES_DE_DATOS.md` con IDs y URLs de despliegue del repositorio público → moverlo a un repo privado o al Drive del equipo.
- [ ] **Prueba go/no-go de correo:** configurar SMTP propio (Resend o Brevo) con SPF, DKIM y DMARC y verificar que un código de 6 dígitos llega a la **bandeja de entrada** de una cuenta MEP real. Si no llega, replantear el §4.5 antes de seguir.
- [ ] Confirmar el dominio exacto del correo estudiantil del MEP con una dirección real.
- [ ] Decidir con la dirección: consentimiento y política de retención.

### Fase 1 — Cimientos del frontend (1-2 semanas) · en paralelo, la app vieja sigue viva
- [ ] Nuevo proyecto Vite + React + TS en la rama `next` o en `apps/web/`.
- [ ] Tailwind v4 con el design system portado a `@theme`; verificar modo claro y oscuro contra la app actual.
- [ ] Rutas, layout, nav inferior, sidebar de escritorio, toggle de tema.
- [ ] `vite-plugin-pwa` con precaché.
- [ ] Portar **Comedor** primero: es la sección más simple y no tiene datos personales. Sirve para validar todo el camino Sheets → Edge Function → Postgres → React.

### Fase 2 — Datos públicos (1-2 semanas)
- [ ] Edge Function de sincronización + Apps Script convertido en emisor.
- [ ] Portar **Horarios** con TanStack Query.
- [ ] Portar **Noticias** (imágenes a Supabase Storage, bucket público).
- [ ] Tests de las funciones de fecha y agrupación por día.

### Fase 3 — Autenticación y datos personales (2-3 semanas) · la parte delicada
- [ ] Supabase Auth con código de 6 dígitos al correo MEP (`shouldCreateUser: false`), hook de dominio y guard de rutas.
- [ ] Subir el límite de envío de Supabase por encima de los 30/hora que trae por defecto.
- [ ] Importación de estudiantes por CSV desde el panel admin, con validación.
- [ ] Portar **Carnet** leyendo de la base, con foto en bucket privado y URL firmada.
- [ ] QR firmado + página pública de validación.
- [ ] Pruebas de RLS: intentar leer la ficha de otro estudiante y confirmar que falla.

### Fase 4 — Panel admin (2 semanas)
- [ ] CRUD de horarios, menús y noticias con roles.
- [ ] Bitácora de auditoría.
- [ ] Capacitación a coordinación y cocina; correr en paralelo con Sheets.

### Fase 5 — Endurecer y salir a producción (1 semana)
- [ ] Respaldo diario automático (`pg_dump` por GitHub Actions).
- [ ] Cron anti-pausa.
- [ ] Política de privacidad publicada y consentimientos recogidos.
- [ ] Piloto con un grupo real (11-2 ya está listo) antes de abrir a todo el colegio.
- [ ] Revisión de seguridad: probar los flujos de acceso con un usuario que no debería poder.

---

## 9. Decisiones que hay que tomar antes de escribir código

1. **¿Cuál es el dominio exacto del correo estudiantil del MEP?** El del personal y el estudiantil suelen diferir. Se confirma mirando una dirección real y de ahí sale la regla de dominio del §4.5.
2. **¿Llega el código a la bandeja de entrada de una cuenta MEP real?** Es la prueba de la Fase 0 y es *go / no-go* para todo el esquema de autenticación.
3. **¿A dónde apunta la recuperación de la cuenta Student HUB?** Ver §9.1 — está decidido a medias y es lo que hay que cerrar.
4. **¿Quién queda como responsable de datos** ante la dirección y ante la PRODHAB si alguien pregunta? La cuenta guarda las llaves; el responsable tiene que ser una persona.
5. **¿El repositorio se queda público?** Si sí, hay que sacar los IDs y URLs de `BASES_DE_DATOS.md` ya.
6. **¿La portería/comedor va a escanear el QR de verdad?** Si nadie lo va a escanear, el carnet debería decir que es solo informativo, no *"Escanea para validar"*.
7. **¿Entran notas y asistencia en el alcance?** Recomendación: no, todavía no.
8. **¿Qué pasa con la app actual mientras se migra?** Recomendación: se queda en producción sin cambios hasta que la nueva pase el piloto.

### 9.1 Titularidad de la infraestructura — decidido, con pendientes

**Decidido:** existe una cuenta **Student HUB exclusiva del proyecto**, y **el equipo es dueño del producto**. El colegio es la institución piloto, no la propietaria.

Esto **corrige una recomendación anterior de este documento**: la infraestructura *no* debe quedar a nombre del colegio — eso equivaldría a regalarle el producto al primer cliente.

Lo que sí hay que separar con claridad son dos cosas distintas:

| | Dueño | Qué implica |
|---|---|---|
| **El software** — código, marca, diseño, cuentas de infraestructura | Student HUB | Vive en el repositorio y la cuenta del equipo. El colegio no adquiere derechos sobre él por ser piloto. |
| **Los datos** — estudiantes, horarios, menús, fotos del CTP | El colegio | Se procesan por encargo. Se exportan y se borran cuando el colegio lo pida. |

Conviene que eso quede escrito en el contrato del §7. Es lo que evita la discusión incómoda del futuro: ni el colegio se queda con el producto, ni ustedes se quedan con los datos.

Sobre la cuenta en sí: es una credencial, no una titularidad. Lo que decide si sobrevive es a dónde apunta su recuperación.

- [ ] **La recuperación no puede depender de un solo celular.** Que apunte a algo que controle el equipo completo y que sobreviva a que alguien se gradúe, cambie de número o se moleste.
- [ ] **Códigos de respaldo del 2FA** en manos de al menos dos integrantes, y no en el mismo celular donde vive la app de autenticación.
- [ ] **Todo bajo esa misma cuenta:** Supabase, Cloudflare, Brevo y GitHub. Una sola llave que administrar.
- [ ] **Los respaldos no viven solo dentro de esa cuenta.** Si se pierde el acceso, no se pueden perder también los `pg_dump`. Al menos dos custodios independientes.
- [ ] **La contraseña en un gestor de contraseñas**, nunca en el repo ni en un grupo de WhatsApp.
- [ ] **Definir qué pasa si el equipo se separa.** Suena prematuro y es exactamente cuando hay que hablarlo: quién se queda con qué si tres personas construyeron esto y solo dos siguen. Una página basta, firmada mientras todos se llevan bien.

**Lo que la cuenta no resuelve:** ante la Ley 8968 el responsable del tratamiento sigue siendo el colegio y ustedes son el encargado (§7.1). Una cuenta guarda las llaves, no la responsabilidad — y del lado del colegio tiene que haber una persona nombrada que responda.

---

## 10. Qué **no** hacer

- **No reescribir todo de un solo golpe.** Sección por sección, empezando por Comedor.
- **No botar `styles.css`.** Se porta a `@theme`. El diseño es lo mejor que tiene el proyecto.
- **No poner datos de estudiantes en Google Sheets**, ni "temporalmente para probar". Los datos de prueba se inventan.
- **No confiar en que el frontend valide.** Toda regla de acceso vive en RLS. React solo decide qué se dibuja.
- **No usar Vercel Hobby** para una app institucional.
- **No guardar la cédula** si un código interno hace el trabajo.
- **No dejar la infraestructura amarrada a un solo integrante.**
- **No construir el esquema sin `institucion_id`.** El segundo colegio llega antes de lo que creen, y retrofitear multi-institución con datos reales adentro es brutal.
- **No importar el padrón real antes de tener el contrato firmado.** Para desarrollar y demostrar alcanzan datos inventados.
- **No prometer validación que no existe** — o el QR se hace de verdad, o el carnet se rotula como informativo.
- **No usar magic link** en vez de código de 6 dígitos: el navegador interno de Outlook rompe la sesión de la PWA.
- **No planear alrededor del SSO de Microsoft** mientras no exista el registro de aplicación en el tenant del MEP.

---

## Anexo — Fuentes consultadas

- [Vercel Hobby Plan (documentación oficial)](https://vercel.com/docs/plans/hobby) — límites y restricción de uso no comercial.
- [Supabase Pricing](https://supabase.com/pricing) — plan gratuito: 500 MB, 50 000 MAU, 5 GB egress, pausa tras 1 semana de inactividad, sin respaldos.
- [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/) — plan gratuito de Workers, Pages y D1.
- [Costa Rica Data Privacy Laws: Ley 8968 and PRODHAB Compliance Guide](https://www.recordinglaw.com/world-laws/world-data-privacy-laws/costa-rica-data-privacy-laws/) — obligaciones, registro, sanciones y estado del proyecto de reforma 23097.
