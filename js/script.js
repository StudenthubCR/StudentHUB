/**
 * Student HUB - Lógica de Navegación SPA
 * Maneja el cambio de secciones sin recargar la página.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Registro del Service Worker para la PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((reg) => {
                    console.log('Student HUB PWA: Service Worker registrado con éxito. Scope:', reg.scope);
                })
                .catch((err) => {
                    console.error('Student HUB PWA: Fallo al registrar el Service Worker:', err);
                });
        });
    }

    // Referencias a los elementos del DOM
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.page-section');

    /**
     * Cambia la sección activa basándose en el ID proporcionado.
     * @param {string} sectionId - El ID de la sección a mostrar.
     */
    /**
     * Cambia la sección activa basándose en el ID proporcionado.
     * @param {string} sectionId - El ID de la sección a mostrar.
     * @param {boolean} pushToHistory - Si se debe registrar la navegación en el historial.
     */
    const switchSection = (sectionId, pushToHistory = true) => {
        // 1. Ocultar todas las secciones
        sections.forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });

        // 2. Mostrar la sección seleccionada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            // Añadimos un pequeño delay para que la animación CSS se dispare correctamente
            setTimeout(() => {
                targetSection.classList.add('active');
            }, 10);
        }

        // 3. Actualizar estado visual de los botones de navegación
        navItems.forEach(item => {
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // 4. Registrar en el historial para el soporte de retroceso móvil
        if (pushToHistory) {
            history.pushState({ sectionId: sectionId, subView: null }, "", `#${sectionId}`);
        }

        // Opcional: Feedback háptico (si el dispositivo lo soporta)
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    };

    // Lógica de Modo Oscuro
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        if (theme === 'dark') {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    };

    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Inicializar estado del historial del navegador
    history.replaceState({ sectionId: 'dashboard', subView: null }, "", "#dashboard");

    // Escuchar el evento de retroceso del navegador (gesto o botón físico en móviles)
    window.addEventListener('popstate', (event) => {
        if (event.state) {
            const { sectionId, subView, grade } = event.state;
            if (sectionId === 'horarios' && subView === 'schedule') {
                renderSchedule(grade, document.querySelector(`.grade-card[data-grade="${grade}"]`), false);
            } else {
                switchSection(sectionId, false);
                if (sectionId === 'horarios') {
                    const gradeSelector = document.getElementById('grade-selector');
                    const scheduleView = document.getElementById('schedule-view');
                    if (gradeSelector && scheduleView) {
                        scheduleView.classList.add('hidden');
                        scheduleView.classList.remove('active');
                        gradeSelector.classList.remove('hidden');
                        document.querySelectorAll('.grade-card').forEach(card => card.classList.remove('active'));
                    }
                }
            }
        } else {
            switchSection('dashboard', false);
        }
    });

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // Redirección al Inicio al hacer clic en el logo de la barra superior
    const logoContainer = document.getElementById('logo-container');
    if (logoContainer) {
        logoContainer.addEventListener('click', () => {
            switchSection('dashboard');
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Agregar manejadores de eventos a cada botón de la navegación inferior
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section');
            
            // Solo cambiar si no estamos ya en esa sección
            if (!item.classList.contains('active')) {
                switchSection(sectionId);
                
                // Desplazar al inicio de la página al cambiar de sección
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Accesos rápidos desde el Dashboard
    const shortcutCarnet = document.getElementById('shortcut-carnet');
    const shortcutComedor = document.getElementById('shortcut-comedor');

    if (shortcutCarnet) {
        shortcutCarnet.addEventListener('click', () => switchSection('carnet'));
    }

    if (shortcutComedor) {
        shortcutComedor.addEventListener('click', () => {
            alert('El servicio de Comedor estará disponible próximamente.');
        });
    }

    const shortcutHorarios = document.getElementById('shortcut-horarios');
    if (shortcutHorarios) {
        shortcutHorarios.addEventListener('click', () => switchSection('horarios'));
    }

    // Lógica interna de la sección Horarios
    const gradeSelector = document.getElementById('grade-selector');
    const scheduleView = document.getElementById('schedule-view');
    const scheduleList = document.getElementById('schedule-list');
    const gradeTitle = document.getElementById('selected-grade-title');
    const btnBackToGrades = document.getElementById('change-grade');
    const btnBackToDashboard = document.getElementById('back-to-dashboard');

    const ORDEN_DIAS = ['lunes', 'martes', 'miercoles', 'miércoles', 'jueves', 'viernes', 'sabado', 'sábado', 'domingo'];

    const etiquetaGrado = {
        '7mo': '7° Séptimo',
        '8vo': '8° Octavo',
        '9no': '9° Noveno',
        '10mo': '10° Décimo',
        '11vo': '11° Undécimo',
        '12vo': '12° Duodécimo'
    };

    const normalizarDia = (dia) =>
        (dia || '')
            .toString()
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

    const indiceDia = (dia) => {
        const clave = normalizarDia(dia);
        const idx = ORDEN_DIAS.indexOf(clave);
        return idx === -1 ? 99 : idx;
    };

    const parseHora = (hora) => {
        const partes = (hora || '').split('-').map((p) => p.trim());
        return { inicio: partes[0] || '—', fin: partes[1] || '' };
    };

    const grupoParaGrado = (grade, card) => {
        if (card && card.dataset.grupo) return card.dataset.grupo.trim();
        const mapa = StudentHubConfig.grupoPorGrado || {};
        return mapa[grade] || StudentHubConfig.estudianteGrupo || '';
    };

    const gradoTieneHorario = (grade) => {
        const activo = StudentHubConfig.gradoConHorario;
        if (activo) return grade === activo;
        const mapa = StudentHubConfig.grupoPorGrado || {};
        return Boolean(mapa[grade]);
    };

    const cacheHorarios = new Map();

    const esGrupoValido = (valor) => {
        if (!valor) return false;
        const s = valor.toString();
        return !/gmt|standard time/i.test(s);
    };

    const filtrarPorGrupo = (filas, grupo) => {
        const g = grupo.toLowerCase();
        const conGrupoValido = filas.some((f) => esGrupoValido(f.grupo));
        if (!conGrupoValido) return filas;
        return filas.filter((f) => (f.grupo || '').toString().trim().toLowerCase() === g);
    };

    const fetchHorarios = async (grupo) => {
        const clave = grupo || '__todos__';
        if (cacheHorarios.has(clave)) return cacheHorarios.get(clave);

        const base = StudentHubConfig.horariosApiUrl;
        const url = grupo ? `${base}?grupo=${encodeURIComponent(grupo)}` : base;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('No se pudo conectar con el servidor de horarios');

        const data = await resp.json();
        if (data && data.error) throw new Error(data.error);
        if (!Array.isArray(data)) throw new Error('Respuesta inválida del servidor');

        let filas = data;
        const necesitaRespaldo =
            (grupo && filas.length === 0) ||
            (grupo && filas.length > 0 && !filas.some((f) => esGrupoValido(f.grupo)));

        if (necesitaRespaldo) {
            const respTodos = await fetch(base);
            const todos = await respTodos.json();
            if (Array.isArray(todos) && !todos.error && todos.length) {
                filas = grupo ? filtrarPorGrupo(todos, grupo) : todos;
            }
        }

        cacheHorarios.set(clave, filas);
        return filas;
    };

    const agruparPorDia = (filas) => {
        const mapa = new Map();
        filas.forEach((fila) => {
            const dia = fila.dia || 'Sin día';
            if (!mapa.has(dia)) mapa.set(dia, []);
            mapa.get(dia).push(fila);
        });
        return [...mapa.entries()].sort((a, b) => indiceDia(a[0]) - indiceDia(b[0]));
    };

    const mostrarEstadoHorario = (mensaje, esError = false) => {
        scheduleList.innerHTML = '';
        const div = document.createElement('div');
        div.className = esError ? 'schedule-message schedule-error' : 'schedule-message';
        div.textContent = mensaje;
        scheduleList.appendChild(div);
    };

    const renderFilasHorario = (filas) => {
        scheduleList.innerHTML = '';
        if (!filas.length) {
            mostrarEstadoHorario('No hay horario registrado para este grupo.', true);
            return;
        }

        let delay = 0;
        agruparPorDia(filas).forEach(([dia, clases]) => {
            const header = document.createElement('h4');
            header.className = 'schedule-day-title';
            header.textContent = dia;
            scheduleList.appendChild(header);

            clases.forEach((item) => {
                const { inicio, fin } = parseHora(item.hora);
                const esCena = (item.materia || '').toLowerCase() === 'cena';
                const div = document.createElement('div');
                div.className = 'schedule-item' + (esCena ? ' schedule-break' : '');
                div.style.animationDelay = `${delay * 0.08}s`;
                delay += 1;
                div.innerHTML = `
                    <div class="time-box">
                        <span class="time-start">${inicio}</span>
                        ${fin ? `<span class="time-end">${fin}</span>` : ''}
                    </div>
                    <div class="subject-details">
                        <h4>${item.materia || '—'}</h4>
                        <p>${item.hora || ''}</p>
                    </div>
                `;
                scheduleList.appendChild(div);
            });
        });
    };

    const renderSchedule = async (grade, selectedCard, pushToHistory = true) => {
        if (!gradoTieneHorario(grade)) {
            mostrarEstadoHorario('Horario no disponible en este prototipo. Usa 11° Undécimo (grupo 11-2).', true);
            gradeSelector.classList.remove('hidden');
            scheduleView.classList.add('hidden');
            return;
        }

        const grupo = grupoParaGrado(grade, selectedCard);
        const etiqueta = etiquetaGrado[grade] || grade.toUpperCase();
        gradeTitle.textContent = `${etiqueta} — Grupo ${grupo}`;

        document.querySelectorAll('.grade-card').forEach((card) => card.classList.remove('active'));
        if (selectedCard) selectedCard.classList.add('active');

        gradeSelector.classList.add('hidden');
        scheduleView.classList.remove('hidden');
        mostrarEstadoHorario('Cargando horario…');

        if (pushToHistory) {
            history.pushState({ sectionId: 'horarios', subView: 'schedule', grade: grade }, '', `#horarios-${grade}`);
        }

        try {
            const filas = await fetchHorarios(grupo);
            renderFilasHorario(filas);
        } catch (err) {
            console.error('Student HUB horarios:', err);
            mostrarEstadoHorario(err.message || 'Error al cargar el horario.', true);
        }
    };

    document.querySelectorAll('.grade-card').forEach((card) => {
        card.addEventListener('click', () => {
            const grade = card.getAttribute('data-grade');
            if (card.classList.contains('grade-card--disabled') || !gradoTieneHorario(grade)) {
                return;
            }
            renderSchedule(grade, card);
        });
    });

    btnBackToGrades.addEventListener('click', () => {
        history.back();
    });

    btnBackToDashboard.addEventListener('click', () => {
        history.back();
    });

    // Lógica del Carrusel de Noticias con Controles Manuales y Auto-Rotación
    const slides = document.querySelectorAll('.carousel-slide');
    const btnPrev = document.getElementById('carousel-prev');
    const btnNext = document.getElementById('carousel-next');
    let currentSlide = 0;
    let carouselInterval;

    const showSlide = (index) => {
        if (slides.length === 0) return;
        
        // Quitar la clase active del slide actual
        slides[currentSlide].classList.remove('active');
        
        // Calcular el índice circular
        currentSlide = (index + slides.length) % slides.length;
        
        // Mostrar el nuevo slide
        slides[currentSlide].classList.add('active');
    };

    const nextSlide = () => {
        showSlide(currentSlide + 1);
    };

    const prevSlide = () => {
        showSlide(currentSlide - 1);
    };

    const startAutoplay = () => {
        stopAutoplay();
        carouselInterval = setInterval(nextSlide, 8000); // Rota automáticamente cada 8 segundos
    };

    const stopAutoplay = () => {
        if (carouselInterval) {
            clearInterval(carouselInterval);
        }
    };

    // Asignación de manejadores a los botones manuales
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            nextSlide();
            startAutoplay(); // Reinicia el temporizador para que el usuario tenga tiempo de leer
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            prevSlide();
            startAutoplay(); // Reinicia el temporizador
        });
    }

    // Inicializar carrusel
    if (slides.length > 0) {
        startAutoplay();
    }

    // Lógica para el QR (Simulación de animación o datos dinámicos)
    const qrPixels = document.querySelectorAll('.qr-pixel');
    if (qrPixels.length > 0) {
        setInterval(() => {
            qrPixels.forEach(pixel => {
                pixel.style.opacity = Math.random() > 0.5 ? '1' : '0.3';
            });
        }, 1000);
    }

    console.log('Student HUB: Sistema SPA inicializado correctamente.');
});
