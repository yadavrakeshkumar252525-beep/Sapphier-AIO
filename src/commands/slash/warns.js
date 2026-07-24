const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const Warning =
    require("../../models/Warning");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("warns")

        .setDescription(
            "View warnings of a member"
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

            const user =
                interaction.options.getUser("user");


            const warnings =
                await Warning.find({

                    guildId:
                        interaction.guild.id,

                    userId:
                        user.id

                })
                .sort({
                    createdAt: -1
                });


            // =========================================
            // NO WARNINGS
            // =========================================

            if (
                warnings.length === 0
            ) {

                return interaction.reply({

                    content:
                        `✅ **${user.tag}** has no warnings.`,

                    ephemeral:
                        true

                });

            }


            // =========================================
            // BUILD WARNING LIST
            // =========================================

            const warningList =
                warnings
                    .map(
                        (warning, index) => {

                            const date =
                                Math.floor(
                                    warning.createdAt.getTime()
                                    / 1000
                                );

                            return [

                                `**#${index + 1}**`,

                                `🆔 ID: \`${warning._id}\``,

                                `📝 Reason: ${warning.reason}`,

                                `👮 Moderator: <@${warning.moderatorId}>`,

                                `📅 <t:${date}:R>`

                            ].join("\n");

                        }
                    )
                    .join("\n\n");


            const embed =
                new EmbedBuilder()

                    .setColor(
                        "#FEE75C"
                    )

                    .setTitle(
                        "⚠️ Member Warnings"
                    )

                    .setDescription(

                        `Warnings for **${user.tag}**\n\n${warningList}`

                    )

                    .addFields({

                        name:
                            "📊 Total Warnings",

                        value:
                            `${warnings.length}`,

                        inline:
                            true

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
                            "Sapphier AIO • Moderation"

                    })

                    .setTimestamp();


            return interaction.reply({

                embeds:
                    [embed]

            });

        } catch (error) {

            console.error(

                "❌ Warns Command Error:",

                error

            );

            return interaction.reply({

                content:
                    "❌ An error occurred while fetching warnings.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};