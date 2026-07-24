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

        .setName("timeout")

        .setDescription(
            "Timeout a member"
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription(
                    "The member to timeout"
                )
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName("duration")
                .setDescription(
                    "Timeout duration in minutes"
                )
                .setMinValue(1)
                .setMaxValue(40320)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription(
                    "Reason for the timeout"
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

            const duration =
                interaction.options.getInteger("duration");

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
                        "❌ You cannot timeout a bot.",

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
                        "❌ You cannot timeout yourself.",

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
                        "❌ You cannot timeout a member with an equal or higher role than you.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // BOT ROLE CHECK
            // =========================================

            const botMember =
                interaction.guild.members.me;


            if (
                !botMember ||
                member.roles.highest.position >=
                botMember.roles.highest.position
            ) {

                return interaction.reply({

                    content:
                        "❌ I cannot timeout this member because their highest role is equal to or higher than my highest role.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // TIMEOUT
            // =========================================

            await member.timeout(

                duration * 60 * 1000,

                reason

            );


            // =========================================
            // FORMAT DURATION
            // =========================================

            let durationText;

            if (
                duration >= 1440
            ) {

                const days =
                    Math.floor(
                        duration / 1440
                    );

                const hours =
                    Math.floor(
                        (duration % 1440) / 60
                    );

                durationText =
                    `${days} day(s)` +
                    (
                        hours > 0
                            ? ` ${hours} hour(s)`
                            : ""
                    );

            } else if (
                duration >= 60
            ) {

                const hours =
                    Math.floor(
                        duration / 60
                    );

                const minutes =
                    duration % 60;

                durationText =
                    `${hours} hour(s)` +
                    (
                        minutes > 0
                            ? ` ${minutes} minute(s)`
                            : ""
                    );

            } else {

                durationText =
                    `${duration} minute(s)`;

            }


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
                    "timeout",

                reason:
                    reason,

                channelId:
                    interaction.channel.id,

                details:
                    `Timeout duration: ${durationText}`,

                color:
                    "#FAA61A",

                punishment:
                    `🔇 Timeout for ${durationText}`

            });


            // =========================================
            // DM USER
            // =========================================

            try {

                await user.send({

                    embeds: [

                        new EmbedBuilder()

                            .setColor(
                                "#FAA61A"
                            )

                            .setTitle(
                                "🔇 You Have Been Timed Out"
                            )

                            .setDescription(

                                `You have been timed out in **${interaction.guild.name}**.`

                            )

                            .addFields(

                                {

                                    name:
                                        "⏱️ Duration",

                                    value:
                                        durationText,

                                    inline:
                                        true

                                },

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
                        "#FAA61A"
                    )

                    .setTitle(
                        "🔇 Member Timed Out"
                    )

                    .setDescription(

                        `${user} has been timed out successfully.`

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
                                "⏱️ Duration",

                            value:
                                durationText,

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

                "❌ Timeout Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while timing out this member.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ I could not timeout this member. Check my permissions and role position.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};