import { readdir, stat } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

/**
 * Genera versiones optimizadas de las imágenes de `assets/`.
 *
 * No toca los originales: los PNG y los SVG se quedan donde están porque la
 * app de la raíz —la que hoy está en producción— los referencia por nombre, y
 * porque son la copia con los datos de origen (C2PA) intactos. Lo que se
 * genera aquí son copias derivadas, y sólo la app nueva las usa.
 *
 *   npm run optimizar-imagenes
 */
const ASSETS = fileURLToPath(new URL('../../../assets', import.meta.url))

/**
 * Ancho de destino. Se sirven a 430px como mucho, así que el doble cubre las
 * pantallas de densidad 2×.
 */
const FOTOS = { news_: 900, student: 320 }

/**
 * Los logos son SVG de más de 1 MB: un trazado automático con una cantidad
 * enorme de nodos, no metadata (SVGO apenas les saca un 3%). Rasterizarlos al
 * tamaño en que se ven deja el mismo dibujo pesando dos órdenes de magnitud
 * menos. El SVG original se queda para la app de la raíz.
 */
const LOGOS = [
  { origen: 'SHlarge.svg', destino: 'SHlarge.webp', ancho: 704 },
  { origen: 'SHlogo.svg', destino: 'SHlogo.png', ancho: 512 },
]

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`

function anchoDe(nombre) {
  const regla = Object.entries(FOTOS).find(([prefijo]) => nombre.startsWith(prefijo))
  return regla ? regla[1] : null
}

let antes = 0
let despues = 0

async function reportar(origen, destino) {
  const original = (await stat(origen)).size
  const nuevo = (await stat(destino)).size
  antes += original
  despues += nuevo
  console.log(`${basename(origen)}: ${kb(original)} → ${kb(nuevo)}`)
}

// --- Fotos y afiches ---
for (const archivo of await readdir(ASSETS)) {
  if (extname(archivo).toLowerCase() !== '.png') continue
  const ancho = anchoDe(archivo)
  if (ancho === null) continue

  const origen = join(ASSETS, archivo)
  const destino = join(ASSETS, `${basename(archivo, extname(archivo))}.webp`)

  await sharp(origen)
    .resize({ width: ancho, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(destino)

  await reportar(origen, destino)
}

// --- Logos ---
for (const { origen, destino, ancho } of LOGOS) {
  const entrada = join(ASSETS, origen)
  const salida = join(ASSETS, destino)

  // `density` alto para que el rasterizado del SVG salga nítido.
  const imagen = sharp(entrada, { density: 300 }).resize({ width: ancho, withoutEnlargement: false })
  await (destino.endsWith('.png') ? imagen.png({ compressionLevel: 9 }) : imagen.webp({ quality: 90 })).toFile(salida)

  await reportar(entrada, salida)
}

console.log(`\nTotal: ${kb(antes)} → ${kb(despues)} (${Math.round((1 - despues / antes) * 100)}% menos)`)
