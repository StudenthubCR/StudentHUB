# Bases de datos — Student HUB (equipo)

Documento oficial del proyecto. **No guardar solo en cuentas personales**; usar este repositorio.

---

## 1. Horarios (activo en la app)

| Recurso | Enlace / valor |
|--------|----------------|
| **Google Sheet** | https://docs.google.com/spreadsheets/d/1Qm2sW_y5dL7KokhKjCUJ7hPFDnFzgoJP3oeZlCXYMXo/edit |
| **ID del libro** | `1Qm2sW_y5dL7KokhKjCUJ7hPFDnFzgoJP3oeZlCXYMXo` |
| **Pestaña** | `Horarios` |
| **Columnas** | A=Grupo, B=Día, C=Hora, D=Materia |
| **Grupo prototipo** | `11-2` (texto plano en columna A, no fecha) |
| **API (Apps Script)** | https://script.google.com/macros/s/AKfycbxcjXuPs80KsshkCACYPZdOXQmuPY5tg-ThNmcWZ_9_YyOIEkOgb4oMdNlTOYixbfqz/exec |
| **Filtro por grupo** | `.../exec?grupo=11-2` |
| **Código backend** | `apps-script/horarios.gs` |
| **Config en la app** | `js/config.js` → `horariosApiUrl` |

### Probar la API

Abrir en el navegador la URL de la API. Debe verse JSON con `"grupo":"11-2"`, no un mensaje `error`.

---

## 2. Dónde lo usa la app

- **URL de la API:** `js/config.js` → `StudentHubConfig.horariosApiUrl`
- **Grupo del prototipo:** `estudianteGrupo: '11-2'`
- **Botón 11°:** `index.html` → `data-grupo="11-2"`
- **Lógica de carga:** `js/script.js` → `fetchHorarios()`

Si cambian el despliegue de Apps Script, actualizar **solo** `horariosApiUrl` en `js/config.js` y subir el cambio a GitHub.

---

## 3. Cómo editar horarios

1. Abrir el **Google Sheet** (enlace arriba).
2. Editar filas en **Horarios** (fila 1 = encabezados).
3. Guardar — la app lee los cambios al recargar (Ctrl+F5).

Para cambiar el script: **Extensiones → Apps Script** en esa misma hoja → pegar `apps-script/horarios.gs` → **Implementar → Nueva implementación**.

---

## 4. Próximas bases (aún no conectadas)

| Módulo | Estado | Notas |
|--------|--------|--------|
| Estudiantes / Carnet | Pendiente | Datos fijos en `index.html` |
| Noticias (carrusel) | Pendiente | Imágenes en `assets/` |
| Comedor | Pendiente | Placeholder en la app |

Cuando existan, agregar filas aquí y las URLs en `js/config.js`.

---

## 5. Permisos recomendados

- Sheet y Apps Script: cuenta del **equipo** o colegio, con acceso de edición para quienes mantienen datos.
- Despliegue web: **Cualquier persona** (solo lectura vía API).

---

*Última API verificada: grupo 11-2, ~29 bloques horarios (Lunes–Viernes).*
