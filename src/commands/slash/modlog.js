const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    EmbedBuilder
} = require("discord.js");

const Guild =
    require("../../models/Guild");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("modlog")

        .setDescription(
            "Manage the moderation logging system"
        )

        // =========================================
        // SETUP
        // =========================================

        .addSubcommand(subcommand =>
            subcommand

                .setName("setup")

                .setDescription(
                    "Set the moderation log channel"
                )

                .addChannelOption(option =>
                    option

                        .setName("channel")

                        .setDescription(
                            "Channel where moderation logs will be sent"
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
                    "View moderation log configuration"
                )
        )

        // =========================================
        // RESET
        // =========================================

        .addSubcommand(subcommand =>
            subcommand

                .setName("reset")

                .setDescription(
                    "Disable moderation logging"
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
                // BOT PERMISSION CHECK
                // =========================================

                const botMember =
                    interaction.guild.members.me;


                const permissions =
                    channel.permissionsFor(
                        botMember
                    );


                if (
                    !permissions ||
                    !permissions.has(
                        PermissionFlagsBits.ViewChannel
                    ) ||
                    !permissions.has(
                        PermissionFlagsBits.SendMessages
                    ) ||
                    !permissions.has(
                        PermissionFlagsBits.EmbedLinks
                    )
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

                await Guild.findOneAndUpdate(

                    {
                        guildId:
                            interaction.guild.id
                    },

                    {
                        guildId:
                            interaction.guild.id,

                        modLogChannel:
                            channel.id
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
                            "📋 Moderation Logs Enabled"
                        )

                        .setDescription(

                            `All supported moderation actions will now be logged in ${channel}.`

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

                            }

                        )

                        .setFooter({

                            text:
                                "Sapphier AIO • Moderation Logs"

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
                    await Guild.findOne({

                        guildId:
                            interaction.guild.id

                    });


                if (
                    !config ||
                    !config.modLogChannel
                ) {

                    return interaction.reply({

                        content:
                            "❌ Moderation logging is not configured.\n\nUse `/modlog setup` first.",

                        ephemeral:
                            true

                    });

                }


                const channel =
                    interaction.guild.channels.cache.get(

                        config.modLogChannel

                    );


                const embed =
                    new EmbedBuilder()

                        .setColor(
                            "#3BA4FF"
                        )

                        .setTitle(
                            "📋 Moderation Log Configuration"
                        )

                        .addFields(

                            {

                                name:
                                    "📊 Status",

                                value:
                                    channel
                                        ? "🟢 Enabled"
                                        : "🟠 Channel Not Found",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "📢 Channel",

                                value:
                                    channel
                                        ? `${channel}`
                                        : `\`${config.modLogChannel}\``,

                                inline:
                                    true

                            }

                        )

                        .setFooter({

                            text:
                                "Sapphier AIO • Moderation Logs"

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
                    await Guild.findOneAndUpdate(

                        {
                            guildId:
                                interaction.guild.id
                        },

                        {

                            modLogChannel:
                                null

                        },

                        {

                            new:
                                true

                        }

                    );


                if (
                    !config
                ) {

                    return interaction.reply({

                        content:
                            "ℹ️ Moderation logging was not configured.",

                        ephemeral:
                            true

                    });

                }


                return interaction.reply({

                    content:
                        "✅ Moderation logging has been disabled successfully.",

                    ephemeral:
                        true

                });

            }

        } catch (error) {

            console.error(

                "❌ ModLog Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while managing moderation logs.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ An unexpected error occurred while managing moderation logs.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};