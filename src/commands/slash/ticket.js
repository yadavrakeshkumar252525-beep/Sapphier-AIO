const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Manage the Sapphier AIO ticket system")

        // PANEL
        .addSubcommand(subcommand =>
            subcommand
                .setName("panel")
                .setDescription("Create a ticket panel")
        )

        // CLOSE
        .addSubcommand(subcommand =>
            subcommand
                .setName("close")
                .setDescription("Close the current ticket")
        )

        // CLAIM
        .addSubcommand(subcommand =>
            subcommand
                .setName("claim")
                .setDescription("Claim the current ticket")
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageChannels
        ),

    async execute(interaction) {

        try {

            const subcommand =
                interaction.options.getSubcommand();


            // =========================================
            // TICKET PANEL
            // =========================================

            if (subcommand === "panel") {

                const embed =
                    new EmbedBuilder()

                        .setColor("#3BA4FF")

                        .setTitle(
                            "🎫 Sapphier Support Center"
                        )

                        .setDescription(

                            "Need help or want to purchase something?\n\n" +

                            "Click the button below to open a private support ticket.\n\n" +

                            "💎 **Before opening a ticket:**\n" +

                            "• Please explain your issue clearly.\n" +

                            "• Do not spam or ping staff unnecessarily.\n" +

                            "• Keep your order/payment information ready if required.\n\n" +

                            "Our staff team will assist you as soon as possible."

                        )

                        .addFields({

                            name:
                                "📌 Available Support",

                            value:
                                "🛒 **Purchase / Order**\n" +
                                "💳 **Payment Support**\n" +
                                "🔄 **Order Issue**\n" +
                                "❓ **General Support**"

                        })

                        .setFooter({

                            text:
                                "Sapphier AIO • Premium Support System"

                        })

                        .setTimestamp();


                const button =
                    new ButtonBuilder()

                        .setCustomId(
                            "ticket_create"
                        )

                        .setLabel(
                            "Open Ticket"
                        )

                        .setEmoji(
                            "🎫"
                        )

                        .setStyle(
                            ButtonStyle.Primary
                        );


                const row =
                    new ActionRowBuilder()

                        .addComponents(
                            button
                        );


                await interaction.channel.send({

                    embeds:
                        [embed],

                    components:
                        [row]

                });


                return interaction.reply({

                    content:
                        "✅ Ticket panel created successfully.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // CLOSE TICKET
            // =========================================

            if (subcommand === "close") {

                return interaction.reply({

                    content:
                        "🔒 Use the **Close Ticket** button inside the ticket.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // CLAIM TICKET
            // =========================================

            if (subcommand === "claim") {

                return interaction.reply({

                    content:
                        "🎯 Use the **Claim Ticket** button inside the ticket.",

                    ephemeral:
                        true

                });

            }

        } catch (error) {

            console.error(
                "❌ Ticket Command Error:",
                error
            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while processing the ticket command.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ An unexpected error occurred while processing the ticket command.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};