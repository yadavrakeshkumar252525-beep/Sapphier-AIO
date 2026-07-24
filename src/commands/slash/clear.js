const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const {
    sendLog
} = require("../../modules/logging/services/loggingService");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("clear")

        .setDescription(
            "Delete multiple messages from the current channel"
        )

        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription(
                    "Number of messages to delete (1-100)"
                )
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageMessages
        ),

    async execute(interaction) {

        try {

            // =========================================
            // GET AMOUNT
            // =========================================

            const amount =
                interaction.options.getInteger(
                    "amount"
                );


            // =========================================
            // BOT PERMISSION CHECK
            // =========================================

            const botMember =
                interaction.guild.members.me;


            if (
                !botMember.permissionsIn(
                    interaction.channel
                ).has(
                    PermissionFlagsBits.ManageMessages
                )
            ) {

                return interaction.reply({

                    content:
                        "❌ I don't have the **Manage Messages** permission in this channel.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // FETCH MESSAGES
            // =========================================

            const messages =
                await interaction.channel.messages.fetch({

                    limit:
                        amount

                });


            // =========================================
            // DELETE MESSAGES
            // =========================================

            const deleted =
                await interaction.channel.bulkDelete(

                    messages,

                    true

                );


            // =========================================
            // SUCCESS EMBED
            // =========================================

            const embed =
                new EmbedBuilder()

                    .setColor(
                        "#3BA4FF"
                    )

                    .setTitle(
                        "🧹 Messages Cleared"
                    )

                    .setDescription(

                        `Successfully deleted **${deleted.size}** message(s).`

                    )

                    .addFields(

                        {

                            name:
                                "👮 Moderator",

                            value:
                                `${interaction.user.tag}`,

                            inline:
                                true

                        },

                        {

                            name:
                                "📢 Channel",

                            value:
                                `${interaction.channel}`,

                            inline:
                                true

                        },

                        {

                            name:
                                "🗑️ Messages",

                            value:
                                `${deleted.size}`,

                            inline:
                                true

                        }

                    )

                    .setFooter({

                        text:
                            "Sapphier AIO • Moderation"

                    })

                    .setTimestamp();


            // =========================================
            // SEND RESPONSE
            // =========================================

            await interaction.reply({

                embeds:
                    [embed],

                ephemeral:
                    true

            });


            // =========================================
            // CENTRAL LOGGING
            // =========================================

            try {

                await sendLog({

                    guild:
                        interaction.guild,

                    action:
                        "clear",

                    title:
                        "🧹 Messages Cleared",

                    description:
                        `${interaction.user.tag} cleared ${deleted.size} message(s) in ${interaction.channel}.`,

                    color:
                        "#3BA4FF",

                    fields: [

                        {

                            name:
                                "👮 Moderator",

                            value:
                                `${interaction.user.tag}\n${interaction.user.id}`,

                            inline:
                                true

                        },

                        {

                            name:
                                "📢 Channel",

                            value:
                                `${interaction.channel}`,

                            inline:
                                true

                        },

                        {

                            name:
                                "🗑️ Messages Deleted",

                            value:
                                `${deleted.size}`,

                            inline:
                                true

                        }

                    ]

                });

            } catch (loggingError) {

                console.error(

                    "⚠️ Clear Log Error:",

                    loggingError

                );

            }

        } catch (error) {

            console.error(

                "❌ Clear Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while clearing messages.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ An unexpected error occurred while clearing messages.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};