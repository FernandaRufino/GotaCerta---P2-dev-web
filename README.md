# GotaCerta — Simulador de Irrigação para Pequenos Produtores

Protótipo funcional desenvolvido para a disciplina de **Desenvolvimento Web I (Tecnologia Cidadã)** — FATEC Diadema · DSM · 2026.

## Objetivo da Solução
Apoiar pequenos produtores e agricultores familiares no manejo de irrigação de hortaliças em canteiros, permitindo simular leituras de umidade do solo e automatizar o acionamento de bombas com base nos limites mínimo e máximo configurados para cada cultura.

## Tecnologias Utilizadas
- HTML5 semântico
- CSS3 (Abordagem Mobile First, Flexbox, CSS Grid e Media Queries para 390px, 768px e 1280px; fontes Playfair Display SC e Manrope)
- JavaScript (ES6+, manipulação segura do DOM via `textContent`, validações e `try/catch`)
- Bootstrap 5.3 (Navbar responsiva e estrutura de cards)
- Mozilla `pdf.js` (Leitura local de PDF no navegador)

## Manual de uso

> O GotaCerta por enquanto é uma **simulação**: as leituras de umidade e o acionamento da bomba não são medições reais.

### 1. Começando
Abra `index.html` com o Live Server. O site começa **vazio**: os dados aparecem só depois de cadastrar canteiros ou importar um PDF. Use o menu no topo para navegar entre **Painel**, **Canteiros**, **Registro** e **Sobre**.

### 2. Cadastrar um canteiro
1. Vá em **Canteiros**.
2. Preencha o formulário:
   - **Nome do canteiro** (3 a 40 caracteres) e **Cultura** (3 a 30 caracteres), só com letras, números e pontuação simples.
   - **Umidade atual (%)**: valor simulado, de 0 a 100.
   - **Limite mínimo (%)**: abaixo dele a bomba liga.
   - **Limite máximo (%)**: ao atingi-lo a bomba desliga. O mínimo precisa ser menor que o máximo.
3. Clique em **Salvar canteiro**. Se houver erro, a mensagem aparece na tela e nada é salvo.
4. **Limpar campos** esvazia o formulário.

Use apenas dados fictícios: o site não pede dados pessoais.

### 3. Importar dados de um PDF
1. Em **Canteiros**, arraste o PDF para a área tracejada ou clique em **Escolher arquivo**.
2. O PDF deve ter texto (não pode ser imagem escaneada), até 5 MB, com uma linha por canteiro e as colunas, nesta ordem: **Nome, Cultura, Umidade atual, Limite mínimo, Limite máximo**.
3. A leitura acontece no navegador e nada é enviado a servidores. Linhas inválidas são ignoradas, e o resultado aparece na tela e no Registro.
4. Para testar, use `GotaCerta_demonstracao.pdf` (dados fictícios).

### 4. Editar e remover
Na lista de canteiros, clique em **Editar** para carregar os dados no formulário, altere o que quiser e clique em **Salvar alterações**. Clique em **Remover** e confirme para apagar o canteiro.

### 5. Acompanhar no Painel
O **Painel** mostra o número de canteiros, quantas bombas estão ligadas e a umidade média. Cada canteiro aparece em um card com umidade, limites e o estado da bomba (ligada ou desligada).

### 6. Simular leituras
No **Painel**, clique em **Simular leituras**. A cada clique a umidade muda: sobe nos canteiros com a bomba ligada e cai nos demais. A bomba liga abaixo do limite mínimo e desliga ao atingir o máximo.

### 7. Registro de atividades
A página **Registro** lista data e hora, ação e resultado de cada operação (adicionar, editar, remover, importar, simular e erros). O botão **Limpar registro** apaga só o histórico.
