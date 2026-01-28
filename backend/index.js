import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fetch from 'node-fetch';
import sgMail from '@sendgrid/mail';
import twilio from 'twilio';

dotenv.config();

const app = express();
app.use(express.json());

let db;
async function connectDB() {
  try {
    db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    // Testa conexão
    await db.query('SELECT 1');
    console.log('Conexão com banco de dados estabelecida.');
  } catch (err) {
    console.error('Erro ao conectar no banco de dados:', err);
    process.exit(1);
  }
}

connectDB();

app.post('/webhook/telegram', async (req, res) => {
  const update = req.body;
  if (update.message) {
    const { message_id, from, chat, text, date } = update.message;
    try {
      await db.query(
        'INSERT INTO telegram_messages (message_id, user_id, chat_id, text, date) VALUES (?, ?, ?, ?, ?)',
        [message_id, from.id, chat.id, text, new Date(date * 1000)]
      );
      console.log('Mensagem salva:', { message_id, user_id: from.id, chat_id: chat.id });
    } catch (err) {
      console.error('Erro ao salvar mensagem:', err);
    }
  }
  res.sendStatus(200);
});

// Webhook WhatsApp Cloud API (recebimento)
app.post('/webhook/whatsapp', async (req, res) => {
  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];

  if (!message) return res.sendStatus(200);

  try {
    const from = message.from;
    const content = message.text?.body || '[unsupported message]';
    const ts = new Date(Number(message.timestamp) * 1000);

    // Upsert lead by phone
    await db.query(
      'INSERT IGNORE INTO leads (phone, name, source, stage, created_at) VALUES (?, ?, ?, ?, NOW())',
      [from, message.profile?.name || 'WhatsApp', 'whatsapp', 'new']
    );

    // Store message in messages table (MySQL mirror)
    await db.query(
      'INSERT INTO messages (conversation_id, direction, content, created_at) VALUES (?, ?, ?, ?)',
      [message.id, 'in', content, ts]
    );
  } catch (err) {
    console.error('Erro ao processar webhook WhatsApp:', err);
  }
  res.sendStatus(200);
});

// Envio simplificado via WhatsApp Cloud API
app.post('/api/send-whatsapp', async (req, res) => {
  const { to, text, template } = req.body;
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneNumberId) {
    return res.status(500).json({ error: 'Credenciais WhatsApp faltando' });
  }

  const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
  const payload = template ? {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: template,
      language: { code: 'pt_BR' }
    }
  } : {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text }
  };

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || 'Falha WhatsApp');
    res.json({ success: true, data });
  } catch (err) {
    console.error('Envio WhatsApp falhou', err);
    res.status(500).json({ error: err.message });
  }
});

// Email (SendGrid)
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

app.post('/api/send-email', async (req, res) => {
  const { to, subject, text } = req.body;
  if (!process.env.SENDGRID_API_KEY) return res.status(500).json({ error: 'SENDGRID_API_KEY ausente' });
  try {
    await sgMail.send({ to, from: process.env.MAIL_FROM || 'no-reply@example.com', subject, text });
    res.json({ success: true });
  } catch (err) {
    console.error('Email falhou', err);
    res.status(500).json({ error: err.message });
  }
});

// SMS (Twilio)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

app.post('/api/send-sms', async (req, res) => {
  const { to, text } = req.body;
  if (!twilioClient || !process.env.TWILIO_PHONE_FROM) return res.status(500).json({ error: 'Twilio não configurado' });
  try {
    await twilioClient.messages.create({ body: text, from: process.env.TWILIO_PHONE_FROM, to });
    res.json({ success: true });
  } catch (err) {
    console.error('SMS falhou', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Backend do ConectaLeads rodando!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
