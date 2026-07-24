const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const Warning =
    require("../../models/Warning");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("warn-clear")

        .setDescription(
            "Remove one warning from a member"
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription(
                    "The member whose warning you want to remove"
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("warning_id")
                .setDescription(
                    "The warning ID shown in /warns"
                )
                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        ),

    async execute(interaction) {

        try {

            const user =
                interaction.options.getUser("user");

            const warningId =
                interaction.options.getString(
                    "warning_id"
                );


            // =========================================
            // FIND WARNING
            // =========================================

            const warning =
                await Warning.findOne({

                    _id:
                        warningId,

                    guildId:
                        interaction.guild.id,

                    userId:
                        user.id

                });


            if (!warning) {

                return interaction.reply({

                    content:
                        "❌ Warning not found. Make sure you used the correct Warning ID from `/warns`.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // DELETE WARNING
            // =========================================

            await Warning.deleteOne({

                _id:
                    warning._id

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
                        "✅ Warning Removed"
                    )

                    .setDescription(

                        `A warning has been removed from **${user.tag}**.`

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
                                "🆔 Warning ID",

                            value:
                                `\`${warning._id}\``,

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

                        },

                        {

                            name:
                                "📝 Original Reason",

                            value:
                                warning.reason

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

                "❌ Warn Clear Error:",

                error

            );

            return interaction.reply({

                content:
                    "❌ An error occurred while removing the warning.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};