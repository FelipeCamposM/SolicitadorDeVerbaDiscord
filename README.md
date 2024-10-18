Aqui está um exemplo de um README.md customizado e visualmente agradável com o uso de emojis, para transmitir a funcionalidade do seu bot de Discord para solicitar verbas ao departamento financeiro e enviar e-mails:

---

# 💸 Discord Bot de Solicitação de Verbas para o Departamento Financeiro

Este é um **bot do Discord** desenvolvido para facilitar o processo de solicitação de verbas para o departamento financeiro. O bot permite que os usuários façam solicitações de verbas diretamente no Discord, preenchendo um formulário com os detalhes necessários. Após a submissão, um e-mail é automaticamente gerado e enviado para o departamento financeiro com as informações da solicitação.

## 📋 Funcionalidades

- 📑 **Formulário de Solicitação**: O bot apresenta um formulário modal para o usuário, onde ele deve preencher os detalhes da solicitação de verba, como motivo, valor, data, e forma de pagamento.
- 📧 **Envio Automático de E-mail**: Após o preenchimento e envio do formulário, o bot gera um e-mail com os detalhes da solicitação e o envia automaticamente ao departamento financeiro.
- 🏷️ **Seletores de Departamento e Prioridade**: O bot permite que o usuário escolha o departamento e a prioridade da solicitação usando menus suspensos (select menus).
- ⚙️ **Fluxo Automatizado**: Todo o processo, desde a criação da solicitação até o envio do e-mail, é totalmente automatizado, garantindo eficiência e agilidade no processo de aprovação de verbas.

## 🚀 Como Funciona

1. O usuário inicia uma solicitação de verba no Discord, clicando em um botão que abre um modal com o formulário.
2. O usuário preenche os campos obrigatórios:
   - **Motivo da Solicitação** 📝
   - **Valor Solicitado** 💰
   - **Data Limite** 📅
   - **E-mail do Solicitante** ✉️
   - **Departamento** 🏢
   - **Prioridade** 🔝
   - **Forma de Pagamento** 💳
3. Após a submissão, o bot verifica os dados e, se estiver tudo correto, envia automaticamente um e-mail formatado para o departamento financeiro com todos os detalhes da solicitação.
4. Caso haja erro nos dados fornecidos, o bot oferece a opção de reabrir o formulário para correção.

## ✨ Exemplo de E-mail Gerado

```markdown
📋 **Detalhes da Solicitação de Verba**

- **Motivo:** Compra de Equipamentos de TI
- **Valor Solicitado:** R$ 10.000,00
- **Data Limite:** 25/10/2024

🏢 **Departamento:** Tecnologia da Informação  
🔝 **Prioridade:** Alta  
🧾 **Prestação de Conta:** Nota Fiscal  
💳 **Forma de Pagamento:** Cartão de Crédito (Danillo)

✅ Este e-mail foi enviado automaticamente.
```

## 🛠️ Tecnologias Utilizadas

- **Node.js** 🟢
- **Discord.js** 🤖
- **Nodemailer** 📧 (para envio de e-mails)
- **Zod** 🔒 (para validação dos dados do formulário)

## 📝 Como Configurar

1. Clone este repositório:

   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie um arquivo `.env` para armazenar suas variáveis de ambiente:

   ```plaintext
   DISCORD_BOT_TOKEN=your-discord-bot-token
   EMAIL_USER=seu-email@example.com
   EMAIL_PASS=sua-senha
   ```

4. Execute o bot:

   ```bash
   npm run start
   ```

## 📬 Contato

Para dúvidas ou sugestões, entre em contato com o responsável:

- **E-mail**: felipe.macedo@r3suprimentos.com.br
- **GitHub**: [Seu GitHub](https://github.com/seu-usuario)

---

Espero que este README ajude a transmitir de forma clara e atraente o propósito e funcionamento do seu bot de solicitação de verbas!