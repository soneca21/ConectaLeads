import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
app.use(express.json());

// Conexão com o banco de dados
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Endpoint para receber webhooks do Telegram
app.post('/webhook/telegram', async (req, res) => {
  const update = req.body;
  // Exemplo: salvar mensagem recebida no banco
  if (update.message) {
    const { message_id, from, chat, text, date } = update.message;
    try {
      await db.query(
        'INSERT INTO telegram_messages (message_id, user_id, chat_id, text, date) VALUES (?, ?, ?, ?, ?)',
        [message_id, from.id, chat.id, text, new Date(date * 1000)]
      );
    } catch (err) {
      console.error('Erro ao salvar mensagem:', err);
    }
  }
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.send('Backend do ConectaLeads rodando!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
