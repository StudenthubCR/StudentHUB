# 🧑‍🎓 Student HUB — Guía Completa de la Aplicación y Código

¡Bienvenido a la documentación técnica y funcional de **Student HUB**! Este proyecto es un portal estudiantil diseñado como una **Aplicación Web Progresiva (PWA)** y estructurado como una **Single Page Application (SPA)** para el Colegio Técnico Profesional (CTP).

Esta guía detalla de manera exhaustiva **todas las funciones** que componen la aplicación, su arquitectura, lógica en el cliente, caché offline, y la integración en tiempo real con Google Sheets.

---

## 📂 Arquitectura General del Proyecto

La aplicación se compone de tres capas integradas:
1. **Frontend Interactivo (SPA y CSS)**: Interfaz fluida basada en un único archivo HTML ([index.html](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/index.html)) con transiciones animadas y un sistema responsivo avanzado en [css/styles.css](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/css/styles.css).
2. **Cerebro en Cliente (JavaScript y PWA)**: Controlado por [js/script.js](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/js/script.js) (lógica de navegación, APIs y controladores), [js/config.js](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/js/config.js) (parámetros y endpoints) y [sw.js](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/sw.js) (Service Worker para soporte offline).
3. **Backend en la Nube (Google Sheets + Apps Script)**: Repositorios en la nube que actúan como bases de datos accesibles mediante APIs creadas con Google Apps Script ([apps-script/](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/apps-script)).

---

## 🧠 Lógica e Interacciones en el Cliente ([js/script.js](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/js/script.js))

`js/script.js` es el núcleo funcional en el navegador. A continuación se explican todas sus funciones y sistemas clave:

### 1. Sistema de Navegación SPA y Flujo del Historial
* **`switchSection(sectionId, pushToHistory = true)`**:
  * **Propósito**: Cambia la vista activa de la aplicación sin recargar la página.
  * **Funcionamiento**:
    1. Agrega la clase CSS `.hidden` y remueve `.active` de todas las secciones (`.page-section`).
    2. Identifica la sección de destino con `sectionId` y remueve su clase `.hidden`. Tras un retardo de `10ms` (necesario para asegurar que el navegador registre el cambio de estado del DOM), agrega la clase `.active`, lo que dispara una suave animación de entrada en CSS.
    3. Si el ID de destino es `'comedor'`, invoca automáticamente a la función `initComedor()`.
    4. Recorre las opciones del menú de navegación (`navItems`) para activar visualmente el botón correspondiente.
    5. Si `pushToHistory` es verdadero, agrega una nueva entrada en el historial del navegador mediante `history.pushState`, enlazando el hash de la URL (ej. `#comedor` o `#horarios`). Esto permite que los gestos de retroceso en celulares y el botón "Atrás" del navegador funcionen de forma nativa.
    6. Emite una micro-vibración de `10ms` a través de `navigator.vibrate(10)` (en dispositivos compatibles) para brindar feedback háptico premium.

* **Manejador del Evento `popstate`**:
  * **Propósito**: Sincroniza la interfaz cuando el usuario usa el botón "Atrás" o desliza para retroceder en su móvil.
  * **Funcionamiento**: Evalúa el estado del historial. Si el usuario estaba viendo el horario de un grado específico (`subView === 'schedule'`), vuelve a renderizar ese horario con `renderSchedule(grade, ..., false)`. De lo contrario, regresa a la sección general o al dashboard principal.

---

### 2. Modo Oscuro Dinámico
* **`setTheme(theme)`**:
  * **Propósito**: Aplica el tema de color visual (Claro/Oscuro).
  * **Funcionamiento**:
    1. Define el atributo `data-theme` en la etiqueta raíz `<html>` (ej. `<html data-theme="dark">`). Las variables en `css/styles.css` cambian automáticamente sus colores.
    2. Almacena la preferencia del usuario en el navegador con `localStorage.setItem('theme', theme)`.
    3. Oculta o muestra los iconos correspondientes (Sol para tema claro, Luna para tema oscuro) alternando la clase `.hidden` en los SVGs `#theme-toggle`.
* **Inicialización**: Al cargar la página, se lee `localStorage.getItem('theme')` (con un fallback predeterminado a `'light'`) para aplicar el tema guardado instantáneamente antes de que el usuario vea la pantalla.

---

### 3. Carrusel de Noticias Automático y Manual
* **`showSlide(index)`**:
  * **Propósito**: Alterna la visibilidad de los banners promocionales de eventos del CTP (Feria Científica, ExpoTécnica, etc.).
  * **Funcionamiento**: Desactiva el slide actual (`.carousel-slide.active`) y activa el slide correspondiente al nuevo `index`. Utiliza aritmética modular para crear una navegación circular infinita (`(index + slides.length) % slides.length`).
* **`nextSlide()` y `prevSlide()`**: Incrementan o decrementan el índice del slide actual.
* **`startAutoplay()` y `stopAutoplay()`**:
  * Inicia un temporizador (`setInterval`) que avanza las imágenes de forma autónoma cada **8 segundos**.
  * Cuando el usuario presiona las flechas manuales de navegación (`#carousel-next` o `#carousel-prev`), se detiene el intervalo automático y se vuelve a iniciar uno nuevo. Esto evita que el carrusel cambia abruptamente justo después de que el usuario interactúe manualmente.

---

### 4. Animación Interactiva del QR
* **Animador de Píxeles**:
  * **Propósito**: Simular un QR dinámico o activo para control de seguridad.
  * **Funcionamiento**: Ejecuta un bucle cada `1000ms` (`setInterval`) que selecciona todos los elementos `.qr-pixel` del carnet y altera aleatoriamente su opacidad (`style.opacity = Math.random() > 0.5 ? '1' : '0.3'`). Esto genera una animación orgánica simulando un refresco de código de seguridad.

---

### 5. Descarga y Almacenamiento Offline del Carnet
* **Acción de `#download-offline-btn`**:
  * **Propósito**: Simular la descarga y almacenamiento local seguro de la credencial del estudiante.
  * **Funcionamiento**:
    1. Deshabilita el botón y reemplaza su texto e icono por un spinner animado en CSS (`animate-spin`).
    2. Simula un retardo de `1.5` segundos (para representar un proceso de cifrado o firma local) y luego cambia el estilo del botón a verde, mostrando el mensaje **¡Guardado Offline!** e icono de checkmark (`✓`).
    3. Muestra una alerta informativa al estudiante confirmando que el carnet se ha asegurado en la caché de la aplicación para acceso sin conexión.
    4. Restablece el diseño original del botón después de `3` segundos.

---

### 6. Módulo de Horarios de Clases
Este módulo descarga, filtra y expone el horario de clases interactivo en tiempo real:

* **`normalizarDia(dia)`**: Remueve espacios en blanco, pasa todo a minúsculas y elimina tildes/diacríticos (ej. `'miércoles'` se convierte en `'miercoles'`) para evitar incompatibilidades de escritura en las celdas del Excel.
* **`indiceDia(dia)`**: Mapea un día normalizado con su orden real en la semana (`ORDEN_DIAS` de Lunes a Domingo) para asegurar que el horario nunca aparezca desordenado.
* **`parseHora(hora)`**: Divide cadenas como `"17:00 - 18:20"` en un objeto con horas de `inicio` y `fin`.
* **`fetchHorarios(grupo)`**:
  * **Propósito**: Obtiene los datos del horario desde el Apps Script de Google Sheets.
  * **Mecanismos Avanzados**:
    * **Caché en Memoria**: Guarda los resultados en un `Map` llamado `cacheHorarios`. Si el estudiante vuelve a tocar el mismo grupo, carga instantáneamente el horario sin hacer peticiones web redundantes.
    * **Tolerancia a Errores y Self-Healing**: Si la API no retorna datos específicos para el grupo solicitado (por fallos de formato o cambios de parámetros en el backend), realiza automáticamente una segunda consulta a la raíz de la API para descargar todo el horario, aplicando un filtrado en el cliente (`filtrarPorGrupo`) como plan de respaldo de autocuración.
* **`renderSchedule(grade, selectedCard, pushToHistory = true)`**:
  * Valida si el grado seleccionado cuenta con horarios cargados en la configuración.
  * Oculta el selector de grados, activa la vista de horario, y muestra un indicador de carga.
  * Ejecuta la consulta asíncrona de datos y delega a `renderFilasHorario` su renderizado.
* **`renderFilasHorario(filas)`**:
  * Limpia el listado anterior. Agrupa las clases por día de la semana y las descuenta/dibuja en orden.
  * Detecta si una fila corresponde a un bloque de descanso o almuerzo/cena (evaluando si la materia es `"cena"`) y le aplica la clase de diseño `.schedule-break`.
  * Configura un retardo progresivo mediante CSS inline (`style.animationDelay = '${delay * 0.08}s'`), logrando un efecto de cascada animada ultra-premium al renderizar cada tarjeta.

---

### 7. Módulo del Comedor Estudiantil (Cafeteria Menu)
Maneja la lógica del comedor de forma inteligente según la fecha actual:

* **`initComedor()`**:
  * **Detección de Fin de Semana**: Obtiene el día de la semana actual. Si es Sábado o Domingo, desactiva la recomendación de hoy mostrando **"Comedor Cerrado ☀️"** y avanza automáticamente el ciclo a la siguiente semana para que los estudiantes puedan planificar los almuerzos del próximo Lunes de manera anticipada.
  * **Ciclo de Semanas**: Student HUB funciona en un ciclo dinámico de 5 semanas preconfiguradas. Carga la semana correspondiente configurada en `StudentHubConfig.comedorSemanaActiva`.
  * **Mecanismo Multicapa Offline/Online**:
    1. **Consulta Online**: Intenta conectarse a la API del comedor (`comedorApiUrl`) consultando por la semana activa (`?semana=4`).
    2. **Self-Healing de Consulta**: Si el Apps Script requiere nombres completos en lugar de números planos (por ejemplo, el texto `"Semana 4"`), el script detecta que la respuesta es vacía e intenta automáticamente una segunda consulta formateada (`?semana=Semana 4`).
    3. **Respaldo Estático de Seguridad (`MOCK_MENUS`)**: Si no hay internet o el servidor de Google Sheets falla, el sistema captura el error de forma silenciosa y carga instantáneamente las tarjetas desde una base de datos local pre-cargada de las 5 semanas. La app **nunca se queda en blanco ni se cae**.
  * **Renderizado**:
    * Pinta el menú de toda la semana en la rejilla de tarjetas con efectos visuales y retrasos de animación progresivos.
    * Si es día hábil (Lunes a Viernes), selecciona el plato del día correspondiente y desglosa sus componentes en una tabla de desglose nutricional (Proteína, Acompañamiento, Bebida y Fruta) en el panel superior.

---

## 🛡️ Service Worker y Funcionamiento Offline ([sw.js](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/sw.js))

El archivo [sw.js](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/sw.js) actúa como un proxy de red en segundo plano y dota a la aplicación de características PWA:

1. **Pre-caché de Recursos Base (`ASSETS_TO_CACHE`)**:
   * En el evento `'install'`, descarga y almacena de forma local los archivos críticos: `index.html`, `css/styles.css`, `js/script.js`, `js/config.js`, el manifiesto y todas las imágenes locales.
2. **Estrategia de Caché: *Stale-While-Revalidate***:
   * Cuando la app solicita un recurso local o recursos externos como Google Fonts:
     * **Fase 1 (Inmediata)**: Retorna instantáneamente la copia en caché (si existe) para lograr que la aplicación cargue en milisegundos, incluso en redes 2G o sin conexión.
     * **Fase 2 (Segundo plano)**: Lanza una petición de red en segundo plano. Si tiene éxito y hay internet, actualiza la copia del caché de forma silenciosa para que la próxima vez que se abra la app, cuente con la última versión.
3. **Gestión de Versiones y Limpieza de Caché**:
   * Al actualizar la aplicación, cambiamos la variable `CACHE_NAME` (ej. de `studenthub-cache-v18` a `studenthub-cache-v19`).
   * En el evento `'activate'`, el Service Worker detecta si hay cachés guardados con nombres antiguos y los elimina programáticamente para liberar memoria y evitar conflictos de código viejo.

---

## ⚙️ Archivo de Ajustes Globales ([js/config.js](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/js/config.js))

Permite a los administradores o profesores cambiar las conexiones y configuraciones principales sin tocar la lógica de programación compleja:

```javascript
const StudentHubConfig = {
    // Endpoints del Apps Script para extraer datos reales de Google Sheets
    horariosApiUrl: 'https://script.google.com/.../exec',
    comedorApiUrl:  'https://script.google.com/.../exec',

    // Define cuál de las 5 semanas del comedor escolar está activa actualmente
    comedorSemanaActiva: 4,

    // Configuración para simular o buscar datos del prototipo en base a grados
    estudianteGrupo: '11-2',
    gradoConHorario: '11vo',
    grupoPorGrado: {
        '11vo': '11-2'
    }
};
```

---

## ☁️ Backend en la Nube (Google Sheets)

El backend de Student HUB se aloja en hojas de cálculo de Google Sheets, lo que permite que el personal administrativo actualice los horarios y los platos del menú directamente desde una interfaz amigable.

### 📅 Script de Horarios ([apps-script/horarios.gs](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/apps-script/horarios.gs))
* Lee las columnas: **Grupo**, **Día**, **Hora** y **Materia** de la pestaña "Horarios".
* Método `doGet(e)`:
  * Si la solicitud incluye un parámetro `grupo` (ej. `?grupo=11-2`), filtra las filas y retorna únicamente las clases correspondientes.
  * Convierte los datos a un JSON estructurado y los sirve con las cabeceras CORS activas (`Content-Type: application/json`) para que el frontend pueda consumirlos desde cualquier dominio.

### 🍲 Script de Comedor ([apps-script/comedor.gs](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/apps-script/comedor.gs))
* Lee las columnas: **Plato Principal**, **Arroz**, **Frijoles**, **Ensalada**, **Aderezo**, **Fruta** y **Bebida** de la hoja según la semana indicada.
* **Procesamiento de datos**:
  * Junta programáticamente el arroz, los frijoles y la ensalada de la fila en un único texto ordenado llamado `acompanamiento` para simplificar el despliegue visual de la app.
  * Mapea la columna fruta al campo `postre` y devuelve el menú estructurado por días en formato JSON.

---

## 🛠️ Desarrollo Local e Instrucciones de Mantenimiento

1. **Instalación y Pruebas**:
   * Descarga o clona este repositorio en tu ordenador.
   * Ejecuta un servidor local en el directorio raíz (por ejemplo, usando la extensión **Live Server** de Visual Studio Code o ejecutando `npx serve .` en la consola). Esto es **obligatorio** ya que los Service Workers no pueden registrarse utilizando el protocolo `file://` (abriendo el HTML con doble clic).
2. **Cómo Forzar Actualizaciones de Código (Caché)**:
   * Dado que el Service Worker almacena la web en la memoria del celular, los cambios de HTML o CSS no se verán inmediatamente en los teléfonos de los estudiantes.
   * **Para solucionarlo**:
     1. Edita el archivo [sw.js](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/sw.js) e incrementa la constante `CACHE_NAME` (ej. `studenthub-cache-v19`).
     2. En tu navegador de pruebas, presiona `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac) para forzar la recarga limpia.
