const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const Warning =
    require("../../models/Warning");

const Guild =
    require("../../models/Guild");

const {
    logModeration
} = require("../../utils/modLogger");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("warn")

        .setDescription(
            "Warn a member"
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription(
                    "The member to warn"
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription(
                    "Reason for the warning"
                )
                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ModerateMembers
        ),

    async execute(interaction) {

        try {

            // =========================================
            // GET USER & REASON
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
                        "❌ You cannot warn a bot.",

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
                        "❌ You cannot warn yourself.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // ROLE HIERARCHY
            // =========================================

            const moderator =
                interaction.member;

            if (
                member.roles.highest.position >=
                moderator.roles.highest.position
            ) {

                return interaction.reply({

                    content:
                        "❌ You cannot warn a member with an equal or higher role than you.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // CREATE WARNING
            // =========================================

            const warning =
                await Warning.create({

                    guildId:
                        interaction.guild.id,

                    userId:
                        user.id,

                    moderatorId:
                        interaction.user.id,

                    reason:
                        reason

                });


            // =========================================
            // GET WARNING COUNT
            // =========================================

            const warningCount =
                await Warning.countDocuments({

                    guildId:
                        interaction.guild.id,

                    userId:
                        user.id

                });


            // =========================================
            // GET GUILD CONFIG
            // =========================================

            let guildConfig =
                await Guild.findOne({

                    guildId:
                        interaction.guild.id

                });


            if (!guildConfig) {

                guildConfig =
                    await Guild.create({

                        guildId:
                            interaction.guild.id

                    });

            }


            // =========================================
            // PUNISHMENT
            // =========================================

            let punishment =
                "⚠️ Warning added";

            let punishmentApplied =
                false;


            const punishmentSettings =
                guildConfig.warningPunishments;


            const thresholds =
                punishmentSettings?.thresholds || {};


            // =========================================
            // AUTOMATIC PUNISHMENT
            // =========================================

            if (
                punishmentSettings?.enabled
            ) {


                // =========================================
                // 7+ WARNINGS = BAN
                // =========================================

                if (
                    warningCount >=
                    (thresholds.ban || 7)
                ) {

                    try {

                        await interaction.guild.members.ban(

                            user.id,

                            {

                                reason:
                                    `Automatic punishment: ${warningCount} warnings | ${reason}`

                            }

                        );

                        punishment =
                            "🔨 Automatic Ban";

                        punishmentApplied =
                            true;

                    } catch (error) {

                        console.error(

                            "❌ Automatic Ban Error:",

                            error

                        );

                        punishment =
                            "⚠️ Warning added, but automatic ban failed";

                    }

                }


                // =========================================
                // 6+ WARNINGS = KICK
                // =========================================

                else if (
                    warningCount >=
                    (thresholds.kick || 6)
                ) {

                    try {

                        await member.kick(

                            `Automatic punishment: ${warningCount} warnings | ${reason}`

                        );

                        punishment =
                            "👢 Automatic Kick";

                        punishmentApplied =
                            true;

                    } catch (error) {

                        console.error(

                            "❌ Automatic Kick Error:",

                            error

                        );

                        punishment =
                            "⚠️ Warning added, but automatic kick failed";

                    }

                }


                // =========================================
                // 5+ WARNINGS = 1 DAY TIMEOUT
                // =========================================

                else if (
                    warningCount >=
                    (thresholds.timeout1d || 5)
                ) {

                    try {

                        await member.timeout(

                            24 * 60 * 60 * 1000,

                            `Automatic punishment: ${warningCount} warnings`

                        );

                        punishment =
                            "🔇 Automatic Timeout: 1 Day";

                        punishmentApplied =
                            true;

                    } catch (error) {

                        console.error(

                            "❌ Automatic 1 Day Timeout Error:",

                            error

                        );

                        punishment =
                            "⚠️ Warning added, but automatic timeout failed";

                    }

                }


                // =========================================
                // 4+ WARNINGS = 1 HOUR TIMEOUT
                // =========================================

                else if (
                    warningCount >=
                    (thresholds.timeout1h || 4)
                ) {

                    try {

                        await member.timeout(

                            60 * 60 * 1000,

                            `Automatic punishment: ${warningCount} warnings`

                        );

                        punishment =
                            "🔇 Automatic Timeout: 1 Hour";

                        punishmentApplied =
                            true;

                    } catch (error) {

                        console.error(

                            "❌ Automatic 1 Hour Timeout Error:",

                            error

                        );

                        punishment =
                            "⚠️ Warning added, but automatic timeout failed";

                    }

                }


                // =========================================
                // 3+ WARNINGS = 10 MINUTE TIMEOUT
                // =========================================

                else if (
                    warningCount >=
                    (thresholds.timeout10m || 3)
                ) {

                    try {

                        await member.timeout(

                            10 * 60 * 1000,

                            `Automatic punishment: ${warningCount} warnings`

                        );

                        punishment =
                            "🔇 Automatic Timeout: 10 Minutes";

                        punishmentApplied =
                            true;

                    } catch (error) {

                        console.error(

                            "❌ Automatic 10 Minute Timeout Error:",

                            error

                        );

                        punishment =
                            "⚠️ Warning added, but automatic timeout failed";

                    }

                }

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
                    "warn",

                reason:
                    reason,

                channelId:
                    interaction.channel.id,

                details:
                    `Warning #${warningCount} | Warning ID: ${warning._id}`,

                color:
                    "#FEE75C",

                punishment:
                    punishment

            });


            // =========================================
            // DM USER
            // =========================================

            try {

                await user.send({

                    embeds: [

                        new EmbedBuilder()

                            .setColor(
                                "#FEE75C"
                            )

                            .setTitle(
                                "⚠️ You Have Received a Warning"
                            )

                            .setDescription(

                                `You have received a warning in **${interaction.guild.name}**.`

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
                                        "⚠️ Total Warnings",

                                    value:
                                        `${warningCount}`,

                                    inline:
                                        true

                                },

                                {

                                    name:
                                        "⚖️ Action",

                                    value:
                                        punishment,

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
                        "#FEE75C"
                    )

                    .setTitle(
                        "⚠️ Member Warned"
                    )

                    .setDescription(

                        `${user} has received a warning.`

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
                                "⚠️ Total Warnings",

                            value:
                                `${warningCount}`,

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
                                "📝 Reason",

                            value:
                                reason

                        },

                        {

                            name:
                                "⚖️ Punishment",

                            value:
                                punishment

                        },

                        {

                            name:
                                "🆔 Warning ID",

                            value:
                                `\`${warning._id}\``

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

                "❌ Warn Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while warning this member.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ An unexpected error occurred while warning this member.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};