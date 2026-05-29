/**
 * Configuración de Student HUB — USAR ESTE ARCHIVO EN EL REPO DEL EQUIPO
 * Todas las URLs de bases de datos: ver también BASES_DE_DATOS.md en la raíz.
 */
const StudentHubConfig = {
    // --- API Horarios (Google Apps Script) ---
    horariosApiUrl:
        'https://script.google.com/macros/s/AKfycbxcjXuPs80KsshkCACYPZdOXQmuPY5tg-ThNmcWZ_9_YyOIEkOgb4oMdNlTOYixbfqz/exec',

    // Google Sheet: 1Qm2sW_y5dL7KokhKjCUJ7hPFDnFzgoJP3oeZlCXYMXo — hoja "Horarios"
    // Código Apps Script en el repo: apps-script/horarios.gs

    /** Prototipo: único grupo con horario en la hoja */
    estudianteGrupo: '11-2',

    /** Grado del botón que abre ese horario (data-grade en index.html) */
    gradoConHorario: '11vo',

    grupoPorGrado: {
        '11vo': '11-2'
    }
};
