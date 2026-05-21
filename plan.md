# Plan de Implementación: EduConnect CTP

## 1. Concepto y Diseño
EduConnect CTP es una aplicación web progresiva (estilo SPA) diseñada para estudiantes de Colegios Técnicos Profesionales. La interfaz seguirá una estética de aplicación móvil nativa con navegación inferior.

### Paleta de Colores (Institucionales)
- **Color Primario**: `#6c2428` (Borgoña Elegante)
- **Color Secundario**: `#ffffff` (Blanco Puro)
- **Fondo**: `#f8f9fa` (Gris muy claro para contraste)
- **Texto Oscuro**: `#1a1a1a`

### Tipografía
- **Fuente**: 'Poppins' (Google Fonts) para un aspecto moderno y legible.

---

## 2. Estructura de Archivos
- `index.html`: Estructura semántica única (SPA).
- `css/styles.css`: Estilos modernos, Flexbox/Grid, Media Queries.
- `js/script.js`: Lógica de navegación y manejo de estados.

---

## 3. Secciones de la App
1. **Dashboard (Inicio)**: Bienvenida personalizada, banner de noticias y acceso a servicios rápidos.
2. **Carnet Digital**: Tarjeta de identificación con foto, datos del estudiante y código QR.
3. **Expediente Académico**: Centro de estadísticas (Asistencia y Promedio) y lista de materias.
4. **Servicios Rápidos**: Acceso directo a Comedor, Carnet y Asistencia desde el Inicio.

---

## 4. Funcionalidades Técnicas
- [x] Mover **Promedio General** de Dashboard a la sección de **Expediente**.
- [x] Ajustar el **Carrusel de Noticias** como banner principal en el Dashboard.
- [x] Implementar **Modo Oscuro** con persistencia en el navegador.
- **Navegación SPA**: Cambio de secciones mediante manipulación del DOM (clases `active`/`hidden`).
- **Modo Oscuro**: Implementación de temas dinámicos con persistencia en localStorage.
- **Diseño Responsivo**: Adaptación total a móviles y tablets.
- **Interacciones**: Efectos hover en botones y transiciones suaves entre secciones.

---

## 5. Referencias Visuales
- Bordes redondeados (`border-radius: 15px`).
- Sombras suaves (`box-shadow: 0 4px 15px rgba(0,0,0,0.1)`).
- Iconos: FontAwesome o similares (se usarán SVG para evitar dependencias pesadas).
