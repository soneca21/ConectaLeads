# Deploy Automatizado

1. Clone o repositório na sua hospedagem:
	```bash
	git clone <url-do-repo>
	```
2. Edite o arquivo `.env` em `backend/` com os dados do banco e token do Telegram.
3. Crie a tabela no banco MySQL (veja backend/README.md).
4. Execute o script de deploy:
	```bash
	chmod +x deploy.sh
	./deploy.sh
	```
5. Configure o webhook do Telegram para `https://seu-dominio.com/webhook/telegram`.

O frontend será copiado para a pasta pública (ex: public_html) e o backend ficará pronto para rodar.

**Obs:** Ajuste o caminho de destino no deploy.sh conforme a estrutura da sua hospedagem.
# ConectaLeads
ConectaLeads
