import { Responder, ResponderType } from "#base";
import { createModalFields } from "@magicyan/discord";
import {  TextInputStyle } from "discord.js";
import { z } from "zod";
import nodemailer from "nodemailer";




const schema = z.object({
    productName: z.string().min(1, { message: "O nome do produto é obrigatório" }),
    quantity: z.string().min(1, { message: "A quantidade e local de entrega é obrigatória" }),
    nameClient: z.string().min(1, { message: "O nome do cliente é obrigatório" }),
    portUrgency: z.string().min(1, { message: "O porte do cliente e a urgência são obrigatórios" }),
    observations: z.string().min(1, { message: "A observação é obrigatória" }),
});


const transporter = nodemailer.createTransport({
    service: 'outlook', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// type Schema = z.infer<typeof schema>;

new Responder({
    customId: "produtos-novos",
    type: ResponderType.Button,
    cache: "cached",
    async run(interaction) {
        interaction.showModal({
            title: "Solicitar novos produtos",
            customId: "modalNewProd",
            components: createModalFields({
                nameClient: {
                    label: "Nome do cliente / Solicitante",
                    placeholder: "Nome do cliente / Solicitante",
                    style: TextInputStyle.Short,
                    required: true,
                },
                portUrgency: {
                    label: "Porte e urgência",
                    placeholder: "Porte e urgência",
                    style: TextInputStyle.Short,
                    required: true,
                },
                productName: {
                    label: "Nome do produto",
                    placeholder: "Nome do produto",
                    style: TextInputStyle.Short,
                    required: true,
                },
                quantity: {
                    label: "Quantidade e Local de entrega",
                    placeholder: "Quantidade e Local de entrega",
                    style: TextInputStyle.Short,
                    required: true,
                },
                observations: {
                    label: "Observação",
                    placeholder: "Observação",
                    style: TextInputStyle.Paragraph,
                    required: true,
                },
            }),
        });
    },
});

new Responder({
    customId: "modalNewProd",
    type: ResponderType.ModalComponent,
    cache: "cached",
    async run(interaction) {
        if (!interaction.isModalSubmit()) {
            console.log("Erro: Interação inválida");
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        if (!interaction.fields) {
            return interaction.editReply({ content: 'Erro ao ler campos do formulário.' });
        }

        const nameClient = interaction.fields.getTextInputValue("nameClient");
        const portUrgency = interaction.fields.getTextInputValue("portUrgency");
        const productName = interaction.fields.getTextInputValue("productName");
        const quantity = interaction.fields.getTextInputValue("quantity");
        const observations = interaction.fields.getTextInputValue("observations");

        if (!productName || !quantity || !nameClient || !portUrgency || !observations) {
            return interaction.editReply({ content: 'Preencha todos os campos do formulário.' });
        }

        const modalData = {
            nameClient,
            portUrgency,
            productName,
            quantity,
            observations,
        };

        const validation = schema.safeParse(modalData);

        if (!validation.success) {
            const errorMessages = validation.error.errors.map((err) => err.message).join("\n");
            return interaction.editReply({ content: `Erro de validação:\n${errorMessages}` });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'jhionathan.vitoria@r3suprimentos.com.br',
            subject: `Novo Pedido de Produto: ${validation.data.productName}`,
            text: `
            Novo Pedido de Produto:

            Nome do Cliente: ${validation.data.nameClient}
            Porte e urgência: ${validation.data.portUrgency}
            Nome do Produto: ${validation.data.productName}
            Quantidade e Local de entrega: ${validation.data.quantity}
            Observação: ${validation.data.observations}
            `,
            html: `
            <h3>Novo Pedido de Produto:</h3>
            <p><b>Nome do Cliente:</b> ${validation.data.nameClient}</p>
            <p><b>Porte e urgência:</b> ${validation.data.portUrgency}</p>
            <p><b>Nome do Produto:</b> ${validation.data.productName}</p>
            <p><b>Quantidade e Local de entrega:</b> ${validation.data.quantity}</p>
            <p><b>Observação:</b> ${validation.data.observations}</p>
            <img src="https://r3suprimentos.agilecdn.com.br/banners/whatsapp-image-2024-08-22-at-17-26-19-1724358434.jpeg" alt="image1" />
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            await interaction.editReply({ content: 'Solicitação de novos produtos enviada com sucesso!' });
        } catch (error) {
            console.error("Erro ao processar a solicitação:", error);
            try {
                await interaction.editReply({ content: 'Houve um erro ao enviar o email.' });
            } catch (error2) {
                console.error("Erro ao editar a resposta:", error2);
            }
        }
        return;
    },

});