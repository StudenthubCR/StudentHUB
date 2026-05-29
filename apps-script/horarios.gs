/**
 * Student HUB — Backend de horarios (Google Apps Script)
 * Hoja: "Horarios" | A=Grupo | B=Día | C=Hora | D=Materia
 *
 * CÓMO USAR:
 * 1. Abre tu Google Sheet → Extensiones → Apps Script
 * 2. Pega TODO este archivo (reemplaza el código anterior)
 * 3. Si el script NO está dentro de la hoja, pon el ID correcto en SPREADSHEET_ID
 *    (está en la URL: .../d/ESTE_ID/edit)
 * 4. Guardar → Implementar → Nueva implementación → App web → Cualquier persona
 * 5. Copia la URL nueva en js/config.js (horariosApiUrl)
 *
 * Columna A = texto plano "11-2" (no formato Fecha)
 */

var SPREADSHEET_ID = '1Qm2sW_y5dL7KokhKjCUJ7hPFDnFzgoJP3oeZlCXYMXo';
var HOJA_HORARIOS = 'Horarios';

/** Abre el libro vinculado al script o, si no hay, por ID */
function obtenerLibro() {
  try {
    var activo = SpreadsheetApp.getActiveSpreadsheet();
    if (activo) return activo;
  } catch (e) { /* script independiente */ }

  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function obtenerDatosDeHoja() {
  try {
    var libro = obtenerLibro();
    if (!libro) return null;

    var hoja = libro.getSheetByName(HOJA_HORARIOS);
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

function leerCelda(valores, display, fila, col) {
  var valor = valores[fila][col];
  var texto = display[fila][col];

  if (valor === null || valor === undefined || valor === '') {
    return texto ? texto.toString().trim() : '';
  }
  if (valor instanceof Date) {
    return texto ? texto.toString().trim() : '';
  }
  return valor.toString().trim();
}

function normalizarGrupo(valor) {
  if (valor === null || valor === undefined || valor === '') return '';
  var s = valor.toString().trim().toLowerCase();
  if (s.indexOf('gmt') !== -1 || s.indexOf('standard time') !== -1) return '';
  return s;
}

function doGet(e) {
  try {
    var grupoBuscado = '';
    if (e && e.parameter && e.parameter.grupo) {
      grupoBuscado = normalizarGrupo(e.parameter.grupo);
    }

    var datos = obtenerDatosDeHoja();
    if (!datos) {
      return respuestaJson({
        error:
          'No se encontró la hoja Horarios o está vacía. ' +
          'Abre el script desde Extensiones en TU hoja, o corrige SPREADSHEET_ID.'
      });
    }

    var valores = datos.valores;
    var display = datos.display;
    var resultado = [];

    for (var i = 1; i < valores.length; i++) {
      if (!valores[i] || valores[i].length < 4) continue;

      var grupo = leerCelda(valores, display, i, 0);
      var grupoEnFila = normalizarGrupo(grupo);

      if (grupoBuscado !== '' && grupoEnFila !== grupoBuscado) continue;

      resultado.push({
        grupo: grupo,
        dia: leerCelda(valores, display, i, 1),
        hora: leerCelda(valores, display, i, 2),
        materia: leerCelda(valores, display, i, 3)
      });
    }

    return respuestaJson(resultado);
  } catch (err) {
    return respuestaJson({ error: err.message });
  }
}

function respuestaJson(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/** Ejecutar una vez en Apps Script (▶) para autorizar permisos */
function probarLectura() {
  var datos = obtenerDatosDeHoja();
  if (!datos) {
    Logger.log('ERROR: no se leyó Horarios');
    return;
  }
  Logger.log('Filas leídas: ' + datos.valores.length);
  Logger.log('Primera clase: ' + JSON.stringify({
    grupo: leerCelda(datos.valores, datos.display, 1, 0),
    dia: leerCelda(datos.valores, datos.display, 1, 1),
    materia: leerCelda(datos.valores, datos.display, 1, 3)
  }));
}
