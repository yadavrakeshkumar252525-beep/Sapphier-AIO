const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const Warning =
    require("../../models/Warning");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("warnings")

        .setDescription(
            "View a member's warning history"
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription(
                    "The member whose warnings you want to view"
                )
                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        ),

    async execute(interaction) {

        try {

            // =========================================
            // GET USER
            // =========================================

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

                })
                .sort({

                    createdAt:
                        -1

                });


            // =========================================
            // NO WARNINGS
            // =========================================

            if (
                warnings.length === 0
            ) {

                const noWarningEmbed =
                    new EmbedBuilder()

                        .setColor(
                            "#57F287"
                        )

                        .setTitle(
                            "📋 Warning History"
                        )

                        .setDescription(

                            `${user} has no warnings in this server. ✅`

                        )

                        .setThumbnail(

                            user.displayAvatarURL({

                                dynamic:
                                    true,

                                size:
                                    256

                            })

                        )

                        .setFooter({

                            text:
                                "Sapphier AIO • Moderation"

                        })

                        .setTimestamp();


                return interaction.reply({

                    embeds:
                        [noWarningEmbed]

                });

            }


            // =========================================
            // WARNING LIST
            // =========================================

            const warningList =
                warnings
                    .slice(0, 10)
                    .map(

                        (warning, index) => {

                            const date =
                                warning.createdAt
                                    ? `<t:${Math.floor(
                                        warning.createdAt.getTime() / 1000
                                    )}:R>`
                                    : "Unknown";

                            return (

                                `**#${warnings.length - index}** • ${date}\n` +

                                `📝 **Reason:** ${warning.reason || "No reason provided"}\n` +

                                `👮 **Moderator:** <@${warning.moderatorId}>\n` +

                                `🆔 **ID:** \`${warning._id}\``

                            );

                        }

                    )
                    .join("\n\n");


            // =========================================
            // CREATE EMBED
            // =========================================

            const embed =
                new EmbedBuilder()

                    .setColor(
                        "#FEE75C"
                    )

                    .setTitle(
                        "⚠️ Warning History"
                    )

                    .setDescription(

                        `Warning history for ${user}`

                    )

                    .addFields(

                        {

                            name:
                                "👤 User",

                            value:
                                `${user.tag}\n\`${user.id}\``,

                            inline:
                                true

                        },

                        {

                            name:
                                "⚠️ Total Warnings",

                            value:
                                `${warnings.length}`,

                            inline:
                                true

                        }

                    )

                    .addFields({

                        name:
                            "📋 Recent Warnings",

                        value:
                            warningList.length > 1024
                                ? warningList.substring(
                                    0,
                                    1021
                                ) + "..."
                                : warningList

                    })

                    .setThumbnail(

                        user.displayAvatarURL({

                            dynamic:
                                true,

                            size:
                                256

                        })

                    )

                    .setFooter({

                        text:
                            warnings.length > 10

                                ? `Showing latest 10 of ${warnings.length} warnings • Sapphier AIO`

                                : "Sapphier AIO • Moderation"

                    })

                    .setTimestamp();


            return interaction.reply({

                embeds:
                    [embed]

            });


        } catch (error) {

            console.error(

                "❌ Warnings Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while fetching warning history.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ I could not fetch this member's warning history.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};