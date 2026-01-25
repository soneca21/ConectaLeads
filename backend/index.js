import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

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

app.get('/', (req, res) => {
  res.send('Backend do ConectaLeads rodando!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
