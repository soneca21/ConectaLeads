#!/bin/bash
# Script de deploy automatizado para ConectaLeads
# Uso: ./deploy.sh

set -e

echo "== Gerando build do frontend =="
echo "== Copiando build para pasta pública (exemplo: public_html) =="

echo "== Copiando build do frontend (dist/) para pasta pública (exemplo: public_html) =="
# Altere o caminho abaixo conforme sua hospedagem
cp -r dist/* ../public_html/

echo "== Instalando dependências do backend =="
cd backend
npm install

# Permissão para binários (caso necessário)
chmod +x ../node_modules/.bin/* || true

cd ..
echo "== Deploy concluído! =="
echo "Lembre-se de configurar o .env do backend e criar a tabela no banco."
