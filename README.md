# femwpai - Plataforma de Chat con WhatsApp + IA (Supabase)

Este proyecto convierte tu inmobiliaria en una full stack AI company con una app de chat moderna, minimalista y rápida, integrada con WhatsApp Business Cloud API (v23) y funciones Edge en Supabase. Incluye:

- UI web en Next.js 14 + Tailwind CSS (modo oscuro, diseño limpio y productivo)
- Backend sin servidores en Supabase Edge Functions:
  - `whatsapp-webhook`: recepción y verificación de webhooks de WhatsApp
  - `send-message`: envío de mensajes (texto y medios) a WhatsApp
  - `ai-agent`: agente de IA para respuestas automáticas
- Persistencia en Supabase (tablas: contactos, conversaciones, mensajes, adjuntos)
- Almacenamiento de medios en Supabase Storage
- Respuestas automáticas con IA activables/desactivables por conversación

## Requisitos

- Cuenta de Meta (Facebook) con acceso a WhatsApp Business Cloud API (v23)
- Proyecto Supabase (URL, anon key y service role key)
- Node.js 18+
- (Opcional) Supabase CLI para desarrollo local

## Variables de entorno

Crea `.env.local` en la raíz del proyecto a partir de `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

WA_TOKEN=                   # WhatsApp Permanent Access Token
WA_VERIFY_TOKEN=            # Token de verificación del webhook
WA_PHONE_NUMBER_ID=         # phone_number_id del número de WhatsApp
WA_BUSINESS_ID=             # business id (opcional, para futuras extensiones)

OPENAI_API_KEY=             # clave del proveedor de IA (OpenAI compatible)

APP_API_KEY=                # clave simple para proteger funciones Edge internas
```

Guarda los mismos secretos en Supabase (Functions → Secrets) para que las funciones Edge los lean.

## Instalación

1) Instala dependencias:

```
npm install
```

2) Inicializa la base de datos en Supabase:

- Copia el contenido de `supabase/migrations/0001_init.sql` a SQL Editor en Supabase y ejecútalo
- Crea un bucket de Storage llamado `whatsapp-media` (público o usa URLs firmadas)

3) Despliega las funciones Edge (vía Supabase CLI o panel):

- Con CLI (opcional):
  - `supabase functions deploy whatsapp-webhook`
  - `supabase functions deploy send-message`
  - `supabase functions deploy ai-agent`

4) Configura el Webhook en Meta:

- `Callback URL`: `https://<PROJECT_REF>.functions.supabase.co/whatsapp-webhook`
- `Verify Token`: el valor de `WA_VERIFY_TOKEN`
- Suscribe el tema `messages` en WhatsApp
- Asegúrate de usar la versión v23 en tus llamadas a Graph API

5) Ejecuta la app en local:

```
npm run dev
```

Abre `http://localhost:3000`.

## Flujo de trabajo

- WhatsApp → `whatsapp-webhook` (Supabase) → guarda contacto/conversación/mensaje → descarga medios → UI se actualiza en tiempo real
- Envío desde UI → `/api/send` (Next.js, servidor) → `send-message` (Supabase) → WhatsApp
- Agente IA: al recibir mensaje, si `auto_reply_enabled` está activo en la conversación, `whatsapp-webhook` invoca `ai-agent` y éste responde con texto (extensible a medios)

## Notas de seguridad

- Nunca expongas `SUPABASE_SERVICE_ROLE_KEY`, `WA_TOKEN` ni `APP_API_KEY` al cliente; sólo en servidor/funciones
- Usa políticas RLS si vas a multiusuario. Inicialmente el esquema está sin RLS para acelerar el MVP

## Roadmap corto

- Envío de todos los tipos de medios desde UI (texto/audio/video/imagen/documento/sticker/GIF)
- Panel de configuración de prompts del agente y horarios
- Etiquetado y estados de conversaciones (SLA, asignaciones)
- Autenticación de operadores

## Troubleshooting

- Si Meta devuelve 403 en verificación, revisa `WA_VERIFY_TOKEN`
- Si medios no se descargan, valida permisos del bucket y el `WA_TOKEN`
- Si no aparecen mensajes, revisa los logs de la función `whatsapp-webhook` 