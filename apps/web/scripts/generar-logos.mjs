import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { stat, mkdir, writeFile, copyFile, readdir } from 'node:fs/promises'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../../..')
const ASSETS = join(ROOT, 'assets')
const PUBLIC = join(ROOT, 'apps/web/public')
const INPUT_LOGO = join(ROOT, 'StudentHUB_ Logo.png')

console.log('--- GENERADOR DE LOGOS Y ACTIVOS STUDENTHUB ---')
console.log('Archivo de origen:', INPUT_LOGO)
console.log('Directorio de destino (Assets):', ASSETS)
console.log('Directorio de destino (Public):', PUBLIC)

async function generarActivos() {
  const meta = await sharp(INPUT_LOGO).metadata()
  console.log(`Dimensiones de origen: ${meta.width}x${meta.height}, canales: ${meta.channels}`)

  // 1. Extraer los datos RAW del archivo completo
  const { data, info } = await sharp(INPUT_LOGO).raw().toBuffer({ resolveWithObject: true })

  // Coordenadas calculadas para el contenido del logo:
  // Icono: x = 513..933 (ancho 421), y = 293..656 (alto 364)
  // Texto: x = 336..1111 (ancho 776), y = 672..782 (alto 111)
  const ICON_RECT = { left: 513, top: 293, width: 421, height: 364 }
  const TEXT_RECT = { left: 336, top: 672, width: 776, height: 111 }
  const FULL_RECT = { left: 336, top: 293, width: 776, height: 490 }

  // Función para procesar píxeles de una región con des-premultiplicación alfa perfecta
  function extraerRegionConAlfa(rect, esTexto = false, modoOscuro = false) {
    const rgba = Buffer.alloc(rect.width * rect.height * 4)

    for (let y = 0; y < rect.height; y++) {
      for (let x = 0; x < rect.width; x++) {
        const srcX = rect.left + x
        const srcY = rect.top + y
        const srcIdx = (srcY * info.width + srcX) * info.channels
        const dstIdx = (y * rect.width + x) * 4

        const r = data[srcIdx]
        const g = data[srcIdx + 1]
        const b = data[srcIdx + 2]

        if (esTexto) {
          // El texto es carbón oscuro sobre blanco
          const minC = Math.min(r, g, b)
          const avgC = (r + g + b) / 3

          if (minC >= 248) {
            rgba[dstIdx + 3] = 0 // Transparente
          } else {
            const alpha = Math.min(255, Math.max(0, Math.round(255 - avgC)))
            if (modoOscuro) {
              // Modo oscuro: texto blanco puro con alfa suave
              rgba[dstIdx] = 255
              rgba[dstIdx + 1] = 255
              rgba[dstIdx + 2] = 255
              rgba[dstIdx + 3] = alpha
            } else {
              // Modo claro: texto carbón oscuro (#242425) con alfa suave
              rgba[dstIdx] = 36
              rgba[dstIdx + 1] = 36
              rgba[dstIdx + 2] = 37
              rgba[dstIdx + 3] = alpha
            }
          }
        } else {
          // Icono: azul institucional (#0032b8 / #0130b2) sobre blanco
          const minRG = Math.min(r, g)
          if (r >= 248 && g >= 248 && b >= 248) {
            rgba[dstIdx + 3] = 0 // Transparente
          } else {
            // Alfa basado en la saturación respecto al blanco
            const alpha = Math.min(255, Math.max(0, Math.round(255 - minRG)))
            if (alpha > 0) {
              // Des-premultiplicar el blanco para eliminar halos
              const aNorm = alpha / 255
              const unR = Math.min(255, Math.max(0, Math.round((r - 255 * (1 - aNorm)) / aNorm)))
              const unG = Math.min(255, Math.max(0, Math.round((g - 255 * (1 - aNorm)) / aNorm)))
              const unB = Math.min(255, Math.max(0, Math.round((b - 255 * (1 - aNorm)) / aNorm)))

              rgba[dstIdx] = unR
              rgba[dstIdx + 1] = unG
              rgba[dstIdx + 2] = unB
              rgba[dstIdx + 3] = alpha
            } else {
              rgba[dstIdx + 3] = 0
            }
          }
        }
      }
    }
    return rgba
  }

  // Extraer buffers RGBA
  const iconRgba = extraerRegionConAlfa(ICON_RECT, false, false)
  const textRgbaClaro = extraerRegionConAlfa(TEXT_RECT, true, false)
  const textRgbaOscuro = extraerRegionConAlfa(TEXT_RECT, true, true)

  // 2. Crear buffers Sharp de los componentes individuales
  const iconSharp = sharp(iconRgba, {
    raw: { width: ICON_RECT.width, height: ICON_RECT.height, channels: 4 }
  })
  const textClaroSharp = sharp(textRgbaClaro, {
    raw: { width: TEXT_RECT.width, height: TEXT_RECT.height, channels: 4 }
  })
  const textOscuroSharp = sharp(textRgbaOscuro, {
    raw: { width: TEXT_RECT.width, height: TEXT_RECT.height, channels: 4 }
  })

  // -------------------------------------------------------------
  // ÍCONO AISLADO TRANSPARENTE (Para Componente Logo y Cabeceras)
  // -------------------------------------------------------------
  await iconSharp.clone().webp({ quality: 95 }).toFile(join(ASSETS, 'studenthub-icon.webp'))
  await iconSharp.clone().png({ compressionLevel: 9 }).toFile(join(ASSETS, 'studenthub-icon.png'))
  console.log('[OK] Generado studenthub-icon.webp / .png (Ícono transparente aislado)')

  // -------------------------------------------------------------
  // VARIANTES HORIZONTALES (Para Cabeceras, Login, Expo Navbar)
  // -------------------------------------------------------------
  // Escalamos el ícono a altura 120px y el texto a altura 86px
  const targetIconH = 120
  const iconResized = await sharp(iconRgba, {
    raw: { width: ICON_RECT.width, height: ICON_RECT.height, channels: 4 }
  })
    .resize({ height: targetIconH })
    .png()
    .toBuffer({ resolveWithObject: true })

  const targetTextH = 86
  const textClaroResized = await textClaroSharp
    .resize({ height: targetTextH })
    .png()
    .toBuffer({ resolveWithObject: true })

  const textOscuroResized = await textOscuroSharp
    .resize({ height: targetTextH })
    .png()
    .toBuffer({ resolveWithObject: true })

  const gapH = 24
  const horizW = iconResized.info.width + gapH + textClaroResized.info.width
  const horizH = Math.max(iconResized.info.height, textClaroResized.info.height)
  const iconY = Math.round((horizH - iconResized.info.height) / 2)
  const textY = Math.round((horizH - textClaroResized.info.height) / 2)

  // Horizontal Claro
  const horizClaroImg = sharp({
    create: { width: horizW, height: horizH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  }).composite([
    { input: iconResized.data, left: 0, top: iconY },
    { input: textClaroResized.data, left: iconResized.info.width + gapH, top: textY }
  ])

  await horizClaroImg.clone().png({ compressionLevel: 9 }).toFile(join(ASSETS, 'studenthub-logo.png'))
  await horizClaroImg.clone().webp({ quality: 95 }).toFile(join(ASSETS, 'studenthub-logo.webp'))
  // Retrocompatibilidad con SHlarge.webp
  await horizClaroImg.clone().webp({ quality: 95 }).toFile(join(ASSETS, 'SHlarge.webp'))
  console.log('[OK] Generado studenthub-logo.webp / .png y SHlarge.webp (Horizontal Claro)')

  // Horizontal Oscuro (Texto blanco puro)
  const horizOscuroImg = sharp({
    create: { width: horizW, height: horizH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  }).composite([
    { input: iconResized.data, left: 0, top: iconY },
    { input: textOscuroResized.data, left: iconResized.info.width + gapH, top: textY }
  ])

  await horizOscuroImg.clone().png({ compressionLevel: 9 }).toFile(join(ASSETS, 'studenthub-logo-dark.png'))
  await horizOscuroImg.clone().webp({ quality: 95 }).toFile(join(ASSETS, 'studenthub-logo-dark.webp'))
  console.log('[OK] Generado studenthub-logo-dark.webp / .png (Horizontal Oscuro)')

  // -------------------------------------------------------------
  // VARIANTES VERTICALES (Para portadas, Ficha técnica, etc.)
  // -------------------------------------------------------------
  const vertW = FULL_RECT.width
  const vertH = FULL_RECT.height
  const iconCenterX = Math.round((vertW - ICON_RECT.width) / 2)
  const iconBufOriginal = await iconSharp.png().toBuffer()
  const textClaroBufOriginal = await textClaroSharp.png().toBuffer()
  const textOscuroBufOriginal = await textOscuroSharp.png().toBuffer()

  // Vertical Claro
  const vertClaroImg = sharp({
    create: { width: vertW, height: vertH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  }).composite([
    { input: iconBufOriginal, left: iconCenterX, top: 0 },
    { input: textClaroBufOriginal, left: 0, top: 379 }
  ])
  await vertClaroImg.clone().webp({ quality: 95 }).toFile(join(ASSETS, 'studenthub-logo-vertical.webp'))
  await vertClaroImg.clone().png({ compressionLevel: 9 }).toFile(join(ASSETS, 'studenthub-logo-vertical.png'))
  console.log('[OK] Generado studenthub-logo-vertical.webp / .png (Vertical Claro)')

  // Vertical Oscuro
  const vertOscuroImg = sharp({
    create: { width: vertW, height: vertH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  }).composite([
    { input: iconBufOriginal, left: iconCenterX, top: 0 },
    { input: textOscuroBufOriginal, left: 0, top: 379 }
  ])
  await vertOscuroImg.clone().webp({ quality: 95 }).toFile(join(ASSETS, 'studenthub-logo-vertical-dark.webp'))
  await vertOscuroImg.clone().png({ compressionLevel: 9 }).toFile(join(ASSETS, 'studenthub-logo-vertical-dark.png'))
  console.log('[OK] Generado studenthub-logo-vertical-dark.webp / .png (Vertical Oscuro)')

  // -------------------------------------------------------------
  // ÍCONOS DE LA PWA Y APPLE TOUCH ICON
  // -------------------------------------------------------------
  // Los íconos de la PWA y Apple Touch contienen la marca nítida (libro + birrete)
  // sobre fondo blanco limpio `#ffffff`.
  const iconSquareSpecs = [
    { destino: 'pwa-192x192.png', alias: 'icon-192.png', lado: 192, ladoMarca: 140 },
    { destino: 'pwa-512x512.png', alias: 'icon-512.png', lado: 512, ladoMarca: 370 },
    { destino: 'pwa-maskable-512x512.png', alias: 'icon-maskable-512.png', lado: 512, ladoMarca: 290 }, // 20% margen Android
    { destino: 'apple-touch-icon.png', lado: 180, ladoMarca: 132 },
  ]

  for (const spec of iconSquareSpecs) {
    const iconScaled = await sharp(iconRgba, {
      raw: { width: ICON_RECT.width, height: ICON_RECT.height, channels: 4 }
    })
      .resize({
        width: spec.ladoMarca,
        height: spec.ladoMarca,
        fit: 'inside'
      })
      .png()
      .toBuffer({ resolveWithObject: true })

    const left = Math.round((spec.lado - iconScaled.info.width) / 2)
    const top = Math.round((spec.lado - iconScaled.info.height) / 2)

    const squareBuf = await sharp({
      create: {
        width: spec.lado,
        height: spec.lado,
        channels: 4,
        background: '#ffffff'
      }
    })
      .composite([{ input: iconScaled.data, left, top }])
      .png({ compressionLevel: 9 })
      .toBuffer()

    await writeFile(join(ASSETS, spec.destino), squareBuf)
    if (spec.alias) {
      await writeFile(join(ASSETS, spec.alias), squareBuf)
    }

    const stats = await stat(join(ASSETS, spec.destino))
    console.log(`[OK] Generado ${spec.destino}: ${spec.lado}x${spec.lado} px (${Math.round(stats.size / 1024)} KB)`)
  }

  // -------------------------------------------------------------
  // FAVICONS (Transparentes para pestaña de navegador: 16x16, 32x32, 48x48 y .ico)
  // -------------------------------------------------------------
  async function generarFaviconPng(lado, ladoMarca) {
    const iconScaled = await sharp(iconRgba, {
      raw: { width: ICON_RECT.width, height: ICON_RECT.height, channels: 4 }
    })
      .resize({ width: ladoMarca, height: ladoMarca, fit: 'inside' })
      .png()
      .toBuffer({ resolveWithObject: true })

    const left = Math.round((lado - iconScaled.info.width) / 2)
    const top = Math.round((lado - iconScaled.info.height) / 2)

    return sharp({
      create: {
        width: lado,
        height: lado,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: iconScaled.data, left, top }])
      .png({ compressionLevel: 9 })
      .toBuffer()
  }

  const fav16Buf = await generarFaviconPng(16, 16)
  const fav32Buf = await generarFaviconPng(32, 30)
  const fav48Buf = await generarFaviconPng(48, 44)

  await writeFile(join(ASSETS, 'favicon-16x16.png'), fav16Buf)
  await writeFile(join(ASSETS, 'favicon-32x32.png'), fav32Buf)
  await writeFile(join(ASSETS, 'favicon-48x48.png'), fav48Buf)
  await writeFile(join(ASSETS, 'favicon.png'), fav32Buf)
  console.log('[OK] Generados favicon.png, favicon-16x16.png, favicon-32x32.png, favicon-48x48.png (Transparentes)')

  // Empaquetador estándar de favicon.ico binario (16x16, 32x32, 48x48)
  function crearIco(imagenes) {
    const count = imagenes.length
    const headerLen = 6 + count * 16
    let totalSize = headerLen
    for (const img of imagenes) {
      totalSize += img.buffer.length
    }
    const ico = Buffer.alloc(totalSize)
    ico.writeUInt16LE(0, 0) // Reserved
    ico.writeUInt16LE(1, 2) // Type: 1 = ICO
    ico.writeUInt16LE(count, 4) // Número de imágenes

    let offset = headerLen
    for (let i = 0; i < count; i++) {
      const img = imagenes[i]
      const entryOffset = 6 + i * 16
      ico.writeUInt8(img.width >= 256 ? 0 : img.width, entryOffset)
      ico.writeUInt8(img.height >= 256 ? 0 : img.height, entryOffset + 1)
      ico.writeUInt8(0, entryOffset + 2) // Color palette
      ico.writeUInt8(0, entryOffset + 3) // Reserved
      ico.writeUInt16LE(1, entryOffset + 4) // Color planes
      ico.writeUInt16LE(32, entryOffset + 6) // Bits per pixel
      ico.writeUInt32LE(img.buffer.length, entryOffset + 8) // Tamaño de datos de imagen
      ico.writeUInt32LE(offset, entryOffset + 12) // Offset en archivo
      img.buffer.copy(ico, offset)
      offset += img.buffer.length
    }
    return ico
  }

  const icoBuf = crearIco([
    { width: 16, height: 16, buffer: fav16Buf },
    { width: 32, height: 32, buffer: fav32Buf },
    { width: 48, height: 48, buffer: fav48Buf },
  ])
  await writeFile(join(ASSETS, 'favicon.ico'), icoBuf)
  console.log('[OK] Generado favicon.ico (Multi-resolución 16, 32, 48)')

  // -------------------------------------------------------------
  // SINCRONIZACIÓN A apps/web/public/
  // -------------------------------------------------------------
  await mkdir(PUBLIC, { recursive: true })
  const archivos = await readdir(ASSETS)
  for (const f of archivos) {
    await copyFile(join(ASSETS, f), join(PUBLIC, f))
  }
  console.log(`[OK] Sincronizados ${archivos.length} archivos a apps/web/public/`)
  console.log('--- GENERACIÓN DE ACTIVOS COMPLETADA CON ÉXITO ---')
}

generarActivos().catch((err) => {
  console.error('[ERROR]', err)
  process.exit(1)
})
