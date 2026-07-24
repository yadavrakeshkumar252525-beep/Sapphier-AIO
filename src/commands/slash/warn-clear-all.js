const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const Warning =
    require("../../models/Warning");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("warn-clear-all")

        .setDescription(
            "Clear all warnings from a member"
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription(
                    "The member whose warnings you want to clear"
                )
                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        try {

            const user =
                interaction.options.getUser("user");


            // =========================================
            // GET WARNINGS
            // =========================================

            const warnings =
                await Warning.find({

                    guildId:
                        interaction.guild.id,

                    userId:
                        user.id

                });


            if (
                warnings.length === 0
            ) {

                return interaction.reply({

                    content:
                        `ℹ️ **${user.tag}** has no warnings to clear.`,

                    ephemeral:
                        true

                });

            }


            // =========================================
            // DELETE ALL
            // =========================================

            await Warning.deleteMany({

                guildId:
                    interaction.guild.id,

                userId:
                    user.id

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
                        "🧹 All Warnings Cleared"
                    )

                    .setDescription(

                        `All warnings for **${user.tag}** have been permanently cleared.`

                    )

                    .addFields(

                        {

                            name:
                                "👤 User",

                            value:
                                `${user.tag}`,

                            inline:
                                true

                        },

                        {

                            name:
                                "🗑️ Warnings Removed",

                            value:
                                `${warnings.length}`,

                            inline:
                                true

                        },

                        {

                            name:
                                "👮 Moderator",

                            value:
                                `${interaction.user.tag}`,

                            inline:
                                true

                        }

                    )

                    .setFooter({

                        text:
                            "Sapphier AIO • Moderation"

                    })

                    .setTimestamp();


            return interaction.reply({

                embeds:
                    [embed]

            });

        } catch (error) {

            console.error(

                "❌ Warn Clear All Error:",

                error

            );

            return interaction.reply({

                content:
                    "❌ An error occurred while clearing warnings.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};