# Student HUB

Portal estudiantil (PWA) — prototipo CTP.

## Bases de datos del equipo

**Todas las URLs, el Google Sheet y la API están documentadas aquí:**

→ **[BASES_DE_DATOS.md](./BASES_DE_DATOS.md)**

La app lee los horarios desde `js/config.js` (`horariosApiUrl`). No depender de enlaces guardados solo en cuentas personales; usar el repositorio compartido.

## Ejecutar en local

Abrir `index.html` en el navegador (o Live Server). Requiere internet para cargar horarios.

## Estructura

- `index.html` — interfaz
- `js/config.js` — URLs y grupo del prototipo
- `js/script.js` — lógica
- `apps-script/horarios.gs` — backend (copiar a Google Apps Script)
