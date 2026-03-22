const OpenAI = require('openai');
const config = require('../config');
const logger = require('../utils/logger');

const openai = new OpenAI({ apiKey: config.openai.apiKey });

// ─── Parse order from text (informal Argentine Spanish) ───────
const parseOrder = async (text, products) => {
  const productList = products.map(p =>
    `- ${p.name} (SKU: ${p.sku || p.id}, precio: $${p.price}, stock: ${p.stock})`
  ).join('\n');

  const systemPrompt = `Eres el asistente de pedidos de ${config.business.name}, una fábrica argentina de chocolates artesanales.
Tu tarea es interpretar mensajes de pedidos escritos en español rioplatense informal y extraer los productos y cantidades solicitadas.

CATÁLOGO DISPONIBLE:
${productList}

REGLAS:
- Interpretá variaciones informales: "cajita especial", "la de siempre", "el mixto", "2 cajas", etc.
- Si no podés identificar un producto con certeza, incluilo como "producto_desconocido" con el texto original.
- Si el cliente pide algo que no está en el catálogo, indicá que no está disponible.
- Devolvé SOLO JSON válido, sin texto adicional.

FORMATO DE RESPUESTA:
{
  "items": [
    { "product_id": "uuid-o-sku", "product_name": "nombre exacto", "quantity": 2, "unit_price": 1800, "notes": "" }
  ],
  "unknown_items": ["texto que no pude identificar"],
  "total": 3600,
  "confidence": 0.95,
  "summary": "Resumen en una línea del pedido interpretado"
}`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: text },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  try {
    return JSON.parse(res.choices[0].message.content);
  } catch (e) {
    logger.error('parseOrder JSON parse error:', e);
    return { items: [], unknown_items: [text], total: 0, confidence: 0, summary: text };
  }
};

// ─── Transcribe WhatsApp audio (Whisper) ─────────────────────
const transcribeAudio = async (audioBuffer, mimeType) => {
  const ext = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'mp4' : 'mp3';
  const file = new File([audioBuffer], `audio.${ext}`, { type: mimeType });

  const res = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'es',
    prompt: 'Pedido de chocolates en español rioplatense informal',
  });
  return res.text;
};

// ─── Extract order from image (GPT-4o Vision) ─────────────────
const extractFromImage = async (imageBuffer, mimeType) => {
  const base64 = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Esta imagen es un pedido de chocolates de una fábrica argentina.
Extraé todos los productos y cantidades que ves.
Devolvé solo el texto del pedido en español, como si lo hubiera escrito el cliente.
Si no podés leer algo claramente, escribí [ilegible].`,
          },
          { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
        ],
      },
    ],
    max_tokens: 500,
  });
  return res.choices[0].message.content;
};

// ─── Answer FAQ ───────────────────────────────────────────────
const answerFaq = async (question) => {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Eres el asistente de ${config.business.name}. Respondé preguntas frecuentes de forma amigable y breve.
Horario de atención: ${config.business.attendanceStartHour}:00 a ${config.business.attendanceEndHour}:00 hs.
Contacto: ${config.business.email}
Si no sabés la respuesta, decí que vas a consultar con el equipo.`,
      },
      { role: 'user', content: question },
    ],
    max_tokens: 200,
    temperature: 0.7,
  });
  return res.choices[0].message.content;
};

module.exports = { parseOrder, transcribeAudio, extractFromImage, answerFaq };
