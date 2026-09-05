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

            // Si entramos a comedor, inicializar el menú
            if (sectionId === 'comedor') {
                initComedor();
            }
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
    const shortcutHorarios = document.getElementById('shortcut-horarios');

    if (shortcutCarnet) {
        shortcutCarnet.addEventListener('click', () => switchSection('carnet'));
    }

    if (shortcutComedor) {
        shortcutComedor.addEventListener('click', () => switchSection('comedor'));
    }

    if (shortcutHorarios) {
        shortcutHorarios.addEventListener('click', () => switchSection('horarios'));
    }

    // =========================================
    // LÓGICA DE LA SECCIÓN HORARIOS
    // =========================================
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
        const mapa = StudentHubConfig.grupoPorGrado || {};
        if (mapa[grade]) return true;
        const activo = StudentHubConfig.gradoConHorario;
        return Boolean(activo && grade === activo);
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

    // =========================================
    // LÓGICA DEL CARRUSEL DE NOTICIAS
    // =========================================
    const slides = document.querySelectorAll('.carousel-slide');
    const btnPrev = document.getElementById('carousel-prev');
    const btnNext = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');
    let currentSlide = 0;
    let carouselInterval;
    let dots = [];

    const showSlide = (index) => {
        if (slides.length === 0) return;

        // Quitar la clase active del slide actual
        slides[currentSlide].classList.remove('active');
        if (dots[currentSlide]) {
            dots[currentSlide].classList.remove('active');
            dots[currentSlide].setAttribute('aria-selected', 'false');
        }

        // Calcular el índice circular
        currentSlide = (index + slides.length) % slides.length;

        // Mostrar el nuevo slide
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
            dots[currentSlide].setAttribute('aria-selected', 'true');
        }
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

    // Generar los indicadores (puntos) a partir de los slides existentes
    if (dotsContainer && slides.length > 1) {
        slides.forEach((slide, index) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
            dot.type = 'button';
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            dot.setAttribute('aria-label', `Ir a la noticia ${index + 1} de ${slides.length}`);
            dot.addEventListener('click', () => {
                showSlide(index);
                startAutoplay(); // Reinicia el temporizador tras la interacción manual
            });
            dotsContainer.appendChild(dot);
            dots.push(dot);
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

    // =========================================
    // BOTÓN PARA GUARDAR CREDENCIAL OFFLINE
    // =========================================
    const downloadOfflineBtn = document.getElementById('download-offline-btn');
    if (downloadOfflineBtn) {
        downloadOfflineBtn.addEventListener('click', () => {
            // Mostrar feedback premium de descarga
            const originalContent = downloadOfflineBtn.innerHTML;
            downloadOfflineBtn.disabled = true;
            downloadOfflineBtn.innerHTML = `
                <svg class="animate-spin" style="animation: spin 1s linear infinite;" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                <span>Descargando...</span>
            `;
            
            setTimeout(() => {
                downloadOfflineBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>¡Guardado Offline!</span>
                `;
                downloadOfflineBtn.style.backgroundColor = '#10b981';
                downloadOfflineBtn.style.borderColor = '#10b981';
                downloadOfflineBtn.style.color = '#ffffff';
                
                alert('Credencial guardada en la caché local. Ahora puedes acceder a tu carnet digital incluso sin conexión a internet.');
                
                setTimeout(() => {
                    downloadOfflineBtn.disabled = false;
                    downloadOfflineBtn.innerHTML = originalContent;
                    downloadOfflineBtn.style.backgroundColor = '';
                    downloadOfflineBtn.style.borderColor = '';
                    downloadOfflineBtn.style.color = '';
                }, 3000);
            }, 1500);
        });
    }

    // =========================================
    // LÓGICA DEL COMEDOR ESTUDIANTIL
    // =========================================
    const MOCK_MENUS = {
        1: [
            { dia: 'Lunes', plato: 'Arroz con pollo desmechado', acompanamiento: 'Frijoles molidos, Ensalada de repollo con zanahoria', bebida: 'Té frío de limón', postre: 'Piña en rodajas' },
            { dia: 'Martes', plato: 'Casado tradicional de carne en salsa', acompanamiento: 'Arroz blanco, Frijoles negros, Plátano maduro frito y ensalada verde', bebida: 'Fresco de cas', postre: 'Papaya' },
            { dia: 'Miércoles', plato: 'Chuleta de cerdo frita', acompanamiento: 'Puré de papas gratinado, Ensalada de lechuga y tomate', bebida: 'Té dulce caliente', postre: 'Melón dulce' },
            { dia: 'Jueves', plato: 'Spaghettis a la boloñesa con carne de res', acompanamiento: 'Pan con ajo tostado, Ensalada césar fresca', bebida: 'Agua pura', postre: 'Sandía en triángulos' },
            { dia: 'Viernes', plato: 'Filet de pescado al ajillo', acompanamiento: 'Arroz blanco, Frijoles frescos y vegetales al vapor', bebida: 'Fresco de frutas de temporada', postre: 'Banano maduro' }
        ],
        2: [
            { dia: 'Lunes', plato: 'Lasaña de carne mixta (res y cerdo)', acompanamiento: 'Ensalada verde con aderezo italiano, Pan con mantequilla', bebida: 'Té frío dulce', postre: 'Manzana roja' },
            { dia: 'Martes', plato: 'Estofado de pollo con papas y zanahoria', acompanamiento: 'Arroz blanco, Frijoles tiernos con vainicas, Tortilla', bebida: 'Fresco de cas natural', postre: 'Piña picada' },
            { dia: 'Miércoles', plato: 'Pescado empanizado crujiente', acompanamiento: 'Arroz con maíz dulce, Ensalada caribeña de repollo', bebida: 'Limonada natural', postre: 'Mango maduro' },
            { dia: 'Jueves', plato: 'Arroz guisado con carne de cerdo', acompanamiento: 'Frijoles molidos, Plátano maduro horneado, Ensalada de pepino', bebida: 'Agua pura', postre: 'Melón picado' },
            { dia: 'Viernes', plato: 'Sopa de pollo completa con verduras', acompanamiento: 'Arroz blanco, Aguacate y dos tortillas de maíz', bebida: 'Fresco de horchata', postre: 'Mandarina' }
        ],
        3: [
            { dia: 'Lunes', plato: 'Fajitas de pechuga de pollo salteadas con chile y cebolla', acompanamiento: 'Tortillas de trigo para tacos, Frijoles negros enteros, Ensalada criolla', bebida: 'Té frío', postre: 'Piña' },
            { dia: 'Martes', plato: 'Carne mechada de res en salsa criolla', acompanamiento: 'Arroz blanco, Ensalada de repollo blanco con culantro y limón', bebida: 'Fresco de maracuyá', postre: 'Banano' },
            { dia: 'Miércoles', plato: 'Pescado fresco frito al limón', acompanamiento: 'Papas fritas crujientes, Ensalada mixta tradicional', bebida: 'Té helado de limón', postre: 'Papaya dulce' },
            { dia: 'Jueves', plato: 'Arroz con carne de cerdo picada y maíz dulce', acompanamiento: 'Ensalada rusa con remolacha y papa, Chips de plátano', bebida: 'Agua pura', postre: 'Sandía' },
            { dia: 'Viernes', plato: 'Garbanzos con pollo desmechado y papa', acompanamiento: 'Arroz blanco, Ensalada fresca de lechuga, repollo y remolacha', bebida: 'Fresco de frutas', postre: 'Manzana verde' }
        ],
        4: [
            { dia: 'Lunes', plato: 'Frijoles blancos con pollo desmechado, zanahoria o chayote', acompanamiento: 'Arroz blanco. Aderezo: Vinagreta de vegetales', bebida: 'Agua pura', postre: 'Banano' },
            { dia: 'Martes', plato: 'Pasta de cerdo en salsa criolla con papas', acompanamiento: 'Arroz blanco, Frijoles negros frescos, Repollo blanco con zanahoria', bebida: 'Agua pura', postre: 'Papaya / Melón' },
            { dia: 'Miércoles', plato: 'Pescado empanizado (con limón en rodaja)', acompanamiento: 'Arroz blanco, Frijoles negros frescos, Lechuga y tomate. Aderezo: Vinagreta básica', bebida: 'Agua pura', postre: 'Sandía' },
            { dia: 'Jueves', plato: 'Arroz mixto de pollo, cerdo y huevo con cebollino y zanahoria', acompanamiento: 'Frijoles molidos, Pepino en medias lunas y guacamole', bebida: 'Agua pura', postre: 'Piña' },
            { dia: 'Viernes', plato: 'Olla de carne con verduras variadas', acompanamiento: 'Verduras de olla (Sopa completa con yuca, elote, plátano y papa)', bebida: 'Agua pura', postre: 'Manzana' }
        ],
        5: [
            { dia: 'Lunes', plato: 'Pollo al horno marinado con hierbas frescas', acompanamiento: 'Puré de papas cremoso con ajo, Vainicas salteadas con mantequilla', bebida: 'Té frío', postre: 'Mandarina dulce' },
            { dia: 'Martes', plato: 'Carne mechada en salsa con pimientos y cebolla', acompanamiento: 'Arroz con vegetales, Frijoles colorados frescos, Chips de yuca', bebida: 'Fresco de avena fría', postre: 'Mango picado' },
            { dia: 'Miércoles', plato: 'Tacos de pescado al estilo ensenada', acompanamiento: 'Repollo morado rallado, Salsa de yogur y limón, Tortillas de maíz', bebida: 'Limonada con menta', postre: 'Piña dulce' },
            { dia: 'Jueves', plato: 'Arroz con atún selecto y maíz dulce horneado', acompanamiento: 'Ensalada de papa fría con mayonesa y cilantro, Plátano frito', bebida: 'Té de durazno', postre: 'Sandía jugosa' },
            { dia: 'Viernes', plato: 'Estofado de res en salsa de tomate con zanahoria y papa', acompanamiento: 'Arroz blanco, Frijoles negros frescos, Tortilla de maíz palmada', bebida: 'Agua pura', postre: 'Papaya' }
        ]
    };

    const initComedor = async () => {
        const todayMenuTitle = document.getElementById('today-menu-title');
        const todayMenuDesc = document.getElementById('today-menu-desc');
        const todayMenuProtein = document.getElementById('today-menu-protein');
        const todayMenuSide = document.getElementById('today-menu-side');
        const todayMenuDrink = document.getElementById('today-menu-drink');
        const todayMenuDessert = document.getElementById('today-menu-dessert');
        const weeklyMenuList = document.getElementById('weekly-menu-list');
        const weeklySubtitle = document.querySelector('.weekly-subtitle');

        if (!weeklyMenuList) return;

        // Mostrar cargando
        weeklyMenuList.innerHTML = '<div class="schedule-message">Cargando menú semanal...</div>';

        // Detectar si hoy es fin de semana (Sábado o Domingo) para previsualizar la siguiente semana
        const hoyIndex = new Date().getDay();
        const esFinDeSemana = (hoyIndex === 0 || hoyIndex === 6);
        
        const semanaConfigurada = StudentHubConfig.comedorSemanaActiva || 1;
        let semanaActiva = semanaConfigurada;

        if (esFinDeSemana) {
            // El fin de semana cargamos la semana siguiente de forma cíclica (de la 1 a la 5)
            semanaActiva = semanaConfigurada + 1;
            if (semanaActiva > 5) {
                semanaActiva = 1;
            }
            if (weeklySubtitle) {
                weeklySubtitle.innerHTML = `<strong>Avance de la Semana ${semanaActiva}</strong> — Visualizando el menú para la próxima semana (Comedor cerrado fines de semana).`;
            }
        } else {
            if (weeklySubtitle) {
                weeklySubtitle.textContent = `Menú correspondiente a la Semana ${semanaActiva} del ciclo lectivo.`;
            }
        }

        let menuData = MOCK_MENUS[semanaActiva] || MOCK_MENUS[4]; // Por defecto usar fallback offline dinámico según la semana
        const baseUrl = StudentHubConfig.comedorApiUrl;

        // Comprobar si la URL del Apps Script es la por defecto o está configurada
        if (baseUrl && !baseUrl.includes('AKfycbwUqA9-wz-O7v0F1zW-E06_z7y112345')) {
            try {
                // Añadimos el parámetro de la semana activa en el fetch a Apps Script
                let response = await fetch(`${baseUrl}?semana=${semanaActiva}`);
                if (response.ok) {
                    let data = await response.json();
                    
                    // Si no devolvió datos y no hay error, intentamos con el formato alternativo "?semana=Semana X"
                    if ((!Array.isArray(data) || data.length === 0) && !data.error) {
                        console.log(`Student HUB Comedor: Intento con "?semana=${semanaActiva}" retornó vacío. Probando con "?semana=Semana ${semanaActiva}"...`);
                        const fallbackResponse = await fetch(`${baseUrl}?semana=Semana ${encodeURIComponent(semanaActiva)}`);
                        if (fallbackResponse.ok) {
                            const fallbackData = await fallbackResponse.json();
                            if (Array.isArray(fallbackData) && fallbackData.length > 0) {
                                data = fallbackData;
                            }
                        }
                    }
                    
                    if (Array.isArray(data) && data.length > 0 && !data.error) {
                        menuData = data;
                        console.log(`Student HUB Comedor: Datos de Semana ${semanaActiva} cargados con éxito desde Google Sheets.`);
                    }
                }
            } catch (err) {
                console.warn('Student HUB Comedor: Error al conectar con Apps Script. Usando menú local offline dinámico.', err);
            }
        }

        // Renderizar menú de la semana
        weeklyMenuList.innerHTML = '';
        let delay = 0;

        menuData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-day-card';
            card.style.animationDelay = `${delay * 0.08}s`;
            delay += 1;

            card.innerHTML = `
                <div class="menu-day-header">
                    <h4>${item.dia || 'Día'}</h4>
                    <span class="menu-day-icon">🍲</span>
                </div>
                <div class="menu-day-body">
                    <div class="menu-field">
                        <span class="field-label">Plato Principal</span>
                        <p class="field-val">${item.plato || 'No programado'}</p>
                    </div>
                    <div class="menu-field">
                        <span class="field-label">Acompañamiento</span>
                        <p class="field-val">${item.acompanamiento || 'No programado'}</p>
                    </div>
                    <div class="menu-field">
                        <span class="field-label">Bebida</span>
                        <p class="field-val">${item.bebida || 'No programado'}</p>
                    </div>
                    <div class="menu-field">
                        <span class="field-label">Fruta</span>
                        <p class="field-val">${item.postre || 'No programada'}</p>
                    </div>
                </div>
            `;
            weeklyMenuList.appendChild(card);
        });

        // Determinar menú recomendado para hoy basado en el día real
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const hoyNombre = diasSemana[hoyIndex];

        if (esFinDeSemana) {
            // Desactivamos el plato recomendado los fines de semana
            todayMenuTitle.textContent = "Comedor Cerrado ☀️";
            todayMenuDesc.textContent = "El servicio de comedor no está activo durante los fines de semana. ¡Que tengas un excelente descanso!";
            todayMenuProtein.textContent = "—";
            todayMenuSide.textContent = "—";
            todayMenuDrink.textContent = "—";
            todayMenuDessert.textContent = "—";
        } else {
            let menuHoy = menuData.find(item => {
                const d = (item.dia || '').toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const h = hoyNombre.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return d === h;
            });

            if (menuHoy) {
                todayMenuTitle.textContent = menuHoy.plato || 'No programado';
                todayMenuDesc.textContent = `Acompañamiento recomendado: ${menuHoy.acompanamiento || 'No programado'}`;
                
                // Extraer una simplificación para la tabla nutricional
                const platoText = (menuHoy.plato || '');
                let proteina = platoText.split('con')[0] || platoText;
                if (proteina.length > 25) proteina = proteina.substring(0, 25) + '...';

                const acoText = (menuHoy.acompanamiento || '');
                let acomp = acoText.split(',')[0] || acoText;
                if (acomp.length > 25) acomp = acomp.substring(0, 25) + '...';

                todayMenuProtein.textContent = proteina;
                todayMenuSide.textContent = acomp;
                todayMenuDrink.textContent = menuHoy.bebida || 'Agua pura';
                todayMenuDessert.textContent = menuHoy.postre || 'Fruta de temporada';
            }
        }
    };

    console.log('Student HUB: Sistema SPA inicializado correctamente.');
});
