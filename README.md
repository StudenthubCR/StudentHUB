<div align="center">

  <img src="assets/SHlarge.webp" alt="Student HUB Logo" width="220" />

  # Student HUB

  **Portal Estudiantil y Carnet Digital de Próxima Generación para Colegios Técnicos Profesionales**

  [![React](https://img.shields.io/badge/React-19.2-blue?logo=react&logoColor=white)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%2B_RLS-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
  [![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers_%26_Pages-F38020?logo=cloudflare&logoColor=white)](https://cloudflare.com/)
  [![PWA](https://img.shields.io/badge/PWA-Workbox_%26_Offline--First-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
  [![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

  <p align="center">
    <a href="#-visión-general">Visión General</a> •
    <a href="#-características-destacadas">Características</a> •
    <a href="#-arquitectura-técnica">Arquitectura</a> •
    <a href="#-estructura-del-repositorio">Estructura</a> •
    <a href="#-guía-de-desarrollo-local">Instalación</a> •
    <a href="#-seguridad-y-privacidad">Seguridad</a> •
    <a href="#-despliegue">Despliegue</a>
  </p>

</div>

---

## 📌 Visión General

**Student HUB** es una **Aplicación Web Progresiva (PWA)** de alto rendimiento concebida para modernizar la comunicación institucional, la identidad estudiantil y el acceso a servicios cotidianos en Colegios Técnicos Profesionales (CTP).

Tradicionalmente, los estudiantes y docentes se enfrentan a canales dispersos: carnets plásticos costosos y fáciles de extraviar, menús del comedor compartidos en fotografías borrosas por mensajería, horarios en hojas de cálculo estáticas difíciles de navegar en teléfonos móviles y avisos de ausencias docentes que no llegan a tiempo.

**Student HUB unifica todo este ecosistema en una única plataforma web accesible desde cualquier dispositivo, con funcionamiento sin conexión (offline), autenticación institucional segura y una estética visual premium inspirada en aplicaciones móviles nativas.**

---

## ✨ Características Destacadas

### 🪪 1. Carnet Digital Estudiantil Inteligente
- **Identidad Verificada**: Credencial personalizada con fotografía, datos oficiales del estudiante, nivel académico, sección y especialidad técnica.
- **Paleta por Especialidad**: La interfaz adapta automáticamente sus acentos visuales al color insignia de cada especialidad técnica (Informática, Contabilidad, Electrotecnia, etc.).
- **Código QR Dinámico**: Mecanismo de validación visual e interactivo diseñado para el control de acceso en portón, biblioteca y comedor escolar.
- **Modo Offline & Descarga**: Persistencia local segura de la credencial en el almacenamiento del dispositivo para visualización garantizada aun sin conexión a internet.
- **Modo Impresión**: Estilos optimizados para exportación directa a PDF o impresión física con proporciones exactas de tarjeta de identificación.

### 🍲 2. Comedor Estudiantil en Tiempo Real
- **Cálculo Automático de Menú**: Ciclo dinámico de 5 semanas sincronizado por fecha de calendario; nunca requiere intervención manual para alternar semanas.
- **Desglose Nutricional Completo**: Visualización clara del plato del día con proteína, acompañamientos, ensaladas, bebidas y fruta recomendada.
- **Caché Inteligente con Stale-While-Revalidate**: El menú se carga de inmediato desde el almacenamiento del navegador mientras se valida silenciosamente si la institución publicó alguna actualización.

### 📅 3. Horarios Académicos Dinámicos
- **Cobertura de 7° a 12° Año**: Selector responsivo organizado por nivel académico y grupos técnicos.
- **Soporte para Turnos Diurno y Nocturno**: Detección inteligente de horarios extendidos para educación técnica diurna y modalidades nocturnas.
- **Detección de Recesos**: Reconocimiento visual de pausas para almuerzo, cena y descansos entre bloques de clase.
- **Tolerancia a Fallos & Autocuración**: Si la red falla o la consulta específica de un grupo devuelve vacío, el cliente consulta la caché institucional y filtra localmente de forma transparente.

### 📝 4. Agenda Escolar & Alertas Tempranas
- **Gestor de Tareas y Exámenes**: Organización cronológica de evaluaciones con cálculo de porcentaje y días restantes ("Hoy", "Mañana", "En 3 días").
- **Avisos de Ausencia Docente**: Notificaciones destacadas de profesores ausentes para optimizar los traslados y el tiempo de los estudiantes en el colegio.
- **Notificaciones del Sistema**: Integración con la Notification API nativa del navegador para recordatorios locales instantáneos.

### 🏆 5. Modo Evaluador ExpoTÉCNICA / STEAM 2026
- **Flujo de Demostración para Jueces**: Vista interactiva diseñada específicamente para comités evaluadores, permitiendo alternar instantáneamente entre distintos perfiles de prueba (estudiantes de diversas especialidades, grados diurnos y nocturnos) sin requerir inicio de sesión previo.

### 🌓 6. Experiencia de Usuario de Primer Nivel
- **Tema Oscuro Dinámico**: Transición fluida entre modo claro y modo oscuro profundo con persistencia en `localStorage`.
- **Navegación Móvil Nativa**: Barra inferior fija (*Bottom Navigation Bar*) en pantallas móviles y barra lateral expansiva (*Sidebar*) en tabletas y escritorios (≥1024px).
- **Feedback Háptico y Micro-animaciones**: Respuesta táctil sutil en móviles compatibles y transiciones fluidas motorizadas por **Motion** e **Iconimate**.

---

## 🏗 Arquitectura Técnica

Student HUB implementa una **arquitectura híbrida inteligente**, dividiendo estrictamente los datos entre información pública no sensible y datos personales protegidos:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE PWA                               │
│        Vite + React 19 + TypeScript + Tailwind CSS v4 + Motion         │
│          Service Worker (Workbox) · Caché Offline · Mobile UX          │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   │ (Datos Públicos)                │ (Datos Personales)
                   ▼                                 ▼
┌─────────────────────────────────────┐   ┌──────────────────────────────┐
│       Google Sheets & Script        │   │    Supabase (PostgreSQL)     │
│   • Menús semanales de comedor      │   │   • Padrón institucional     │
│   • Horarios públicos por grupo     │   │   • Carnets y perfiles       │
│   • Stale-While-Revalidate          │   │   • Auth con OTP al MEP      │
│   • Editado fácilmente por personal │   │   • Row Level Security (RLS) │
└─────────────────────────────────────┘   └──────────────────────────────┘
```

### ¿Por qué esta arquitectura?
1. **Google Sheets para Comedor y Horarios**: Permite que el personal docente y de comedor actualice los menús y horarios directamente en una hoja de cálculo cotidiana de Google, sin requerir acceso a paneles de administración complejos ni riesgo de comprometer datos del sistema.
2. **Supabase (PostgreSQL + RLS) para Identidad**: Toda información personal del estudiante (nombre, identificación, especialidad, foto, carnet) vive bajo estrictas políticas de **Row Level Security (RLS)**. Ningún usuario puede consultar información de otro estudiante.
3. **Autenticación sin fricción con Correo MEP**: Se utiliza un código numérico temporal (OTP) enviado al correo institucional `@mep.go.cr` (Office 365). No requiere contraseñas vulnerables ni configuraciones complejas de Azure Active Directory en el tenant ministerial.

---

## 📁 Estructura del Repositorio

El proyecto está organizado en un monorepo ligero y limpio:

```text
StudentHUB/
├── apps/
│   └── web/                     # Aplicación SPA / PWA principal
│       ├── src/
│       │   ├── app/             # Router, layouts, páginas de error y 404
│       │   ├── components/      # Componentes UI compartidos e Iconimate
│       │   ├── features/        # Módulos por dominio de negocio:
│       │   │   ├── agenda/      # Tareas, exámenes y ausencias de profesores
│       │   │   ├── auth/        # Inicio de sesión con OTP institucional
│       │   │   ├── carnet/      # Generación, render y validación de carnet
│       │   │   ├── comedor/     # Lógica de menús cíclicos y API de Sheets
│       │   │   ├── dashboard/   # Pantalla principal, banners y accesos rápidos
│       │   │   ├── estudiante/  # Contexto de datos y perfil de estudiante
│       │   │   ├── expo/        # Módulo de evaluación para jueces de Expo
│       │   │   ├── horarios/    # Visualizador de horarios diurnos/nocturnos
│       │   │   ├── notificaciones/ # Modal y servicio de notificaciones Push
│       │   │   └── pwa/         # Controladores de instalación y actualización
│       │   ├── lib/             # Cliente de Supabase, configuración y utilidades
│       │   ├── styles/          # Tokens de diseño y tema Tailwind CSS v4
│       │   └── main.tsx         # Punto de entrada de la aplicación
│       ├── scripts/             # Script de optimización de imágenes (Sharp)
│       ├── wrangler.jsonc       # Configuración de despliegue en Cloudflare Workers
│       ├── vite.config.ts       # Configuración de Vite, PWA, Workbox y Vitest
│       └── package.json         # Dependencias y scripts del frontend
│
├── apps-script/                 # Backends de Google Apps Script (APIs públicas)
│   ├── comedor.gs               # API de extracción del menú escolar
│   └── horarios.gs              # API de lectura de horarios por grupo
│
├── supabase/                    # Infraestructura de base de datos
│   ├── functions/               # Edge Functions de Deno (ej. envío de correo auth)
│   ├── importar_estudiantes.sql # Script de carga de padrón de estudiantes
│   ├── proteger_padron.sql      # Definición de políticas RLS y roles
│   └── reparar_acceso_estudiantes.sql # Procedimientos de auto-reparación
│
├── assets/                      # Recursos gráficos globales (WebP optimizado e íconos)
├── BASES_DE_DATOS.md            # Documentación de esquemas y contratos de datos
├── PLAN_MODERNIZACION.md        # Bitácora estratégica de modernización
└── README.md                    # Documentación principal del proyecto
```

---

## 🚀 Guía de Desarrollo Local

### Prerrequisitos
- **Node.js**: Versión `20.x` o superior (se incluye `.nvmrc`).
- **npm**: Versión `10.x` o superior.

### 1. Clonar el Repositorio
```bash
git clone https://github.com/StudenthubCR/StudentHUB.git
cd StudentHUB
```

### 2. Instalar Dependencias
Entra al directorio de la aplicación web e instala los paquetes:
```bash
cd apps/web
npm install
```

### 3. Configurar Variables de Entorno (Opcional)
La aplicación cuenta con valores por defecto preconfigurados para desarrollo inmediato. Si deseas conectar tus propias instancias de Supabase o Google Apps Script, crea un archivo `.env` dentro de `apps/web/`:

```env
# Google Apps Script Endpoints
VITE_COMEDOR_API_URL="https://script.google.com/macros/s/TU_SCRIPT_ID/exec"
VITE_HORARIOS_API_URL="https://script.google.com/macros/s/TU_SCRIPT_ID/exec"

# Supabase Credentials
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="tu-clave-publicable"
```

### 4. Levantar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible inmediatamente en:  
👉 **`http://localhost:5173/`**

---

## 🧪 Pruebas y Control de Calidad

El proyecto cuenta con una suite completa de pruebas unitarias y de integración construida con **Vitest**:

```bash
# Ejecutar todas las pruebas una vez
npm run test

# Ejecutar pruebas en modo observador (watch)
npm run test:watch
```

### Compilación y Verificación de Tipos
Para validar la integridad del código TypeScript y empaquetar para producción:
```bash
npm run build
```

### Optimización de Imágenes
Para regenerar automáticamente las versiones WebP y los íconos de la PWA desde la carpeta `assets/`:
```bash
npm run optimizar-imagenes
```

---

## 🔒 Seguridad y Privacidad

En cumplimiento con la legislación de protección de datos personales de menores (Ley N° 8968 / PRODHAB de Costa Rica) y las normativas del Ministerio de Educación Pública (MEP):

1. **Aislamiento por Fila (RLS)**: En PostgreSQL/Supabase, cada estudiante solo tiene autorización para consultar su propia credencial y datos académicos.
2. **Cero Datos Sensibles en Hojas Públicas**: La base de datos de Google Sheets almacena exclusivamente horarios institucionales y nombres de comidas; nunca almacena nombres, identificaciones ni registros estudiantiles.
3. **Sin Uso de Contraseñas Fijas**: El flujo OTP de 6 dígitos al correo institucional erradica ataques de fuerza bruta y previene que los estudiantes reutilicen contraseñas vulnerables.
4. **Encargado del Tratamiento**: El centro educativo mantiene en todo momento la titularidad de los datos institucionales; Student HUB actúa bajo el principio de encargo de procesamiento técnico.

---

## 🌐 Despliegue en Producción

La aplicación está optimizada para desplegarse como un sitio estático de borde (*Edge Static Asset Worker*) en **Cloudflare Workers**:

```bash
cd apps/web
npx wrangler deploy
```

La regla `single-page-application` en `wrangler.jsonc` garantiza que el enrutamiento del lado del cliente de React Router funcione de manera transparente sin generar errores 404 al recargar páginas secundarias como `/comedor` o `/carnet`.

---

## 👥 Equipo y Reconocimientos

- **Proyecto**: Student HUB
- **Ámbito**: Educación Técnica Profesional y Desafío STEAM 2026.
- **Institución Piloto**: Colegio Técnico Profesional (CTP).

---

<div align="center">
  <small>Desarrollado con dedicación para transformar la vida estudiantil técnica costarricense 🇨🇷</small>
</div>
