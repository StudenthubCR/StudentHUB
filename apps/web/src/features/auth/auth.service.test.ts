import { describe, expect, it } from 'vitest'
import {
  codigoCompleto,
  correoValido,
  dominioDe,
  dominioPermitido,
  normalizarCorreo,
  soloDigitos,
} from './auth.service'

describe('normalizarCorreo', () => {
  it('limpia espacios y convierte a minúsculas', () => {
    expect(normalizarCorreo('  Estudiante@MEP.go.cr ')).toBe('estudiante@mep.go.cr')
  })
})

describe('correoValido', () => {
  it('acepta formatos de correo válidos', () => {
    expect(correoValido('estudiante@mep.go.cr')).toBe(true)
    expect(correoValido('juan.perez@gmail.com')).toBe(true)
  })

  it('rechaza correos mal formateados', () => {
    expect(correoValido('sin-arroba.com')).toBe(false)
    expect(correoValido('@sin-usuario.com')).toBe(false)
    expect(correoValido('incompleto@')).toBe(false)
    expect(correoValido('')).toBe(false)
  })
})

describe('dominioDe', () => {
  it('extrae el dominio después del arroba', () => {
    expect(dominioDe('estudiante@mep.go.cr')).toBe('mep.go.cr')
    expect(dominioDe('sin-arroba')).toBe('')
  })
})

describe('dominioPermitido', () => {
  it('permite cualquier dominio si el dominio permitido es null', () => {
    expect(dominioPermitido('estudiante@gmail.com', null)).toBe(true)
  })

  it('valida coincidencia de dominio', () => {
    expect(dominioPermitido('estudiante@mep.go.cr', 'mep.go.cr')).toBe(true)
    expect(dominioPermitido('estudiante@otro.com', 'mep.go.cr')).toBe(false)
  })
})

describe('soloDigitos y codigoCompleto', () => {
  it('filtra caracteres no numéricos y trunca al máximo permitido', () => {
    expect(soloDigitos(' 1a2-3.4 5 6 ')).toBe('123456')
    expect(soloDigitos('12345678901234')).toBe('1234567890')
  })

  it('valida que el código cumpla el largo mínimo', () => {
    expect(codigoCompleto('12345')).toBe(false)
    expect(codigoCompleto('123456')).toBe(true)
    expect(codigoCompleto('12345678')).toBe(true)
  })
})
