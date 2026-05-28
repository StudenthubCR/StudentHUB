/**
 * Student HUB — Backend de horarios (Google Apps Script)
 * Hoja: "Horarios" | Columnas: A=Grupo, B=Día, C=Hora, D=Materia
 *
 * IMPORTANTE: Columna A debe ser texto plano (ej. 11-2), NO formato Fecha.
 * Despliegue: Implementar → Nueva implementación → Aplicación web
 */

var SPREADSHEET_ID = '1Qm2sW_y5dL7KokhKjCUJ7hPFDnFzgoJP3oeZlCXYMXo';
var HOJA_HORARIOS = 'Horarios';

function obtenerDatosDeHoja() {
  try {
    var libro = SpreadsheetApp.openById(SPREADSHEET_ID);
    var hoja = libro.getSheetByName(HOJA_HORARIOS);
    if (!hoja) return { valores: [], display: [] };

    var rango = hoja.getDataRange();
    return {
      valores: rango.getValues(),
      display: rango.getDisplayValues()
    };
  } catch (e) {
    return { valores: [], display: [] };
  }
}

/**
 * Lee el texto visible de la celda. Evita que "11-2" convertido a Date
 * salga como "Wed Feb 11 2026..." en el JSON.
 */
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

    var hoja = obtenerDatosDeHoja();
    var valores = hoja.valores;
    var display = hoja.display;

    if (!valores.length) {
      return respuestaJson({ error: 'No se encontró la hoja Horarios o está vacía' });
    }

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
