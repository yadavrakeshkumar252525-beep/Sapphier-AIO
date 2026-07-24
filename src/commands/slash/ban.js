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

        .setName("ban")

        .setDescription(
            "Ban a member from the server"
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription(
                    "The member to ban"
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription(
                    "Reason for the ban"
                )
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName("delete_days")
                .setDescription(
                    "Delete user's messages from the last 0-7 days"
                )
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.BanMembers
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

            const deleteDays =
                interaction.options.getInteger("delete_days") ?? 0;


            // =========================================
            // GET MEMBER
            // =========================================

            const member =
                await interaction.guild.members
                    .fetch(user.id)
                    .catch(() => null);


            // =========================================
            // SELF CHECK
            // =========================================

            if (
                user.id ===
                interaction.user.id
            ) {

                return interaction.reply({

                    content:
                        "❌ You cannot ban yourself.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // SERVER OWNER PROTECTION
            // =========================================

            if (
                user.id ===
                interaction.guild.ownerId
            ) {

                return interaction.reply({

                    content:
                        "❌ The server owner cannot be banned.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // MODERATOR ROLE HIERARCHY
            // =========================================

            if (
                member &&
                member.roles.highest.position >=
                interaction.member.roles.highest.position
            ) {

                return interaction.reply({

                    content:
                        "❌ You cannot ban a member with an equal or higher role than you.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // BOT ROLE HIERARCHY
            // =========================================

            const botMember =
                interaction.guild.members.me;


            if (
                member &&
                botMember &&
                member.roles.highest.position >=
                botMember.roles.highest.position
            ) {

                return interaction.reply({

                    content:
                        "❌ I cannot ban this member because their highest role is equal to or higher than my highest role.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // SEND DM BEFORE BAN
            // =========================================

            try {

                await user.send({

                    embeds: [

                        new EmbedBuilder()

                            .setColor(
                                "#ED4245"
                            )

                            .setTitle(
                                "🔨 You Have Been Banned"
                            )

                            .setDescription(

                                `You have been banned from **${interaction.guild.name}**.`

                            )

                            .addFields(

                                {

                                    name:
                                        "📝 Reason",

                                    value:
                                        reason

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
                                        "🗑️ Message Deletion",

                                    value:
                                        deleteDays > 0
                                            ? `Last ${deleteDays} day(s)`
                                            : "No messages deleted",

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

                    `⚠️ Could not DM ${user.tag} before ban.`

                );

            }


            // =========================================
            // BAN USER
            // =========================================

            await interaction.guild.members.ban(

                user.id,

                {

                    deleteMessageSeconds:
                        deleteDays * 24 * 60 * 60,

                    reason:
                        reason

                }

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
                    "ban",

                reason:
                    reason,

                channelId:
                    interaction.channel.id,

                details:
                    `Message deletion: ${deleteDays} day(s)`,

                color:
                    "#ED4245",

                punishment:
                    "🔨 Member Banned"

            });


            // =========================================
            // SUCCESS EMBED
            // =========================================

            const embed =
                new EmbedBuilder()

                    .setColor(
                        "#ED4245"
                    )

                    .setTitle(
                        "🔨 Member Banned"
                    )

                    .setDescription(

                        `${user.tag} has been successfully banned from the server.`

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

                        },

                        {

                            name:
                                "🗑️ Messages Deleted",

                            value:
                                deleteDays > 0
                                    ? `Last ${deleteDays} day(s)`
                                    : "None"

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

                "❌ Ban Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while banning this user.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ I could not ban this user. Check my permissions and role position.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};