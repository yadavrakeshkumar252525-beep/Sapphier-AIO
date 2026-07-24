const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ChannelType
} = require("discord.js");

const LoggingConfig =
    require("../../models/LoggingConfig");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("logs")

        .setDescription(
            "Manage the server logging system"
        )

        // =========================================
        // SETUP
        // =========================================

        .addSubcommand(subcommand =>
            subcommand

                .setName("setup")

                .setDescription(
                    "Configure the server log channel"
                )

                .addChannelOption(option =>
                    option

                        .setName("channel")

                        .setDescription(
                            "Channel where logs will be sent"
                        )

                        .addChannelTypes(
                            ChannelType.GuildText
                        )

                        .setRequired(true)
                )
        )

        // =========================================
        // CONFIG
        // =========================================

        .addSubcommand(subcommand =>
            subcommand

                .setName("config")

                .setDescription(
                    "View logging configuration"
                )
        )

        // =========================================
        // RESET
        // =========================================

        .addSubcommand(subcommand =>
            subcommand

                .setName("reset")

                .setDescription(
                    "Disable the logging system"
                )
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),


    async execute(interaction) {

        try {

            const subcommand =
                interaction.options.getSubcommand();


            // =========================================
            // SETUP
            // =========================================

            if (
                subcommand === "setup"
            ) {

                const channel =
                    interaction.options.getChannel(
                        "channel"
                    );


                // =========================================
                // CHECK BOT PERMISSIONS
                // =========================================

                const botMember =
                    interaction.guild.members.me;


                const permissions =
                    channel.permissionsFor(
                        botMember
                    );


                if (
                    !permissions ||
                    !permissions.has([
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.EmbedLinks
                    ])
                ) {

                    return interaction.reply({

                        content:
                            "❌ I don't have the required permissions in that channel.\n\nRequired:\n• View Channel\n• Send Messages\n• Embed Links",

                        ephemeral:
                            true

                    });

                }


                // =========================================
                // SAVE CONFIG
                // =========================================

                await LoggingConfig.findOneAndUpdate(

                    {
                        guildId:
                            interaction.guild.id
                    },

                    {

                        guildId:
                            interaction.guild.id,

                        channelId:
                            channel.id,

                        enabled:
                            true,

                        createdBy:
                            interaction.user.id

                    },

                    {

                        upsert:
                            true,

                        new:
                            true

                    }

                );


                // =========================================
                // SUCCESS EMBED
                // =========================================

                const embed =
                    new EmbedBuilder()

                        .setColor(
                            "#3BA4FF"
                        )

                        .setTitle(
                            "📋 Logging System Enabled"
                        )

                        .setDescription(
                            "Server logging has been successfully configured."
                        )

                        .addFields(

                            {

                                name:
                                    "📢 Log Channel",

                                value:
                                    `${channel}`,

                                inline:
                                    true

                            },

                            {

                                name:
                                    "📊 Status",

                                value:
                                    "🟢 Enabled",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "📝 Logged Events",

                                value:
                                    "👤 Member Join\n🚪 Member Leave\n🗑️ Message Delete\n✏️ Message Edit\n🔨 Ban\n🔓 Unban\n🛡️ Verification\n⚠️ Moderation"

                            }

                        )

                        .setFooter({

                            text:
                                "Sapphier AIO • Logging System"

                        })

                        .setTimestamp();


                return interaction.reply({

                    embeds:
                        [embed],

                    ephemeral:
                        true

                });

            }


            // =========================================
            // CONFIG
            // =========================================

            if (
                subcommand === "config"
            ) {

                const config =
                    await LoggingConfig.findOne({

                        guildId:
                            interaction.guild.id

                    });


                if (!config) {

                    return interaction.reply({

                        content:
                            "❌ Logging system is not configured yet.\n\nUse `/logs setup` first.",

                        ephemeral:
                            true

                    });

                }


                const channel =
                    config.channelId

                        ? interaction.guild.channels.cache.get(
                            config.channelId
                        )

                        : null;


                const embed =
                    new EmbedBuilder()

                        .setColor(
                            "#3BA4FF"
                        )

                        .setTitle(
                            "⚙️ Logging Configuration"
                        )

                        .addFields(

                            {

                                name:
                                    "📊 Status",

                                value:
                                    config.enabled
                                        ? "🟢 Enabled"
                                        : "🔴 Disabled",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "📢 Log Channel",

                                value:
                                    channel
                                        ? `${channel}`
                                        : "❌ Channel Not Found",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "👤 Member Join",

                                value:
                                    config.memberJoin
                                        ? "🟢 Enabled"
                                        : "🔴 Disabled",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "🚪 Member Leave",

                                value:
                                    config.memberLeave
                                        ? "🟢 Enabled"
                                        : "🔴 Disabled",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "🗑️ Message Delete",

                                value:
                                    config.messageDelete
                                        ? "🟢 Enabled"
                                        : "🔴 Disabled",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "✏️ Message Edit",

                                value:
                                    config.messageEdit
                                        ? "🟢 Enabled"
                                        : "🔴 Disabled",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "🔨 Ban",

                                value:
                                    config.memberBan
                                        ? "🟢 Enabled"
                                        : "🔴 Disabled",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "🔓 Unban",

                                value:
                                    config.memberUnban
                                        ? "🟢 Enabled"
                                        : "🔴 Disabled",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "🛡️ Verification",

                                value:
                                    config.verification
                                        ? "🟢 Enabled"
                                        : "🔴 Disabled",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "⚠️ Moderation",

                                value:
                                    config.moderation
                                        ? "🟢 Enabled"
                                        : "🔴 Disabled",

                                inline:
                                    true

                            }

                        )

                        .setFooter({

                            text:
                                "Sapphier AIO • Logging System"

                        })

                        .setTimestamp();


                return interaction.reply({

                    embeds:
                        [embed],

                    ephemeral:
                        true

                });

            }


            // =========================================
            // RESET
            // =========================================

            if (
                subcommand === "reset"
            ) {

                const config =
                    await LoggingConfig.findOneAndUpdate(

                        {

                            guildId:
                                interaction.guild.id

                        },

                        {

                            enabled:
                                false,

                            channelId:
                                null

                        }

                    );


                if (!config) {

                    return interaction.reply({

                        content:
                            "ℹ️ Logging system is not configured.",

                        ephemeral:
                            true

                    });

                }


                return interaction.reply({

                    content:
                        "✅ Logging system has been disabled successfully.",

                    ephemeral:
                        true

                });

            }

        } catch (error) {

            console.error(
                "❌ Logs Command Error:",
                error
            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while processing the logs command.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ An unexpected error occurred while processing the logs command.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};