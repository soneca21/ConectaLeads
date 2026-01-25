# Backend ConectaLeads

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie o arquivo `.env.example` para `.env` e preencha com os dados do seu banco e token do Telegram.
3. Crie a tabela no seu banco MySQL:
   ```sql
   CREATE TABLE telegram_messages (
     id INT AUTO_INCREMENT PRIMARY KEY,
     message_id BIGINT,
     user_id BIGINT,
     chat_id BIGINT,
     text TEXT,
     date DATETIME
   );
   ```
4. Inicie o servidor:
   ```bash
   npm start
   ```

## Deploy
- Suba a pasta `backend/` para sua hospedagem Node.js na Hostinger.
- Configure as variáveis de ambiente.
- Aponte o webhook do Telegram para `https://seu-dominio.com/webhook/telegram`.

## Observações
- O frontend (React/Supabase) continua separado.
- O backend pode ser expandido para processar comandos, responder mensagens, etc.
