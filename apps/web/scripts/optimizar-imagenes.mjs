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
const FOTOS = { news_: 900 }

/**
 * Los logos son SVG de más de 1 MB: un trazado automático con una cantidad
 * enorme de nodos, no metadata (SVGO apenas les saca un 3%). Rasterizarlos al
 * tamaño en que se ven deja el mismo dibujo pesando dos órdenes de magnitud
 * menos. El SVG original se queda para la app de la raíz.
 */
const LOGOS = [{ origen: 'SHlarge.svg', destino: 'SHlarge.webp', ancho: 704 }]

/**
 * Íconos de la PWA.
 *
 * Chrome sólo ofrece "Instalar aplicación" si el manifiesto trae al menos un
 * ícono de 192x192 y uno de 512x512, cuadrados y con el tamaño declarado
 * igual al real. Con un ícono que no cumple, ofrece "Agregar acceso directo",
 * que es un simple marcador y no la app instalada.
 *
 * `SHlogo.svg` es la gota sola, pero dibujada sobre un lienzo ancho
 * (264x151.5) con mucho margen transparente alrededor. Sin recortar ese
 * margen, la marca queda diminuta en medio del ícono, así que se hace `trim()`
 * antes de escalar.
 *
 * El `maskable` lleva más margen porque Android le recorta las esquinas con la
 * forma que use el lanzador: la zona segura es el círculo central del 80%, y
 * una marca cuadrada sólo entra ahí si su lado no pasa de unos 290px sobre 512.
 */
const ICONOS = [
  { destino: 'icon-192.png', lado: 192, ladoDeLaMarca: 120 },
  { destino: 'icon-512.png', lado: 512, ladoDeLaMarca: 320 },
  { destino: 'icon-maskable-512.png', lado: 512, ladoDeLaMarca: 280 },
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

// --- Íconos de la PWA ---
for (const { destino, lado, ladoDeLaMarca } of ICONOS) {
  const logo = await sharp(join(ASSETS, 'SHlogo.svg'), { density: 600 })
    .trim() // quita el margen transparente del lienzo del SVG
    .resize({ width: ladoDeLaMarca, height: ladoDeLaMarca, fit: 'inside' })
    .png()
    .toBuffer()

  const salida = join(ASSETS, destino)
  await sharp({
    create: { width: lado, height: lado, channels: 4, background: '#ffffff' },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(salida)

  const { width, height } = await sharp(salida).metadata()
  console.log(`${destino}: ${width}x${height}, ${kb((await stat(salida)).size)}`)
}

console.log(`\nTotal: ${kb(antes)} → ${kb(despues)} (${Math.round((1 - despues / antes) * 100)}% menos)`)
