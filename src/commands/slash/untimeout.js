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

        .setName("untimeout")

        .setDescription(
            "Remove a member's timeout"
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription(
                    "The member whose timeout will be removed"
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription(
                    "Reason for removing the timeout"
                )
                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        ),

    async execute(interaction) {

        try {

            // =========================================
            // GET OPTIONS
            // =========================================

            const user =
                interaction.options.getUser("user");

            const reason =
                interaction.options.getString("reason");


            // =========================================
            // GET MEMBER
            // =========================================

            const member =
                await interaction.guild.members
                    .fetch(user.id)
                    .catch(() => null);


            if (!member) {

                return interaction.reply({

                    content:
                        "❌ This user is not a member of this server.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // BOT CHECK
            // =========================================

            if (user.bot) {

                return interaction.reply({

                    content:
                        "❌ You cannot manage a bot's timeout.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // SELF CHECK
            // =========================================

            if (
                user.id ===
                interaction.user.id
            ) {

                return interaction.reply({

                    content:
                        "❌ You cannot remove your own timeout using this command.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // ROLE HIERARCHY
            // =========================================

            if (
                member.roles.highest.position >=
                interaction.member.roles.highest.position
            ) {

                return interaction.reply({

                    content:
                        "❌ You cannot manage a member with an equal or higher role than you.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // CHECK TIMEOUT
            // =========================================

            if (
                !member.communicationDisabledUntilTimestamp
            ) {

                return interaction.reply({

                    content:
                        "ℹ️ This member is not currently timed out.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // REMOVE TIMEOUT
            // =========================================

            await member.timeout(

                null,

                reason

            );


            // =========================================
            // MODERATION LOG
            // =========================================

            await logModeration({

                guild:
                    interaction.guild,

                user:
                    user,

                moderator:
                    interaction.user,

                action:
                    "untimeout",

                reason:
                    reason,

                channelId:
                    interaction.channel.id,

                details:
                    "Member timeout manually removed.",

                color:
                    "#57F287",

                punishment:
                    "🔊 Timeout Removed"

            });


            // =========================================
            // DM USER
            // =========================================

            try {

                await user.send({

                    embeds: [

                        new EmbedBuilder()

                            .setColor(
                                "#57F287"
                            )

                            .setTitle(
                                "🔊 Your Timeout Has Been Removed"
                            )

                            .setDescription(

                                `Your timeout in **${interaction.guild.name}** has been removed.`

                            )

                            .addFields(

                                {

                                    name:
                                        "📝 Reason",

                                    value:
                                        reason,

                                    inline:
                                        true

                                },

                                {

                                    name:
                                        "👮 Moderator",

                                    value:
                                        interaction.user.tag,

                                    inline:
                                        true

                                }

                            )

                            .setFooter({

                                text:
                                    "Sapphier AIO • Moderation"

                            })

                            .setTimestamp()

                    ]

                });

            } catch {

                console.log(

                    `⚠️ Could not DM ${user.tag}`

                );

            }


            // =========================================
            // SUCCESS EMBED
            // =========================================

            const embed =
                new EmbedBuilder()

                    .setColor(
                        "#57F287"
                    )

                    .setTitle(
                        "🔊 Timeout Removed"
                    )

                    .setDescription(

                        `The timeout for ${user} has been successfully removed.`

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
                                "👮 Moderator",

                            value:
                                interaction.user.tag,

                            inline:
                                true

                        },

                        {

                            name:
                                "📝 Reason",

                            value:
                                reason

                        }

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
                    [embed]

            });


        } catch (error) {

            console.error(

                "❌ Untimeout Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while removing the timeout.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ I could not remove this member's timeout. Check my permissions and role position.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};