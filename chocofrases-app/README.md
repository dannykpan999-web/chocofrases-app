# Chocofrases — Sistema de Gestión de Pedidos

Sistema integral de automatización de pedidos por WhatsApp con IA, dashboard web y landing page.

## Estructura del proyecto

```
chocofrases-app/
├── backend/          Node.js + Express API + WhatsApp bot + AI
├── dashboard/        React (Vite) — Panel de control
├── landing/          Next.js — Sitio web público
├── nginx/            Reverse proxy + SSL
├── scripts/          DB schema + deploy script
├── docker-compose.yml
└── .env.example      → Copiar a .env y completar
```

## Requisitos previos

- VPS con Ubuntu 22.04 (Hostinger KVM 2 recomendado)
- Dominio DNS configurado (A records apuntando al VPS)
- Cuentas en: Meta for Developers, OpenAI, Telegram, Airtable, Google Cloud

## Instalación en producción

```bash
git clone <repo> chocofrases-app
cd chocofrases-app
cp .env.example .env
# Editar .env con todas las credenciales
bash scripts/deploy.sh
```

## Desarrollo local

```bash
# 1. Backend
cd backend && npm install
cp ../.env.example .env  # completar
npm run dev

# 2. Dashboard
cd dashboard && npm install
npm run dev   # → http://localhost:5173

# 3. Landing
cd landing && npm install
npm run dev   # → http://localhost:3002
```

## Variables de entorno críticas

Ver `.env.example` para la lista completa. Las más importantes:

| Variable | Descripción |
|---|---|
| `WHATSAPP_TOKEN` | Token de WhatsApp Cloud API |
| `WHATSAPP_VERIFY_TOKEN` | Token personalizado para verificar webhook |
| `OPENAI_API_KEY` | Clave de API de OpenAI |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram |
| `DATABASE_URL` | Conexión a PostgreSQL |

## Configurar el webhook de WhatsApp

1. Ir a Meta for Developers → tu app → WhatsApp → Configuration
2. URL del webhook: `https://api.TUDOMINIO.com.ar/webhooks/whatsapp`
3. Verify token: el valor de `WHATSAPP_VERIFY_TOKEN` en tu `.env`
4. Suscribir a: `messages`

## Configurar el webhook de Telegram

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://api.TUDOMINIO.com.ar/webhooks/telegram"
```

## Login inicial del dashboard

- URL: `https://panel.TUDOMINIO.com.ar`
- Email: `admin@chocofrases.com.ar`
- Contraseña: `changeme123` → **Cambiar inmediatamente**
