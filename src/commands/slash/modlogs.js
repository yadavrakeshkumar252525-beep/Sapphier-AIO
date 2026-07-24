const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const Log =
    require("../../models/Log");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("modlogs")

        .setDescription(
            "View a member's complete moderation history"
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription(
                    "The member whose moderation history you want to view"
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
                interaction.options.getUser(
                    "user"
                );


            // =========================================
            // GET MODERATION LOGS
            // =========================================

            const logs =
                await Log.find({

                    guildId:
                        interaction.guild.id,

                    userId:
                        user.id

                })
                .sort({

                    createdAt:
                        -1

                })
                .limit(10);


            // =========================================
            // NO LOGS
            // =========================================

            if (
                logs.length === 0
            ) {

                const embed =
                    new EmbedBuilder()

                        .setColor(
                            "#57F287"
                        )

                        .setTitle(
                            "📋 Moderation History"
                        )

                        .setDescription(

                            `${user} has no moderation records in this server. ✅`

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

            }


            // =========================================
            // FORMAT LOGS
            // =========================================

            const logList =
                logs
                    .map(

                        (log, index) => {

                            const action =
                                String(

                                    log.action ||

                                    "unknown"

                                ).toUpperCase();


                            const moderator =
                                log.moderatorId

                                    ? `<@${log.moderatorId}>`

                                    : "Unknown Moderator";


                            const reason =
                                log.reason ||

                                "No reason provided";


                            const details =
                                log.details ||

                                "No additional details";


                            const time =
                                log.createdAt

                                    ? `<t:${Math.floor(
                                        log.createdAt.getTime() /
                                        1000
                                    )}:R>`

                                    : "Unknown";


                            return (

                                `**${index + 1}. ${action}**\n` +

                                `👮 **Moderator:** ${moderator}\n` +

                                `📝 **Reason:** ${reason}\n` +

                                `📌 **Details:** ${details}\n` +

                                `🕐 **Time:** ${time}`

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
                        "#3BA4FF"
                    )

                    .setTitle(
                        "📋 Moderation History"
                    )

                    .setDescription(

                        `Complete moderation history for ${user}`

                    )

                    .addFields(

                        {

                            name:
                                "👤 Target User",

                            value:
                                `${user.tag}\n\`${user.id}\``,

                            inline:
                                true

                        },

                        {

                            name:
                                "📊 Records",

                            value:
                                `${logs.length}`,

                            inline:
                                true

                        }

                    )

                    .addFields({

                        name:
                            "📜 Recent Moderation Actions",

                        value:
                            logList.length > 1024

                                ? logList.substring(
                                    0,
                                    1021
                                ) + "..."

                                : logList

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
                            "Showing latest 10 records • Sapphier AIO"

                    })

                    .setTimestamp();


            return interaction.reply({

                embeds:
                    [embed]

            });


        } catch (error) {

            console.error(

                "❌ ModLogs Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while fetching moderation history.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ I could not fetch this member's moderation history.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};