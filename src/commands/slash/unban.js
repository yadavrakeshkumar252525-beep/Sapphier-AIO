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

        .setName("unban")

        .setDescription(
            "Unban a user from the server"
        )

        .addStringOption(option =>
            option
                .setName("user_id")
                .setDescription(
                    "The Discord User ID of the banned user"
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription(
                    "Reason for removing the ban"
                )
                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.BanMembers
        ),

    async execute(interaction) {

        try {

            // =========================================
            // GET OPTIONS
            // =========================================

            const userId =
                interaction.options.getString(
                    "user_id"
                );

            const reason =
                interaction.options.getString(
                    "reason"
                );


            // =========================================
            // USER ID VALIDATION
            // =========================================

            if (
                !/^\d{17,20}$/.test(userId)
            ) {

                return interaction.reply({

                    content:
                        "❌ Invalid Discord User ID. Please provide a valid User ID.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // CHECK BAN
            // =========================================

            let bannedUser;

            try {

                bannedUser =
                    await interaction.guild.bans.fetch(
                        userId
                    );

            } catch {

                return interaction.reply({

                    content:
                        "❌ This user is not currently banned from this server.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // UNBAN USER
            // =========================================

            await interaction.guild.members.unban(

                userId,

                reason

            );


            // =========================================
            // MODERATION LOG
            // =========================================

            await logModeration({

                guild:
                    interaction.guild,

                user:
                    bannedUser.user,

                moderator:
                    interaction.user,

                action:
                    "unban",

                reason:
                    reason,

                channelId:
                    interaction.channel.id,

                details:
                    "User ban was manually removed.",

                color:
                    "#57F287",

                punishment:
                    "🔓 Ban Removed"

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
                        "🔓 User Unbanned"
                    )

                    .setDescription(

                        `**${bannedUser.user.tag}** has been successfully unbanned.`

                    )

                    .addFields(

                        {

                            name:
                                "👤 User",

                            value:
                                `${bannedUser.user.tag}\n\`${userId}\``,

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

                        bannedUser.user.displayAvatarURL({

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

                "❌ Unban Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while unbanning this user.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ I could not unban this user. Check my permissions and try again.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};