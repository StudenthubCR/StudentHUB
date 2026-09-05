/**
 * Student HUB — Backend de horarios (Google Apps Script)
 *
 * SOPORTA:
 * 1. Pestañas individuales por grupo: "10-1", "10-2", "10-3", "11-1", "11-2", "11-3", "12-1", "12-2", "12-3", etc.
 * 2. Pestaña única consolidada: "Horarios" (A=Grupo | B=Día | C=Hora | D=Materia)
 *
 * Columnas esperadas en cada pestaña:
 * Col A: Grupo (opcional si la pestaña ya se llama como el grupo)
 * Col B: Día (Lunes, Martes, Miércoles, Jueves, Viernes)
 * Col C: Hora (ej. 5:50pm-6:35pm)
 * Col D: Materia (ej. Diseño software, Programación web, Inglés)
 */

var SPREADSHEET_ID = '1Qm2sW_y5dL7KokhKjCUJ7hPFDnFzgoJP3oeZlCXYMXo';

function obtenerLibro() {
  try {
    var activo = SpreadsheetApp.getActiveSpreadsheet();
    if (activo) return activo;
  } catch (e) { }

  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function normalizarTexto(valor) {
  if (valor === null || valor === undefined || valor === '') return '';
  var s = valor.toString().trim().toLowerCase();
  if (s.indexOf('gmt') !== -1 || s.indexOf('standard time') !== -1) return '';
  return s;
}

function leerCelda(valores, display, fila, col) {
  if (!valores[fila] || col >= valores[fila].length) return '';
  var valor = valores[fila][col];
  var texto = display[fila] ? display[fila][col] : '';

  if (valor === null || valor === undefined || valor === '') {
    return texto ? texto.toString().trim() : '';
  }
  if (valor instanceof Date) {
    return texto ? texto.toString().trim() : '';
  }
  return valor.toString().trim();
}

function leerFilasDeHoja(hoja, grupoPorDefecto) {
  try {
    var rango = hoja.getDataRange();
    if (rango.getNumRows() < 2) return [];

    var valores = rango.getValues();
    var display = rango.getDisplayValues();
    var resultado = [];

    // Fila 0 son encabezados (Grupo, Dia, Hora, Materia)
    for (var i = 1; i < valores.length; i++) {
      if (!valores[i] || valores[i].length < 3) continue;

      // Col A: Grupo (o nombre de la pestaña si está vacío)
      var grupo = leerCelda(valores, display, i, 0) || grupoPorDefecto || hoja.getName();
      var dia = leerCelda(valores, display, i, 1);
      var hora = leerCelda(valores, display, i, 2);
      var materia = leerCelda(valores, display, i, 3);

      if (!dia && !materia) continue;

      resultado.push({
        grupo: grupo,
        dia: dia,
        hora: hora,
        materia: materia
      });
    }
    return resultado;
  } catch (e) {
    return [];
  }
}

function doGet(e) {
  try {
    var libro = obtenerLibro();
    if (!libro) {
      return respuestaJson({ error: 'No se pudo abrir el libro de Google Sheets.' });
    }

    var grupoBuscado = '';
    if (e && e.parameter && e.parameter.grupo) {
      grupoBuscado = normalizarTexto(e.parameter.grupo);
    }

    var resultado = [];
    var todasLasHojas = libro.getSheets();

    // 1. Si busca un grupo específico (ej. ?grupo=11-2 o ?grupo=11-1)
    if (grupoBuscado !== '') {
      // Buscar primero una pestaña con el nombre exacto del grupo
      for (var s = 0; s < todasLasHojas.length; s++) {
        var nombreHoja = normalizarTexto(todasLasHojas[s].getName());
        if (nombreHoja === grupoBuscado) {
          var filasGrupo = leerFilasDeHoja(todasLasHojas[s], todasLasHojas[s].getName());
          return respuestaJson(filasGrupo);
        }
      }

      // Si no hay pestaña con ese nombre, buscar en la pestaña "Horarios" si existe
      var hojaHorarios = libro.getSheetByName('Horarios');
      if (hojaHorarios) {
        var filasHorarios = leerFilasDeHoja(hojaHorarios, '');
        for (var f = 0; f < filasHorarios.length; f++) {
          if (normalizarTexto(filasHorarios[f].grupo) === grupoBuscado) {
            resultado.push(filasHorarios[f]);
          }
        }
        return respuestaJson(resultado);
      }

      // Si no existe pestaña "Horarios", revisar en todas las pestañas si alguna fila tiene ese grupo
      for (var s2 = 0; s2 < todasLasHojas.length; s2++) {
        var nombreS2 = normalizarTexto(todasLasHojas[s2].getName());
        if (nombreS2 === 'comedor') continue;
        var filasS2 = leerFilasDeHoja(todasLasHojas[s2], todasLasHojas[s2].getName());
        for (var f2 = 0; f2 < filasS2.length; f2++) {
          if (normalizarTexto(filasS2[f2].grupo) === grupoBuscado) {
            resultado.push(filasS2[f2]);
          }
        }
      }
      return respuestaJson(resultado);
    }

    // 2. Si no se pasó parámetro ?grupo=, recopilar de la pestaña "Horarios" si existe
    var hojaHorariosGeneral = libro.getSheetByName('Horarios');
    if (hojaHorariosGeneral) {
      return respuestaJson(leerFilasDeHoja(hojaHorariosGeneral, ''));
    }

    // O recopilar de todas las pestañas de grupos (omitiendo "Comedor")
    for (var i = 0; i < todasLasHojas.length; i++) {
      var nombreH = todasLasHojas[i].getName();
      if (normalizarTexto(nombreH) === 'comedor') continue;
      var filasH = leerFilasDeHoja(todasLasHojas[i], nombreH);
      resultado = resultado.concat(filasH);
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

/** Ejecutar en Apps Script para verificar la lectura */
function probarLectura() {
  var libro = obtenerLibro();
  if (!libro) {
    Logger.log('ERROR: no se pudo abrir el libro.');
    return;
  }
  var hojas = libro.getSheets().map(function(h) { return h.getName(); });
  Logger.log('Pestañas encontradas: ' + hojas.join(', '));
}
