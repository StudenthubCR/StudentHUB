/**
 * Send Email Hook de Supabase Auth.
 *
 * Supabase deja de mandar los correos y llama a esta función. Eso resuelve dos
 * cosas de un golpe:
 *
 *  1. Evita la restricción del panel, que no deja editar las plantillas sin
 *     SMTP propio. Aquí el contenido lo armamos nosotros.
 *  2. Manda un código de 6 dígitos y no un enlace mágico, que es lo que pide
 *     el plan (§10): el navegador interno de Outlook rompe la sesión de la PWA.
 *
 * Secretos que hay que configurar en Supabase (Edge Functions → Secrets):
 *   RESEND_API_KEY        clave de la cuenta de Resend
 *   SEND_EMAIL_HOOK_SECRET  el que genera Supabase al crear el hook
 *   REMITENTE             de dónde sale el correo
 *
 * Sin dominio propio verificado, Resend sólo entrega a la dirección de la
 * cuenta. Alcanza para probar; para los estudiantes hace falta el dominio.
 */
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const HOOK_SECRET = Deno.env.get('SEND_EMAIL_HOOK_SECRET')!
const REMITENTE = Deno.env.get('REMITENTE') ?? 'Student HUB <onboarding@resend.dev>'

type PayloadDelHook = {
  user: { email: string }
  email_data: {
    token: string
    email_action_type: string
  }
}

/** El correo. Texto corto: lo único que importa es el código. */
function cuerpo(codigo: string): string {
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:32px;background:#f3f6fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0c142c">
    <table role="presentation" style="max-width:420px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px">
      <tr><td>
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#5c6b8f">Student HUB</p>
        <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3">Tu código para entrar</h1>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#5c6b8f">
          Escribí este código en la app. Vence en unos minutos y sirve una sola vez.
        </p>
        <p style="margin:0 0 24px;padding:16px;background:#eaf0fb;border-radius:14px;text-align:center;font-size:32px;font-weight:700;letter-spacing:.3em;color:#0130B2">
          ${codigo}
        </p>
        <p style="margin:0;font-size:12px;line-height:1.6;color:#5c6b8f">
          Si no pediste este código, ignorá el mensaje: sin él nadie puede entrar a tu cuenta.
        </p>
      </td></tr>
    </table>
  </body>
</html>`
}

Deno.serve(async (peticion) => {
  if (peticion.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const crudo = await peticion.text()

  // El endpoint es público, así que hay que comprobar que quien llama es
  // Supabase de verdad. Sin esto, cualquiera podría dispararnos correos.
  let payload: PayloadDelHook
  try {
    const cabeceras = Object.fromEntries(peticion.headers)
    const verificador = new Webhook(HOOK_SECRET.replace('v1,whsec_', ''))
    payload = verificador.verify(crudo, cabeceras) as PayloadDelHook
  } catch {
    return new Response(JSON.stringify({ error: 'Firma inválida' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const destinatario = payload.user.email
  const codigo = payload.email_data.token

  const respuesta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: REMITENTE,
      to: [destinatario],
      subject: `${codigo} es tu código de Student HUB`,
      html: cuerpo(codigo),
    }),
  })

  if (!respuesta.ok) {
    const detalle = await respuesta.text()
    console.error('Resend rechazó el envío:', respuesta.status, detalle)
    // Devolver el error en el formato que Supabase entiende hace que el
    // mensaje llegue a la app en vez de morir en los logs.
    return new Response(
      JSON.stringify({ error: { http_code: respuesta.status, message: 'No se pudo enviar el correo.' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return new Response('{}', { headers: { 'Content-Type': 'application/json' } })
})
