const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("ticket-panel")

        .setDescription(
            "Send the premium Sapphier's Slots support ticket panel."
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageChannels
        ),


    async execute(interaction) {

        try {

            // =========================================
            // PREMIUM TICKET EMBED
            // =========================================

            const ticketEmbed =
                new EmbedBuilder()

                    .setColor("#3BA4FF")

                    .setTitle(
                        "🎫 Sapphier's Slots • Support Center"
                    )

                    .setDescription(

                        "Welcome to **Sapphier's Slots**! 🛒\n\n" +

                        "Need help with an order, payment, or any other issue? " +
                        "Our support team is here to assist you.\n\n" +

                        "━━━━━━━━━━━━━━━━━━━━\n\n" +

                        "📌 **How to Contact Support**\n\n" +

                        "Click the **🎫 Create Ticket** button below and " +
                        "select the category that best matches your request.\n\n" +

                        "🛒 **Purchase / Order**\n" +
                        "For new purchases and orders.\n\n" +

                        "💳 **Payment Support**\n" +
                        "For payment-related questions or issues.\n\n" +

                        "🔄 **Order Issue**\n" +
                        "For problems with an existing order.\n\n" +

                        "❓ **General Support**\n" +
                        "For general questions and assistance.\n\n" +

                        "━━━━━━━━━━━━━━━━━━━━\n\n" +

                        "⚡ **Please provide all necessary details inside your ticket.**\n" +
                        "🎯 Our staff team will assist you as soon as possible.\n\n" +

                        "🔒 **Do not open multiple tickets for the same issue.**"

                    )

                    .addFields(

                        {
                            name: "🛡️ Professional Support",
                            value:
                                "Our dedicated staff team is ready to help you.",
                            inline: true
                        },

                        {
                            name: "⚡ Fast Assistance",
                            value:
                                "Provide clear information for faster support.",
                            inline: true
                        },

                        {
                            name: "🔐 Private Tickets",
                            value:
                                "Your support conversation is visible only to you and staff.",
                            inline: true
                        }

                    )

                    .setFooter({

                        text:
                            "Sapphier's Slots • Premium Support System"

                    })

                    .setTimestamp();


            // =========================================
            // CREATE TICKET BUTTON
            // =========================================

            const createTicketButton =

                new ButtonBuilder()

                    .setCustomId(
                        "ticket_create"
                    )

                    .setLabel(
                        "Create Ticket"
                    )

                    .setEmoji(
                        "🎫"
                    )

                    .setStyle(
                        ButtonStyle.Primary
                    );


            // =========================================
            // BUTTON ROW
            // =========================================

            const row =

                new ActionRowBuilder()

                    .addComponents(

                        createTicketButton

                    );


            // =========================================
            // SEND PANEL
            // =========================================

            await interaction.channel.send({

                embeds: [

                    ticketEmbed

                ],

                components: [

                    row

                ]

            });


            // =========================================
            // COMMAND RESPONSE
            // =========================================

            return interaction.reply({

                content:
                    "✅ **Premium ticket panel sent successfully!**",

                ephemeral: true

            });


        } catch (error) {

            console.error(

                "❌ Ticket Panel Error:",

                error

            );


            if (

                interaction.replied ||

                interaction.deferred

            ) {

                return interaction.followUp({

                    content:
                        "❌ Failed to send the ticket panel.",

                    ephemeral: true

                }).catch(

                    () => {}

                );

            }


            return interaction.reply({

                content:
                    "❌ Failed to send the ticket panel.",

                ephemeral: true

            }).catch(

                () => {}

            );

        }

    }

};