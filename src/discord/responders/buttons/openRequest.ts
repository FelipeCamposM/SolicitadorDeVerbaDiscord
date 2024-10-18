import { Responder, ResponderType } from "#base";
import {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ComponentType,
  StringSelectMenuBuilder,
  ButtonBuilder,
} from "discord.js";
import { ButtonStyle } from "discord-api-types/v10";
import { createEmbed } from "@magicyan/discord";
import nodemailer from "nodemailer";
import { z } from 'zod'; 

const formSchema = z.object({
  motivo: z.string().min(1, { message: "❓ O motivo é obrigatório" }),
  // eslint-disable-next-line camelcase
  valor: z.coerce.number({ invalid_type_error: "💲 O valor deve ser um número escrito da forma: 1200.20"}).min(1,
    { message: "💲 O valor deve ser um número escrito da forma: 1200.20" }),
  data: z.string().regex(
    /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/,
    "🗓️ A data deve estar no formato: DD/MM/AAAA."
  ).min(1, { message: "🗓️ A data deve estar no formato: DD/MM/AAAA." }),
  email: z.string().email("📧 O e-mail deve ser válido como: email@email.com "),
});


function gerarNumeroTicket(): string {
  const timestamp = Date.now();
  const ticketNumber = `${timestamp}`;
  return ticketNumber;
}

function registerTicket(
  motivo: string,
  valor: string,
  numeroTicket: string,
  data: string,
  email: string
) {
  console.log(
    `Solicitação registrada. Motivo: ${motivo}, Valor: ${valor}, Data: ${data}, Email: ${email}, Número: ${numeroTicket}`
  );
}

new Responder({
  customId: "newRequest",
  type: ResponderType.Button,
  async run(interaction) {
    try {
      const sentMessage = await interaction.reply({
        embeds: [
          createEmbed({
            color: "#2596be",
            title: ` ***O usuário ${interaction.user.globalName} abriu uma nova Solicitação.*** 🎫\n\n*Caso seja o usuário mencionado, prossiga a solicitação. ✅*\n\nCaso contrário, \nPor favor aguarde até que esta seja finalizada e essa mensagem desapareça para iniciar uma nova Solicitação! 🕔`,
          }),
        ],
        fetchReply: true,
        ephemeral: false,
      });

      const answerButton = new ButtonBuilder()
        .setCustomId("answerButton")
        .setLabel("Continuar Abertura da Solicitação")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        answerButton
      );

      // Atualizar a mensagem com o botão de "Abrir Nova Solicitação"
      await sentMessage.edit({ components: [row] });

      setTimeout(async () => {
        try {
          await sentMessage.delete();
        } catch (error) {
          console.error("Erro ao deletar o embed:", error);
        }
      }, 20000); // 20000ms = 20 segundos
    } catch (error) {
      console.error("Erro ao processar o comando:", error);
      await interaction.reply({
        content: "Ocorreu um erro ao processar a Solicitação.",
        ephemeral: true,
      });
    }
  },
});

new Responder({
  customId: "answerButton",
  type: ResponderType.Button,
  async run(interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId("requestModal")
        .setTitle("**Abrir Nova Solicitação**");

      const motivoInput = new TextInputBuilder()
        .setCustomId("motivo")
        .setLabel("Motivo da Solicitação:")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Digite o motivo da Solicitação")
        .setRequired(true);

      const valorInput = new TextInputBuilder()
        .setCustomId("valor")
        .setLabel("Digite o Valor solicitado em R$:")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Valor em R$")
        .setRequired(true);

      const dataInput = new TextInputBuilder()
        .setCustomId("data")
        .setLabel("Digite a Data Limite (DD/MM/AAAA):")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("A data tem que ser em DD/MM/AAAA, como por exemplo 13/02/2025")
        .setRequired(true);

      const emailInput = new TextInputBuilder()
        .setCustomId("email")
        .setLabel("Digite o email:")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Digite o seu Email")
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(motivoInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(valorInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(dataInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput)
      );

      await interaction.showModal(modal);
    } catch (error) {
      console.error("Erro ao exibir o modal:", error);
      await interaction.reply({
        content: "Ocorreu um erro ao abrir o modal.",
        ephemeral: true,
      });
    }
  },
});

let previousInputs: {
  motivo: string;
  valor: string;
  data: string;
  email: string;
} = {
  motivo: "",
  valor: "",
  data: "",
  email: "",
};

new Responder({
    customId: "requestModal",
    type: ResponderType.Modal,
    async run(interaction) {
      try {
        const motivo = interaction.fields.getTextInputValue("motivo");
        const valor = interaction.fields.getTextInputValue("valor");
        const data = interaction.fields.getTextInputValue("data");
        const email = interaction.fields.getTextInputValue("email");

        previousInputs = { motivo, valor, data, email };
  
          // Validação usando Zod
        const validationResult = formSchema.safeParse({
          motivo,
          valor,
          data,
          email,
        });

        if (!validationResult.success) {
          // Captura os erros de validação e responde ao usuário
          const errorMessages = validationResult.error.errors
            .map((error) => error.message)
            .join("\n");

          const reopenButton = new ButtonBuilder()
            .setCustomId("reopenModal")
            .setLabel("Corrigir Dados ↩️")
            .setStyle(ButtonStyle.Primary);

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(reopenButton);

          return await interaction.reply({
            content: `❌ ***Ocorreram erros de validação*** ⛔\nDigite corretamente os dados à serem enviados:\n\n${errorMessages}`,
            ephemeral: true,
            components: [row],
          });

        }

        const numeroTicket = gerarNumeroTicket();
  
        registerTicket(motivo, valor, data, email, numeroTicket);
  
        // Inicializa um objeto para armazenar as seleções do usuário
        const userSelections: {
          department: string | null;
          priority: string | null;
          account: string | null;
          payment: string | null;
        } = {
          department: null,
          priority: null,
          account: null,
          payment: null,
        };
  
        // Criação dos seletores
        const departmentSelectMenu = new StringSelectMenuBuilder()
          .setCustomId("departmentSelect")
          .setPlaceholder("☰ Escolha um dos Departamentos 📝")
          .addOptions([
            { label: "📌 Marketing", value: "Marketing" },
            { label: "📌 RH", value: "RH" },
            { label: "📌 T.I.", value: "T.I." },
            { label: "📌 Compras", value: "Compras" },
            { label: "📌 Logística", value: "Logistica" },
            { label: "📌 Administrativo", value: "Administrativo" },
            { label: "📌 Comercial", value: "Comercial" },
            { label: "📌 Treinamento", value: "Treinamento" },
            { label: "📌 Consultoria Técnica", value: "Consultoria-Tecnica" },
          ]);
  
        const prioritySelectMenu = new StringSelectMenuBuilder()
          .setCustomId("prioritySelect")
          .setPlaceholder("☰ Escolha a Prioridade da Solicitação 📝")
          .addOptions([
            { label: "🔴 Alta", value: "Alta" },
            { label: "🟡 Média", value: "Media" },
            { label: "🟢 Baixa", value: "Baixa" },
          ]);
  
        const accountSelectMenu = new StringSelectMenuBuilder()
          .setCustomId("accountSelect")
          .setPlaceholder("☰ Escolha a Prestação de Conta 📝")
          .addOptions([
            { label: "📑 Nota Fiscal", value: "Nota-Fiscal" },
            { label: "🧾 Recibo", value: "Recibo" },
          ]);
  
        const paymentSelectMenu = new StringSelectMenuBuilder()
          .setCustomId("paymentSelect")
          .setPlaceholder("☰ Escolha a Forma de Pagamento 📝")
          .addOptions([
            { label: "💳 Cartão de Crédito (Danillo)", value: "Credito-Danillo" },
            { label: "💳 Cartão de Crédito (Luciano)", value: "Credito-Luciano" },
            { label: "💵 Dinheiro", value: "Dinheiro" },
          ]);
  
        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          departmentSelectMenu
        );
  
        const row2 =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            prioritySelectMenu
          );
  
        const row3 =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            accountSelectMenu
          );
  
        const row4 =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            paymentSelectMenu
          );
  
        const message = await interaction.reply({
          content: `🎫 **Sua Solicitação está quase pronta!**\nMotivo: ${motivo}.\n👉 Escolha uma das opções abaixo para classificar e finalizar: ⬇️`,
          components: [row, row2, row3, row4],
          ephemeral: false,
          fetchReply: true,
        });
  
        const collector = message.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 60000, // 60 segundos
        });
  
        collector.on("collect", async (selectInteraction) => {
          try {
            console.log(`Interação recebida: ${selectInteraction.customId}`);
            const customId = selectInteraction.customId;
            const selectedValue = selectInteraction.values[0];

            console.log(`Selected: ${selectedValue} from ${customId}`);
            console.log('Opção selecionada:' + selectInteraction.customId, selectInteraction.values);
    
            // Armazena a seleção de acordo com o customId
            if (customId === "departmentSelect") {
              userSelections.department = selectedValue;
              console.log(userSelections);
              await selectInteraction.deferUpdate();
            } else if (customId === "prioritySelect") {
              userSelections.priority = selectedValue;
              console.log(userSelections);
              await selectInteraction.deferUpdate();
            } else if (customId === "accountSelect") {
              userSelections.account = selectedValue;
              console.log(userSelections);
              await selectInteraction.deferUpdate();
            } else if (customId === "paymentSelect") {
              userSelections.payment = selectedValue;
              console.log(userSelections);
              await selectInteraction.deferUpdate();
            }
    
            // Verifica se todas as seleções foram feitas
            if (
              userSelections.department &&
              userSelections.priority &&
              userSelections.account &&
              userSelections.payment
            ) {
              
              await message.edit({
                content: `🎫 **Sua Solicitação está sendo enviada!**✅`,
              });

              console.log("O e-mail está sendo enviado...");
              // Envia o e-mail quando todas as seleções são feitas
              async function sendEmail() {


                const transporter = nodemailer.createTransport({
                  service: "outlook",
                  auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD,
                  },
                });
    
                const info = await transporter.sendMail({
                  from: process.env.EMAIL, //email que vai enviar a mensagem
                  to: process.env.EMAIL_USER, //email que vai receber a solicitação
                  subject: "📝 Solicitação de Verba Recebida!",
                  text: `🎫 Detalhes da Solicitação de Verba:
                  
                  📋 Motivo: ${motivo}
                  💰 Valor Solicitado: R$ ${valor}
                  📅 Data Limite: ${data}
                
                  🏢 Departamento: ${userSelections.department}
                  🔝 Prioridade: ${userSelections.priority}
                  🧾 Prestação de Conta: ${userSelections.account}
                  💳 Forma de Pagamento: ${userSelections.payment}
                
                  ✅ Esse e-mail foi enviado automaticamente.`,
                  
                  html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                      <h2 style="color: #2596be;">🎫 Detalhes da Solicitação de Verba</h2>
                      <p><strong>📋 Motivo:</strong> ${motivo}</p>
                      <p><strong>💰 Valor Solicitado:</strong> R$ ${valor}</p>
                      <p><strong>📅 Data Limite:</strong> ${data}</p>
                      <hr>
                      <p><strong>🏢 Departamento:</strong> ${userSelections.department}</p>
                      <p><strong>🔝 Prioridade:</strong> ${userSelections.priority}</p>
                      <p><strong>🧾 Prestação de Conta:</strong> ${userSelections.account}</p>
                      <p><strong>💳 Forma de Pagamento:</strong> ${userSelections.payment}</p>
                      <hr>
                      <p>✅ <em>Esse e-mail foi enviado automaticamente.</em></p>

                      <!-- Botão para enviar e-mail para o solicitante da mensage -->
                      <a href="mailto:${email}?subject=Resposta%20à%20Solicitação&body=Olá%2C%20gostaria%20de%20responder%20sobre%20a%20solicitação%20de%20verba." 
                        style="display:inline-block; padding:10px 20px; margin-top:20px; font-size:16px; color:#fff; background-color:#2596be; text-decoration:none; border-radius:5px;">
                        📧 Enviar E-mail
                      </a>
                    </div>
                  `,
                });
                
    
                console.log("Mensagem enviada: %s", info.messageId);
              }
    
              await sendEmail().catch(console.error);
    
              try {
                if (message) {
                  await message.delete();
                }
              } catch (error) {
                console.error("Erro ao deletar a mensagem:", error);
              }
    
              collector.stop(); // Para o coletor após o envio do e-mail
            }
          } catch (error) {
            console.error('Erro ao processar a interação:', error);
          }
        });
  
        collector.on("end", async (collected, reason) => {
          if (reason === "time") {
            try {
              if (message) {
                await message.delete();
              }
            } catch (error) {
              console.error("Erro ao deletar a mensagem após o tempo:", error);
            }
          }
        });
      } catch (error) {
        console.error("Erro ao processar a seleção ou criar thread:", error);
        await interaction.followUp({
          content: "Ocorreu um erro ao processar a solicitação",
          ephemeral: true,
        });
      }

    },

  });
  

  new Responder({
    customId: "reopenModal",
    type: ResponderType.Button,
    async run(interaction) {
      try {
        const modal = new ModalBuilder()
          .setCustomId("requestModal")
          .setTitle("**Abrir Nova Solicitação**");
  
        const motivoInput = new TextInputBuilder()
          .setCustomId("motivo")
          .setLabel("Motivo da Solicitação:")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setValue(previousInputs.motivo);
  
        const valorInput = new TextInputBuilder()
          .setCustomId("valor")
          .setLabel("Digite o Valor solicitado em R$:")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setValue(previousInputs.valor);
  
        const dataInput = new TextInputBuilder()
          .setCustomId("data")
          .setLabel("Digite a Data Limite (DD/MM/AAAA):")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setValue(previousInputs.data);
  
        const emailInput = new TextInputBuilder()
          .setCustomId("email")
          .setLabel("Digite o email:")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setValue(previousInputs.email);
  
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(motivoInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(valorInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(dataInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput)
        );
  
        await interaction.showModal(modal);
      } catch (error) {
        console.error("Erro ao exibir o modal:", error);
        await interaction.reply({
          content: "Ocorreu um erro ao abrir o modal novamente.",
          ephemeral: true,
        });
      }
    },
  });