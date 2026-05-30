/**
 * Student HUB — Backend del Comedor Estudiantil (Google Apps Script)
 * Hoja de Cálculo: menu_db.xlsx (ID: 1yA0iGDAFW1wNK9SJmiqjpF5d46mmQv-l)
 * Pestaña: "Menús" (o la primera pestaña que contenga los datos)
 *
 * Mapeo de Columnas de tu Spreadsheet:
 * A = semana (Número de semana: 1, 2, 3...)
 * B = dia (Lunes, Martes, Miércoles...)
 * C = Plato principal
 * D = Arroz
 * E = Frijoles
 * F = Ensalada
 * G = Aderezo
 * H = Fruta (Mapeada como postre)
 * I = Bebida
 *
 * CÓMO USAR EN GOOGLE SHEETS:
 * 1. Abre tu Google Sheet (menu_db.xlsx) → Extensiones → Apps Script
 * 2. Pega TODO este archivo (reemplaza cualquier código anterior).
 * 3. Guarda el proyecto de script.
 * 4. Haz clic en "Implementar" (arriba a la derecha) → "Nueva implementación".
 * 5. Selecciona el tipo de tipo "App web" (icono de engranaje).
 * 6. Configuración:
 *    - Descripción: "API de Comedor"
 *    - Ejecutar como: "Yo" (Tu cuenta de correo)
 *    - Quién tiene acceso: "Cualquier persona" (Muy importante para acceso público sin login)
 * 7. Haz clic en "Implementar". Autoriza los permisos si te los pide.
 * 8. Copia la "URL de la app web" generada y pégala en js/config.js (comedorApiUrl).
 */

var SPREADSHEET_ID = "1yA0iGDAFW1wNK9SJmiqjpF5d46mmQv-l";
var HOJA_COMEDOR = "Menús"; // Nombre por defecto, si no se encuentra leerá la primera pestaña

/** Abre la hoja de cálculo por ID o la vinculada directamente */
function obtenerLibroComedor() {
  try {
    var activo = SpreadsheetApp.getActiveSpreadsheet();
    if (activo) return activo;
  } catch (e) {
    /* script independiente */
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function obtenerDatosComedor() {
  try {
    var libro = obtenerLibroComedor();
    if (!libro) return null;

    // Intentar abrir la pestaña llamada "Menús" o la pestaña "Comedor"
    var hoja = libro.getSheetByName(HOJA_COMEDOR);
    if (!hoja) {
      hoja = libro.getSheetByName("Comedor");
    }
    // Si sigue sin encontrarse, tomamos la primera pestaña disponible (Garantiza que funcione siempre)
    if (!hoja) {
      hoja = libro.getSheets()[0];
    }
    if (!hoja) return null;

    var rango = hoja.getDataRange();
    if (rango.getNumRows() < 2) return null;

    return {
      valores: rango.getValues(),
      display: rango.getDisplayValues()
    };
  } catch (e) {
    return null;
  }
}

function leerCeldaComedor(valores, display, fila, col) {
  if (col >= valores[fila].length) return "";
  var valor = valores[fila][col];
  var texto = display[fila][col];

  if (valor === null || valor === undefined || valor === "") {
    return texto ? texto.toString().trim() : "";
  }
  return valor.toString().trim();
}

function doGet(e) {
  try {
    // Por defecto filtramos por la semana "1" si no se especifica
    var semanaBuscada = "1";
    if (e && e.parameter && e.parameter.semana) {
      semanaBuscada = e.parameter.semana.toString().trim();
    }

    var datos = obtenerDatosComedor();
    if (!datos) {
      return respuestaJsonComedor({
        error: "No se pudo leer la hoja de cálculo o está vacía. Verifica que el ID sea correcto."
      });
    }

    var valores = datos.valores;
    var display = datos.display;
    var resultado = [];

    // Empezamos en la fila 1 (la fila 0 contiene los encabezados: semana, dia, plato, etc.)
    for (var i = 1; i < valores.length; i++) {
      if (!valores[i] || valores[i].length < 3) continue;

      var semana = leerCeldaComedor(valores, display, i, 0);
      
      // Filtramos por la semana solicitada (para que no devuelva todo el año a la vez)
      if (semanaBuscada !== "") {
        var numSemana = parseInt(semana.toString().replace(/[^0-9]/g, ""), 10);
        var numBuscada = parseInt(semanaBuscada.replace(/[^0-9]/g, ""), 10);
        if (isNaN(numSemana) || isNaN(numBuscada) || numSemana !== numBuscada) continue;
      }

      var dia = leerCeldaComedor(valores, display, i, 1);
      if (!dia) continue;

      var platoPrincipal = leerCeldaComedor(valores, display, i, 2);
      var arroz = leerCeldaComedor(valores, display, i, 3);
      var frijoles = leerCeldaComedor(valores, display, i, 4);
      var ensalada = leerCeldaComedor(valores, display, i, 5);
      var aderezo = leerCeldaComedor(valores, display, i, 6);
      var fruta = leerCeldaComedor(valores, display, i, 7);
      var bebida = leerCeldaComedor(valores, display, i, 8);

      // Combinamos los acompañamientos (arroz, frijoles, ensalada, aderezo) de forma elegante
      var partesAco = [];
      if (arroz) partesAco.push(arroz);
      if (frijoles) partesAco.push(frijoles);
      if (ensalada) partesAco.push(ensalada);
      if (aderezo) partesAco.push("Aderezo: " + aderezo);
      var acompanamiento = partesAco.join(", ");

      resultado.push({
        semana: semana,
        dia: dia,
        plato: platoPrincipal,
        acompanamiento: acompanamiento,
        bebida: bebida || "Agua pura",
        postre: fruta || "Fruta de temporada"
      });
    }

    return respuestaJsonComedor(resultado);
  } catch (err) {
    return respuestaJsonComedor({ error: err.message });
  }
}

function respuestaJsonComedor(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/** Ejecuta esta función en tu Apps Script (▶) para dar los permisos y probar la lectura local */
function probarLecturaComedor() {
  var datos = obtenerDatosComedor();
  if (!datos) {
    Logger.log("ERROR: No se pudo leer la hoja. Verifica el ID del documento.");
    return;
  }
  Logger.log("Filas leídas en Comedor: " + datos.valores.length);
  if (datos.valores.length > 1) {
    var partesAco = [];
    var arroz = leerCeldaComedor(datos.valores, datos.display, 1, 3);
    var frijoles = leerCeldaComedor(datos.valores, datos.display, 1, 4);
    if (arroz) partesAco.push(arroz);
    if (frijoles) partesAco.push(frijoles);
    
    Logger.log("Datos de la fila 1 leídos con éxito:");
    Logger.log("Semana: " + leerCeldaComedor(datos.valores, datos.display, 1, 0));
    Logger.log("Día: " + leerCeldaComedor(datos.valores, datos.display, 1, 1));
    Logger.log("Plato Principal: " + leerCeldaComedor(datos.valores, datos.display, 1, 2));
    Logger.log("Acompañamientos combinados: " + partesAco.join(", "));
  }
}
