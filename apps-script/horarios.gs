/**
 * Student HUB — Backend de horarios (Google Apps Script)
 *
 * CÓMO INSTALAR / ACTUALIZAR:
 * 1. Abre tu Google Sheet de horarios → Extensiones → Apps Script
 * 2. Pega TODO este contenido (reemplaza cualquier código anterior).
 * 3. Si el script no está vinculado a la hoja, coloca el ID de tu Google Sheet en SPREADSHEET_ID.
 * 4. Arriba selecciona la función "probarLectura" y haz clic en "Ejecutar" (▶).
 *    Revisa la consola (Registro de ejecución) para confirmar que detecta tus pestañas y filas.
 * 5. Haz clic en "Implementar" (arriba a la derecha):
 *    - Si ya existe una implementación: "Administrar implementaciones" → icono de lápiz (Editar) →
 *      Versión: "Nueva versión" → Implementar.
 *    - Si es nueva: "Nueva implementación" → Tipo "App web" →
 *      Ejecutar como: "Yo" | Quién tiene acceso: "Cualquier persona" → Implementar.
 * 6. Copia la URL de la app web y asegúrate de que coincida con HORARIOS_API_URL en la app.
 *
 * ESTRUCTURAS SOPORTADAS EN GOOGLE SHEETS:
 * A) Pestañas individuales por grupo: "10-1", "11-2", "12-3", "Grupo 11-2", etc.
 *    - Con 5 columnas: Grupo | Día | Hora | Materia | Docente
 *    - O con 4 columnas: Grupo | Día | Hora | Materia
 *    - O con 3 columnas: Día | Hora | Materia (el grupo se toma del nombre de la pestaña)
 * B) Pestaña única consolidada: "Horarios" (Grupo | Día | Hora | Materia | Docente)
 */

var SPREADSHEET_ID = '1Qm2sW_y5dL7KokhKjCUJ7hPFDnFzgoJP3oeZlCXYMXo';

function obtenerLibro() {
  try {
    var activo = SpreadsheetApp.getActiveSpreadsheet();
    if (activo) return activo;
  } catch (e) { }

  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    return null;
  }
}

function normalizarTexto(valor) {
  if (valor === null || valor === undefined || valor === '') return '';
  var s = valor.toString().trim().toLowerCase();
  if (s.indexOf('gmt') !== -1 || s.indexOf('standard time') !== -1) return '';
  return s
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u');
}

function normalizarClaveGrupo(nombre) {
  return normalizarTexto(nombre)
    .replace(/grupo/g, '')
    .replace(/[\s_-]/g, '')
    .trim();
}

function leerCelda(valores, display, fila, col) {
  if (!valores[fila] || col < 0 || col >= valores[fila].length) return '';
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

    // Detectar encabezados en la fila 0
    var filaEncabezados = (display[0] || []).map(function(h) { return normalizarTexto(h); });
    var colGrupo = filaEncabezados.findIndex(function(h) { return h.indexOf('grupo') !== -1 || h.indexOf('seccion') !== -1; });
    var colDia = filaEncabezados.findIndex(function(h) { return h.indexOf('dia') !== -1; });
    var colHora = filaEncabezados.findIndex(function(h) { return h.indexOf('hora') !== -1 || h.indexOf('tiempo') !== -1; });
    var colMateria = filaEncabezados.findIndex(function(h) { return h.indexOf('materia') !== -1 || h.indexOf('asignatura') !== -1 || h.indexOf('clase') !== -1; });
    var colDocente = filaEncabezados.findIndex(function(h) { return h.indexOf('docente') !== -1 || h.indexOf('profesor') !== -1 || h.indexOf('profe') !== -1; });

    // Fallback si no se detectaron encabezados por nombre
    if (colDia === -1 && colMateria === -1) {
      if (valores[0].length >= 5) {
        colGrupo = 0;
        colDia = 1;
        colHora = 2;
        colMateria = 3;
        colDocente = 4;
      } else if (valores[0].length >= 4) {
        colGrupo = 0;
        colDia = 1;
        colHora = 2;
        colMateria = 3;
        colDocente = -1;
      } else {
        colGrupo = -1;
        colDia = 0;
        colHora = 1;
        colMateria = 2;
        colDocente = -1;
      }
    } else {
      if (colDia === 0 && colGrupo === -1) {
        if (colHora === -1) colHora = 1;
        if (colMateria === -1) colMateria = 2;
      }
    }

    for (var i = 1; i < valores.length; i++) {
      if (!valores[i]) continue;

      var grupo = (colGrupo >= 0 ? leerCelda(valores, display, i, colGrupo) : '') || grupoPorDefecto || hoja.getName();
      var dia = colDia >= 0 ? leerCelda(valores, display, i, colDia) : '';
      var hora = colHora >= 0 ? leerCelda(valores, display, i, colHora) : '';
      var materia = colMateria >= 0 ? leerCelda(valores, display, i, colMateria) : '';
      var docente = colDocente >= 0 ? leerCelda(valores, display, i, colDocente) : '';

      if (!dia && !materia) continue;

      var item = {
        grupo: grupo,
        dia: dia,
        hora: hora,
        materia: materia
      };
      if (docente) {
        item.docente = docente;
      }

      resultado.push(item);
    }
    return resultado;
  } catch (e) {
    return [];
  }
}

function esPestanaIgnorada(nombre) {
  var n = normalizarTexto(nombre);
  return n === 'comedor' || n.indexOf('menu') !== -1 || n === 'config' || n === 'ajustes';
}

function doGet(e) {
  try {
    var libro = obtenerLibro();
    if (!libro) {
      return respuestaJson({
        error: 'No se pudo abrir el libro de Google Sheets. Verifica que SPREADSHEET_ID sea el correcto o abre el script desde Extensiones → Apps Script en tu hoja.'
      });
    }

    var grupoBuscado = '';
    if (e && e.parameter && e.parameter.grupo) {
      grupoBuscado = normalizarClaveGrupo(e.parameter.grupo);
    }

    var resultado = [];
    var todasLasHojas = libro.getSheets();

    // 1. Si busca un grupo específico (ej. ?grupo=11-2 o ?grupo=11-1)
    if (grupoBuscado !== '') {
      // A. Buscar primero una pestaña que coincida con el grupo (ej. "11-2", "Grupo 11-2")
      for (var s = 0; s < todasLasHojas.length; s++) {
        var hoja = todasLasHojas[s];
        if (esPestanaIgnorada(hoja.getName())) continue;

        if (normalizarClaveGrupo(hoja.getName()) === grupoBuscado) {
          var filasGrupo = leerFilasDeHoja(hoja, hoja.getName());
          if (filasGrupo.length > 0) {
            return respuestaJson(filasGrupo);
          }
        }
      }

      // B. Si no hay pestaña con ese nombre, buscar en pestaña "Horarios" si existe
      var hojaHorarios = libro.getSheetByName('Horarios') || libro.getSheetByName('horarios');
      if (hojaHorarios) {
        var filasHorarios = leerFilasDeHoja(hojaHorarios, '');
        for (var f = 0; f < filasHorarios.length; f++) {
          if (normalizarClaveGrupo(filasHorarios[f].grupo) === grupoBuscado) {
            resultado.push(filasHorarios[f]);
          }
        }
        if (resultado.length > 0) {
          return respuestaJson(resultado);
        }
      }

      // C. Buscar dentro de las filas de cualquier pestaña no ignorada
      for (var s2 = 0; s2 < todasLasHojas.length; s2++) {
        var hoja2 = todasLasHojas[s2];
        if (esPestanaIgnorada(hoja2.getName())) continue;

        var filasS2 = leerFilasDeHoja(hoja2, hoja2.getName());
        for (var f2 = 0; f2 < filasS2.length; f2++) {
          if (normalizarClaveGrupo(filasS2[f2].grupo) === grupoBuscado) {
            resultado.push(filasS2[f2]);
          }
        }
      }
      return respuestaJson(resultado);
    }

    // 2. Si no se pasó parámetro ?grupo=, recopilar de la pestaña "Horarios" si existe
    var hojaGeneral = libro.getSheetByName('Horarios') || libro.getSheetByName('horarios');
    if (hojaGeneral) {
      var filasGen = leerFilasDeHoja(hojaGeneral, '');
      if (filasGen.length > 0) {
        return respuestaJson(filasGen);
      }
    }

    // O recopilar de todas las pestañas de grupos
    for (var i = 0; i < todasLasHojas.length; i++) {
      var h = todasLasHojas[i];
      if (esPestanaIgnorada(h.getName())) continue;
      var filasH = leerFilasDeHoja(h, h.getName());
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

/** Ejecutar en Apps Script para diagnosticar la lectura */
function probarLectura() {
  var libro = obtenerLibro();
  if (!libro) {
    Logger.log('ERROR: no se pudo abrir el libro.');
    return;
  }
  var hojas = libro.getSheets();
  Logger.log('Total de pestañas encontradas: ' + hojas.length);
  for (var i = 0; i < hojas.length; i++) {
    var h = hojas[i];
    var ignorada = esPestanaIgnorada(h.getName()) ? ' (IGNORADA)' : '';
    var filas = leerFilasDeHoja(h, h.getName());
    Logger.log('→ Pestaña "' + h.getName() + '"' + ignorada + ': ' + filas.length + ' filas leídas');
    if (filas.length > 0) {
      Logger.log('   Ejemplo fila 1: ' + JSON.stringify(filas[0]));
    }
  }
}
