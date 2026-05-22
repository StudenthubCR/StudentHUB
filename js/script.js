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

    const dummySchedules = {
        "7mo": [
            { time: "07:00", end: "08:20", subject: "Matemáticas", prof: "Lic. Ana Vega" },
            { time: "08:30", end: "09:50", subject: "Español", prof: "Lic. Mario Solís" },
            { time: "10:00", end: "11:20", subject: "Ciencias", prof: "Lic. Karla Ruiz" }
        ],
        "8vo": [
            { time: "07:00", end: "08:20", subject: "Estudios Sociales", prof: "Lic. Luis Castro" },
            { time: "08:30", end: "09:50", subject: "Inglés", prof: "Lic. Elena Mora" },
            { time: "10:00", end: "11:20", subject: "Edu. Física", prof: "Lic. Jorge Paz" }
        ],
        "9no": [
            { time: "07:00", end: "08:20", subject: "Cívica", prof: "Lic. Pedro Juan" },
            { time: "08:30", end: "09:50", subject: "Artes Plásticas", prof: "Lic. Sofía Art" },
            { time: "10:00", end: "11:20", subject: "Música", prof: "Lic. Roberto Do" }
        ],
        "10mo": [
            { time: "17:00", end: "18:20", subject: "Programación I", prof: "Ing. Pablo Tech" },
            { time: "18:30", end: "19:50", subject: "Redes", prof: "Ing. Carlos Net" },
            { time: "20:00", end: "21:20", subject: "Ética Prof.", prof: "Lic. Marta Valores" }
        ],
        "11vo": [
            { time: "17:00", end: "18:20", subject: "Bases de Datos", prof: "Ing. Sara Query" },
            { time: "18:30", end: "19:50", subject: "Diseño Web", prof: "Ing. Erick UI" },
            { time: "20:00", end: "21:20", subject: "Práctica Supervisada", prof: "Ing. Fabián Guía" }
        ],
        "12vo": [
            { time: "17:00", end: "18:20", subject: "Proyecto Final", prof: "Ing. Daniel Sprint" },
            { time: "18:30", end: "19:50", subject: "Emprendimiento", prof: "Lic. Julia Start" },
            { time: "20:00", end: "21:20", subject: "Inglés Técnico", prof: "Lic. Wilson Speak" }
        ]
    };

    const renderSchedule = (grade, selectedCard, pushToHistory = true) => {
        const schedule = dummySchedules[grade];
        gradeTitle.textContent = `${grade.toUpperCase()} Año - Grupo ${grade.charAt(0)}-1`;
        scheduleList.innerHTML = '';

        // Marcar tarjeta activa
        document.querySelectorAll('.grade-card').forEach(card => card.classList.remove('active'));
        if (selectedCard) selectedCard.classList.add('active');

        schedule.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'schedule-item';
            div.style.animationDelay = `${index * 0.1}s`;
            div.innerHTML = `
                <div class="time-box">
                    <span class="time-start">${item.time}</span>
                    <span class="time-end">${item.end}</span>
                </div>
                <div class="subject-details">
                    <h4>${item.subject}</h4>
                    <p>${item.prof}</p>
                </div>
            `;
            scheduleList.appendChild(div);
        });

        // Guardar subvista en el historial
        if (pushToHistory) {
            history.pushState({ sectionId: 'horarios', subView: 'schedule', grade: grade }, "", `#horarios-${grade}`);
        }

        // Pequeña pausa para efecto visual antes de ocultar
        setTimeout(() => {
            gradeSelector.classList.add('hidden');
            scheduleView.classList.remove('hidden');
        }, 300);
    };

    document.querySelectorAll('.grade-card').forEach(card => {
        card.addEventListener('click', () => {
            const grade = card.getAttribute('data-grade');
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
