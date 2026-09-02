import type { MenuDia } from './menu.types'

/**
 * DATOS DE PRUEBA — la app **no** los usa.
 *
 * El comedor lee la hoja de cálculo real a través de `comedor.api.ts`. Este
 * archivo se queda porque las pruebas de la lógica de fechas necesitan un
 * conjunto de menús fijo y conocido: si dependieran de la hoja, dejarían de
 * ser deterministas y fallarían cada vez que la cocina cambie un plato.
 *
 * El contenido viene de `MOCK_MENUS` de la app actual, remodelado por fecha
 * real. Son cinco semanas hábiles consecutivas a partir de ANCLA.
 *
 * El 15 de setiembre queda sin fila a propósito: es feriado y no hay servicio.
 * Por eso son 24 días y no 25, y así se puede probar qué pasa cuando a una
 * semana le falta el menú de un día.
 */
export const ANCLA = '2026-08-31' // lunes de la primera semana publicada

export const MENUS: MenuDia[] = [
  // --- Semana del 31 de agosto ---
  {
    fecha: '2026-08-31',
    plato: 'Arroz con pollo desmechado',
    acompanamiento: 'Frijoles molidos, Ensalada de repollo con zanahoria',
    bebida: 'Té frío de limón',
    fruta: 'Piña en rodajas',
  },
  {
    fecha: '2026-09-01',
    plato: 'Casado tradicional de carne en salsa',
    acompanamiento: 'Arroz blanco, Frijoles negros, Plátano maduro frito y ensalada verde',
    bebida: 'Fresco de cas',
    fruta: 'Papaya',
  },
  {
    fecha: '2026-09-02',
    plato: 'Chuleta de cerdo frita',
    acompanamiento: 'Puré de papas gratinado, Ensalada de lechuga y tomate',
    bebida: 'Té dulce caliente',
    fruta: 'Melón dulce',
  },
  {
    fecha: '2026-09-03',
    plato: 'Spaghettis a la boloñesa con carne de res',
    acompanamiento: 'Pan con ajo tostado, Ensalada césar fresca',
    bebida: 'Agua pura',
    fruta: 'Sandía en triángulos',
  },
  {
    fecha: '2026-09-04',
    plato: 'Filet de pescado al ajillo',
    acompanamiento: 'Arroz blanco, Frijoles frescos y vegetales al vapor',
    bebida: 'Fresco de frutas de temporada',
    fruta: 'Banano maduro',
  },

  // --- Semana del 7 de setiembre ---
  {
    fecha: '2026-09-07',
    plato: 'Lasaña de carne mixta (res y cerdo)',
    acompanamiento: 'Ensalada verde con aderezo italiano, Pan con mantequilla',
    bebida: 'Té frío dulce',
    fruta: 'Manzana roja',
  },
  {
    fecha: '2026-09-08',
    plato: 'Estofado de pollo con papas y zanahoria',
    acompanamiento: 'Arroz blanco, Frijoles tiernos con vainicas, Tortilla',
    bebida: 'Fresco de cas natural',
    fruta: 'Piña picada',
  },
  {
    fecha: '2026-09-09',
    plato: 'Pescado empanizado crujiente',
    acompanamiento: 'Arroz con maíz dulce, Ensalada caribeña de repollo',
    bebida: 'Limonada natural',
    fruta: 'Mango maduro',
  },
  {
    fecha: '2026-09-10',
    plato: 'Arroz guisado con carne de cerdo',
    acompanamiento: 'Frijoles molidos, Plátano maduro horneado, Ensalada de pepino',
    bebida: 'Agua pura',
    fruta: 'Melón picado',
  },
  {
    fecha: '2026-09-11',
    plato: 'Sopa de pollo completa con verduras',
    acompanamiento: 'Arroz blanco, Aguacate y dos tortillas de maíz',
    bebida: 'Fresco de horchata',
    fruta: 'Mandarina',
  },

  // --- Semana del 14 de setiembre ---
  {
    fecha: '2026-09-14',
    plato: 'Fajitas de pechuga de pollo salteadas con chile y cebolla',
    acompanamiento: 'Tortillas de trigo para tacos, Frijoles negros enteros, Ensalada criolla',
    bebida: 'Té frío',
    fruta: 'Piña',
  },
  // 15 de setiembre — feriado, sin servicio de comedor.
  {
    fecha: '2026-09-16',
    plato: 'Carne mechada de res en salsa criolla',
    acompanamiento: 'Arroz blanco, Ensalada de repollo blanco con culantro y limón',
    bebida: 'Fresco de maracuyá',
    fruta: 'Banano',
  },
  {
    fecha: '2026-09-17',
    plato: 'Pescado fresco frito al limón',
    acompanamiento: 'Papas fritas crujientes, Ensalada mixta tradicional',
    bebida: 'Té helado de limón',
    fruta: 'Papaya dulce',
  },
  {
    fecha: '2026-09-18',
    plato: 'Arroz con carne de cerdo picada y maíz dulce',
    acompanamiento: 'Ensalada rusa con remolacha y papa, Chips de plátano',
    bebida: 'Agua pura',
    fruta: 'Sandía',
  },

  // --- Semana del 21 de setiembre ---
  {
    fecha: '2026-09-21',
    plato: 'Garbanzos con pollo desmechado y papa',
    acompanamiento: 'Arroz blanco, Ensalada fresca de lechuga, repollo y remolacha',
    bebida: 'Fresco de frutas',
    fruta: 'Manzana verde',
  },
  {
    fecha: '2026-09-22',
    plato: 'Frijoles blancos con pollo desmechado, zanahoria o chayote',
    acompanamiento: 'Arroz blanco. Aderezo: Vinagreta de vegetales',
    bebida: 'Agua pura',
    fruta: 'Banano',
  },
  {
    fecha: '2026-09-23',
    plato: 'Pasta de cerdo en salsa criolla con papas',
    acompanamiento: 'Arroz blanco, Frijoles negros frescos, Repollo blanco con zanahoria',
    bebida: 'Agua pura',
    fruta: 'Papaya / Melón',
  },
  {
    fecha: '2026-09-24',
    plato: 'Pescado empanizado (con limón en rodaja)',
    acompanamiento:
      'Arroz blanco, Frijoles negros frescos, Lechuga y tomate. Aderezo: Vinagreta básica',
    bebida: 'Agua pura',
    fruta: 'Sandía',
  },
  {
    fecha: '2026-09-25',
    plato: 'Arroz mixto de pollo, cerdo y huevo con cebollino y zanahoria',
    acompanamiento: 'Frijoles molidos, Pepino en medias lunas y guacamole',
    bebida: 'Agua pura',
    fruta: 'Piña',
  },

  // --- Semana del 28 de setiembre ---
  {
    fecha: '2026-09-28',
    plato: 'Olla de carne con verduras variadas',
    acompanamiento: 'Verduras de olla (Sopa completa con yuca, elote, plátano y papa)',
    bebida: 'Agua pura',
    fruta: 'Manzana',
  },
  {
    fecha: '2026-09-29',
    plato: 'Pollo al horno marinado con hierbas frescas',
    acompanamiento: 'Puré de papas cremoso con ajo, Vainicas salteadas con mantequilla',
    bebida: 'Té frío',
    fruta: 'Mandarina dulce',
  },
  {
    fecha: '2026-09-30',
    plato: 'Carne mechada en salsa con pimientos y cebolla',
    acompanamiento: 'Arroz con vegetales, Frijoles colorados frescos, Chips de yuca',
    bebida: 'Fresco de avena fría',
    fruta: 'Mango picado',
  },
  {
    fecha: '2026-10-01',
    plato: 'Tacos de pescado al estilo ensenada',
    acompanamiento: 'Repollo morado rallado, Salsa de yogur y limón, Tortillas de maíz',
    bebida: 'Limonada con menta',
    fruta: 'Piña dulce',
  },
  {
    fecha: '2026-10-02',
    plato: 'Estofado de res en salsa de tomate con zanahoria y papa',
    acompanamiento: 'Arroz blanco, Frijoles negros frescos, Tortilla de maíz palmada',
    bebida: 'Agua pura',
    fruta: 'Papaya',
  },
]
