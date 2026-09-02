/** Une clases condicionales sin arrastrar una dependencia para tan poco. */
export function cn(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(' ')
}
