/**
 * Configuración de Student HUB
 * API de horarios (Google Apps Script — implementación actual)
 */
const StudentHubConfig = {
    horariosApiUrl:
        'https://script.google.com/macros/s/AKfycbwPGx7IqnBLS0NSJScOV90r4yv8sTnoq2B5AzC0kWNOnmyOm1nQeAQXBfBJNBHzLBhn/exec',

    /** Prototipo: único grupo con horario en la hoja */
    estudianteGrupo: '11-2',

    /** Grado del botón que abre ese horario (data-grade en index.html) */
    gradoConHorario: '11vo',

    grupoPorGrado: {
        '11vo': '11-2'
    }
};
