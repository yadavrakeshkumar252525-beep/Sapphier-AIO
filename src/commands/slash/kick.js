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

        .setName("kick")

        .setDescription(
            "Kick a member from the server"
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription(
                    "The member to kick"
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription(
                    "Reason for the kick"
                )
                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.KickMembers
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
                        "❌ You cannot kick a bot using this command.",

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
                        "❌ You cannot kick yourself.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // OWNER PROTECTION
            // =========================================

            if (
                user.id ===
                interaction.guild.ownerId
            ) {

                return interaction.reply({

                    content:
                        "❌ The server owner cannot be kicked.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // MODERATOR ROLE HIERARCHY
            // =========================================

            if (
                member.roles.highest.position >=
                interaction.member.roles.highest.position
            ) {

                return interaction.reply({

                    content:
                        "❌ You cannot kick a member with an equal or higher role than you.",

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
                !botMember
            ) {

                return interaction.reply({

                    content:
                        "❌ I could not find my bot member in this server.",

                    ephemeral:
                        true

                });

            }


            if (
                member.roles.highest.position >=
                botMember.roles.highest.position
            ) {

                return interaction.reply({

                    content:
                        "❌ I cannot kick this member because their highest role is equal to or higher than my highest role.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // SEND DM BEFORE KICK
            // =========================================

            try {

                await user.send({

                    embeds: [

                        new EmbedBuilder()

                            .setColor(
                                "#ED4245"
                            )

                            .setTitle(
                                "👢 You Have Been Kicked"
                            )

                            .setDescription(

                                `You have been kicked from **${interaction.guild.name}**.`

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

                    `⚠️ Could not DM ${user.tag} before kick.`

                );

            }


            // =========================================
            // KICK MEMBER
            // =========================================

            await member.kick(

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
                    "kick",

                reason:
                    reason,

                channelId:
                    interaction.channel.id,

                details:
                    "Member was manually kicked from the server.",

                color:
                    "#ED4245",

                punishment:
                    "👢 Member Kicked"

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
                        "👢 Member Kicked"
                    )

                    .setDescription(

                        `${user.tag} has been successfully kicked from the server.`

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

                "❌ Kick Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while kicking this member.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ I could not kick this member. Check my permissions and role position.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};