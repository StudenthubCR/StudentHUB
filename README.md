# 🧑‍🎓 Student HUB — Guía del Código y Repositorio

¡Bienvenido a la documentación de **Student HUB**! Este es el portal estudiantil en formato de Aplicación Web Progresiva (PWA) diseñado para el CTP.

Esta guía está redactada de forma **sencilla y directa** para que cualquier miembro del equipo o evaluador pueda entender exactamente qué hace cada archivo en el proyecto, dónde meter mano si hay que hacer cambios, y cómo funciona la magia por detrás.

---

## 📂 Estructura General del Proyecto

El proyecto se divide en tres capas muy fáciles de comprender:
1. **La Estructura y Estética (HTML y CSS)**: Lo que el estudiante ve en la pantalla de su laptop o celular.
2. **La Inteligencia Local (JavaScript)**: Lo que hace que los botones funcionen, la navegación cambie sin recargar la página (SPA), y que la app funcione sin internet (PWA).
3. **La Nube (Google Sheets + Apps Script)**: Dónde guardamos los datos reales del menú del comedor y de los horarios para que los profesores puedan editarlos fácilmente desde Excel sin saber programar.

---

## 🏛️ 1. El Esqueleto y el Diseño (Frontend)

### 📄 [index.html](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/index.html)
* **¿Qué es?**: Es el esqueleto de la aplicación. Contiene todos los textos, iconos, botones y secciones de la web.
* **¿Qué hace de forma simple?**: 
  * Organiza las 4 páginas de la aplicación en una sola hoja ("Single Page Application" o SPA): el **Inicio (Dashboard)**, el **Carnet Digital**, los **Horarios** y el **Comedor**.
  * Al inicio, solo la sección de Inicio está visible (`.active`), y las demás están ocultas (`.hidden`). JavaScript se encarga de intercambiarlas cuando tocas un botón.
  * Define la barra de navegación superior (con el logo y el botón de Modo Oscuro) y la barra inferior que en pantallas grandes se transforma automáticamente en un elegante menú lateral.

### 🎨 [css/styles.css](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/css/styles.css)
* **¿Qué es?**: Es la "ropa y la pintura" de la aplicación.
* **¿Qué hace de forma simple?**:
  * **Diseño Adaptable (Responsivo)**: Usa sistemas modernos como CSS Flexbox y CSS Grid. En celulares, el menú se muestra abajo; pero si detecta una pantalla de tablet o laptop (`>=768px`), mueve automáticamente el menú a la izquierda como una barra lateral y expande el contenido a la derecha de forma majestuosa.
  * **Modo Oscuro**: Controla los colores claros y oscuros usando variables CSS (tokens). Si el atributo `data-theme="dark"` se activa en la página, todo el sitio cambia de colores al instante de forma suave.
  * **Animaciones Premium**: Controla el giro de carga (`spin`), el parpadeo del QR, el pulso del carnet activo, y el deslizamiento de las tarjetas al cambiar de sección.
  * **Estilos de Impresión (`@media print`)**: Si el estudiante toca "Imprimir Credencial", este archivo le dice al navegador que esconda toda la página web e imprima únicamente el Carnet Digital físico perfectamente centrado y en alta calidad.

---

## 🧠 2. El Cerebro de la App (JavaScript y PWA)

### ⚙️ [js/config.js](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/js/config.js)
* **¿Qué es?**: La caja de ajustes de la aplicación.
* **¿Qué hace de forma simple?**:
  * Es el archivo más importante para el equipo que administra los datos. Aquí se guardan las URLs de las bases de datos en la nube sin mezclar con el código difícil de la app.
  * Contiene la variable `horariosApiUrl` (la URL del Apps Script de horarios) y `comedorApiUrl` (la URL del Apps Script de comedor).
  * También define cuál es la semana lectiva actual del colegio (ej. `comedorSemanaActiva: 4`) y qué grado tiene horarios disponibles en el prototipo (`gradoConHorario: '11vo'`).

### 🕹️ [js/script.js](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/js/script.js)
* **¿Qué es?**: La lógica interactiva de la app (el motor que mueve las piezas).
* **¿Qué hace de forma simple?**:
  * **Navegación SPA**: Escucha cuando haces clic en "Carnet", "Horarios" o "Comedor", oculta la sección anterior agregando la clase `.hidden` y muestra la nueva agregando la clase `.active`, todo al instante y sin recargar la pantalla.
  * **Modo Oscuro**: Al hacer clic en el sol/luna, cambia el tema y guarda tu preferencia en la memoria del navegador (`localStorage`) para que al volver a abrir la app al día siguiente se mantenga como te gusta.
  * **Noticias**: Mueve el carrusel de imágenes del inicio automáticamente cada 8 segundos o de forma manual al tocar las flechitas.
  * **Horarios Dinámicos**: Conecta con Google Sheets, descarga las clases del grupo `11-2`, las agrupa por días de lunes a viernes en orden cronológico y las dibuja en pantalla con una animación secuencial muy premium.
  * **Comedor Inteligente**: 
    * Detecta de forma automática qué día de la semana es.
    * Si es fin de semana (sábado o domingo), apaga el plato recomendado de hoy ("Comedor Cerrado ☀️") y avanza automáticamente a la semana siguiente (si la activa es la 4, carga la 5).
    * Descarga los datos reales de tu Google Sheet. Tiene un **sistema de auto-recuperación (self-healing)**: si falla la consulta normal por formato, intenta buscar la palabra `"Semana "` en automático para que nunca falle.
    * Si no hay internet, tiene cargado un menú de respaldo offline de las 5 semanas para que la app nunca se quede en blanco.

### 🛡️ [sw.js](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/sw.js) (Service Worker)
* **¿Qué es?**: El asistente invisible que trabaja en segundo plano.
* **¿Qué hace de forma simple?**:
  * Hace que Student HUB sea una **PWA (Progressive Web App)**, permitiendo que los estudiantes la "instalen" en su celular o pantalla de inicio de la computadora.
  * Guarda en una memoria caché local todos los archivos base (`index.html`, `styles.css`, `script.js` e imágenes del carrusel).
  * Si abres la app en el pasillo del colegio donde no hay señal de internet, el Service Worker intercepta la petición, saca los archivos del caché local y **te muestra la aplicación al instante, incluyendo tu Carnet Digital offline**.
  * Al actualizar la app en GitHub, aumentamos el número de versión (ej. `studenthub-cache-v18`) para que borre el caché viejo de los celulares de los alumnos y les descargue la última actualización en automático.

---

## ☁️ 3. El Motor en la Nube (Google Sheets Backend)

Estos dos archivos **no se ejecutan en la computadora del estudiante**, sino dentro de los servidores de Google al conectar tu Excel con la aplicación:

### 📅 [apps-script/horarios.gs](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/apps-script/horarios.gs)
* **¿Qué es?**: El despachador de horarios en la nube.
* **¿Qué hace de forma simple?**:
  * Se pega dentro de **Extensiones ➡️ Apps Script** en la hoja de Excel de Horarios.
  * Al ser consultado por la aplicación, entra a la pestaña "Horarios", lee las columnas de Grupo, Día, Hora y Materia, filtra únicamente las clases del grupo solicitado (ej. `11-2`) y se las entrega a la app ordenadas en un formato ligero y veloz (JSON).

### 🍲 [apps-script/comedor.gs](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/apps-script/comedor.gs)
* **¿Qué es?**: El despachador gastronómico en la nube.
* **¿Qué hace de forma simple?**:
  * Se pega en el Apps Script del Excel del Comedor (`menu_db.xlsx`).
  * Recibe la semana solicitada (ej. `5`) y lee las columnas de Plato Principal, Arroz, Frijoles, Ensalada, Aderezo, Fruta y Bebida.
  * **Une las piezas**: Agarra el arroz, los frijoles y la ensalada de esa fila y los combina programáticamente en un solo texto limpio llamado "Acompañamiento".
  * Mapea la columna "Fruta" de forma elegante y limpia y le envía de vuelta a la aplicación el menú completo del comedor escolar listo para pintar.

---

## 🛠️ Cómo Probar en Local
1. Abre este repositorio en tu computadora.
2. Abre el archivo `index.html` haciendo doble clic en él o usando la extensión **Live Server** de Visual Studio Code (ejecutándose en tu puerto local, como `http://127.0.0.1:58998/index.html`).
3. Para forzar la actualización del Service Worker y borrar cachés viejos al hacer cambios de código, presiona `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac).
