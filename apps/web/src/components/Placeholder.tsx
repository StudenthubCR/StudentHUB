/** Pantalla en construcción para las secciones que aún no se portan. */
export function Placeholder({ descripcion }: { descripcion: string }) {
  return (
    <div
      className={
        'rounded-lg border border-border bg-surface p-8 text-center elev-md ' +
        'lg:p-12'
      }
    >
      <p className="text-sm font-semibold text-primary">Próximamente</p>
      <p className="mt-2 text-sm text-text-muted">{descripcion}</p>
      <p className="mt-4 text-xs text-text-muted">
        Mientras tanto sigue disponible en la versión actual de Student HUB.
      </p>
    </div>
  )
}
