# Deploy Automatizado

1. Clone o repositório na sua máquina local:
	```bash
	git clone <url-do-repo>
	```
2. Instale as dependências e gere o build do frontend localmente:
	```bash
	npm install
	npm run build
	```
3. Envie apenas a pasta `dist/` para a pasta pública do seu servidor (ex: `public_html/`).
4. Envie a pasta `backend/` para o servidor (caso use backend Node.js).
5. Edite o arquivo `.env` em `backend/` com os dados do banco e token do Telegram.
6. Crie a tabela no banco MySQL (veja backend/README.md).
7. No servidor, execute:
	```bash
	cd backend
	npm install
	npm start
	```
8. Configure o webhook do Telegram para `https://seu-dominio.com/webhook/telegram`.

**Obs:** O build do frontend deve ser feito localmente. O servidor só precisa da pasta dist/ para o site funcionar. Ajuste o caminho de destino no deploy.sh conforme a estrutura da sua hospedagem.
# ConectaLeads
ConectaLeads
