const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const {
    logModeration
} = require("../../utils/modLogger");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("purge")

        .setDescription(
            "Delete multiple messages from a channel"
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
            // CHECK CHANNEL
            // =========================================

            if (
                !interaction.channel ||
                !interaction.channel.isTextBased()
            ) {

                return interaction.reply({

                    content:
                        "❌ This command can only be used in a text channel.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // BOT PERMISSION CHECK
            // =========================================

            const botMember =
                interaction.guild.members.me;


            if (!botMember) {

                return interaction.reply({

                    content:
                        "❌ I could not find my bot member in this server.",

                    ephemeral:
                        true

                });

            }


            const permissions =
                interaction.channel.permissionsFor(
                    botMember
                );


            if (
                !permissions ||
                !permissions.has(
                    PermissionFlagsBits.ManageMessages
                )
            ) {

                return interaction.reply({

                    content:
                        "❌ I need the **Manage Messages** permission to delete messages.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // DEFER RESPONSE
            // =========================================

            await interaction.deferReply({

                ephemeral:
                    true

            });


            // =========================================
            // BULK DELETE
            // =========================================

            const deleted =
                await interaction.channel.bulkDelete(

                    amount,

                    true

                );


            const deletedCount =
                deleted.size;


            // =========================================
            // MODERATION LOG
            // =========================================

            await logModeration({

                guild:
                    interaction.guild,

                user:
                    interaction.user,

                moderator:
                    interaction.user,

                action:
                    "purge",

                reason:
                    "Messages manually purged by moderator",

                channelId:
                    interaction.channel.id,

                details:
                    `${deletedCount} message(s) deleted from ${interaction.channel}`,

                color:
                    "#FEE75C",

                punishment:
                    `🗑️ ${deletedCount} Message(s) Deleted`

            });


            // =========================================
            // SUCCESS EMBED
            // =========================================

            const embed =
                new EmbedBuilder()

                    .setColor(
                        "#57F287"
                    )

                    .setTitle(
                        "🧹 Messages Purged"
                    )

                    .setDescription(

                        `Successfully deleted **${deletedCount} message(s)** from ${interaction.channel}.`

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
                                "🗑️ Requested",

                            value:
                                `${amount}`,

                            inline:
                                true

                        },

                        {

                            name:
                                "✅ Deleted",

                            value:
                                `${deletedCount}`,

                            inline:
                                true

                        }

                    )

                    .setFooter({

                        text:
                            "Sapphier AIO • Moderation"

                    })

                    .setTimestamp();


            return interaction.editReply({

                embeds:
                    [embed]

            });


        } catch (error) {

            console.error(

                "❌ Purge Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.editReply({

                    content:
                        "❌ I could not delete the messages. Make sure I have **Manage Messages** permission and that the messages are eligible for bulk deletion."

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ An unexpected error occurred while purging messages.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};