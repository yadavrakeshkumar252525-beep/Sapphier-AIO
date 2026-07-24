const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ChannelType
} = require("discord.js");

const Welcome =
    require("../../models/Welcome");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("welcome")

        .setDescription(
            "Manage the server welcome and goodbye system"
        )

        // =========================================
        // WELCOME SETUP
        // =========================================

        .addSubcommand(subcommand =>
            subcommand
                .setName("setup")
                .setDescription(
                    "Configure the welcome system"
                )

                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription(
                            "Welcome channel"
                        )
                        .addChannelTypes(
                            ChannelType.GuildText
                        )
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName("message")
                        .setDescription(
                            "Use {user}, {server}, {count}"
                        )
                        .setRequired(false)
                )

                .addBooleanOption(option =>
                    option
                        .setName("embed")
                        .setDescription(
                            "Use embed"
                        )
                        .setRequired(false)
                )

                .addBooleanOption(option =>
                    option
                        .setName("mention")
                        .setDescription(
                            "Mention new member"
                        )
                        .setRequired(false)
                )
        )

        // =========================================
        // WELCOME CONFIG
        // =========================================

        .addSubcommand(subcommand =>
            subcommand
                .setName("config")
                .setDescription(
                    "View welcome configuration"
                )
        )

        // =========================================
        // WELCOME TEST
        // =========================================

        .addSubcommand(subcommand =>
            subcommand
                .setName("test")
                .setDescription(
                    "Test welcome message"
                )
        )

        // =========================================
        // WELCOME RESET
        // =========================================

        .addSubcommand(subcommand =>
            subcommand
                .setName("reset")
                .setDescription(
                    "Reset welcome system"
                )
        )

        // =========================================
        // GOODBYE SETUP
        // =========================================

        .addSubcommand(subcommand =>
            subcommand
                .setName("goodbye-setup")
                .setDescription(
                    "Configure the goodbye system"
                )

                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription(
                            "Goodbye channel"
                        )
                        .addChannelTypes(
                            ChannelType.GuildText
                        )
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName("message")
                        .setDescription(
                            "Use {user}, {server}, {count}"
                        )
                        .setRequired(false)
                )

                .addBooleanOption(option =>
                    option
                        .setName("embed")
                        .setDescription(
                            "Use embed"
                        )
                        .setRequired(false)
                )
        )

        // =========================================
        // GOODBYE CONFIG
        // =========================================

        .addSubcommand(subcommand =>
            subcommand
                .setName("goodbye-config")
                .setDescription(
                    "View goodbye configuration"
                )
        )

        // =========================================
        // GOODBYE TEST
        // =========================================

        .addSubcommand(subcommand =>
            subcommand
                .setName("goodbye-test")
                .setDescription(
                    "Test goodbye message"
                )
        )

        // =========================================
        // GOODBYE RESET
        // =========================================

        .addSubcommand(subcommand =>
            subcommand
                .setName("goodbye-reset")
                .setDescription(
                    "Reset goodbye system"
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
            // WELCOME SETUP
            // =========================================

            if (
                subcommand === "setup"
            ) {

                const channel =
                    interaction.options.getChannel(
                        "channel"
                    );

                const message =
                    interaction.options.getString(
                        "message"
                    ) ||
                    "Welcome {user} to **{server}**! 🎉\nYou are our **{count}th member**!";

                const embed =
                    interaction.options.getBoolean(
                        "embed"
                    ) ?? true;

                const mention =
                    interaction.options.getBoolean(
                        "mention"
                    ) ?? true;


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


                await Welcome.findOneAndUpdate(

                    {
                        guildId:
                            interaction.guild.id
                    },

                    {

                        guildId:
                            interaction.guild.id,

                        enabled:
                            true,

                        channelId:
                            channel.id,

                        message:
                            message,

                        embedEnabled:
                            embed,

                        mentionUser:
                            mention,

                        showMemberCount:
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


                const successEmbed =
                    new EmbedBuilder()

                        .setColor(
                            "#3BA4FF"
                        )

                        .setTitle(
                            "👋 Welcome System Enabled"
                        )

                        .setDescription(
                            "The welcome system has been successfully configured."
                        )

                        .addFields(

                            {

                                name:
                                    "📢 Channel",

                                value:
                                    `${channel}`,

                                inline:
                                    true

                            },

                            {

                                name:
                                    "🖼️ Embed",

                                value:
                                    embed
                                        ? "Enabled"
                                        : "Disabled",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "🏷️ Mention",

                                value:
                                    mention
                                        ? "Enabled"
                                        : "Disabled",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "📝 Message",

                                value:
                                    message.length > 1024
                                        ? message.substring(
                                            0,
                                            1021
                                        ) + "..."
                                        : message

                            }

                        )

                        .setFooter({

                            text:
                                "Sapphier AIO • Welcome System"

                        })

                        .setTimestamp();


                return interaction.reply({

                    embeds:
                        [successEmbed],

                    ephemeral:
                        true

                });

            }


            // =========================================
            // WELCOME CONFIG
            // =========================================

            if (
                subcommand === "config"
            ) {

                const config =
                    await Welcome.findOne({

                        guildId:
                            interaction.guild.id

                    });


                if (!config) {

                    return interaction.reply({

                        content:
                            "❌ Welcome system is not configured yet.",

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


                const configEmbed =
                    new EmbedBuilder()

                        .setColor(
                            "#3BA4FF"
                        )

                        .setTitle(
                            "⚙️ Welcome Configuration"
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
                                    "📢 Channel",

                                value:
                                    channel
                                        ? `${channel}`
                                        : "Not found",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "🖼️ Embed",

                                value:
                                    config.embedEnabled
                                        ? "Enabled"
                                        : "Disabled",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "🏷️ Mention",

                                value:
                                    config.mentionUser
                                        ? "Enabled"
                                        : "Disabled",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "📝 Message",

                                value:
                                    config.message.length > 1024
                                        ? config.message.substring(
                                            0,
                                            1021
                                        ) + "..."
                                        : config.message

                            }

                        )

                        .setFooter({

                            text:
                                "Sapphier AIO • Welcome System"

                        })

                        .setTimestamp();


                return interaction.reply({

                    embeds:
                        [configEmbed],

                    ephemeral:
                        true

                });

            }


            // =========================================
            // WELCOME TEST
            // =========================================

            if (
                subcommand === "test"
            ) {

                const config =
                    await Welcome.findOne({

                        guildId:
                            interaction.guild.id

                    });


                if (
                    !config ||
                    !config.enabled
                ) {

                    return interaction.reply({

                        content:
                            "❌ Welcome system is not configured.\n\nUse `/welcome setup` first.",

                        ephemeral:
                            true

                    });

                }


                const channel =
                    interaction.guild.channels.cache.get(
                        config.channelId
                    );


                if (
                    !channel ||
                    !channel.isTextBased()
                ) {

                    return interaction.reply({

                        content:
                            "❌ Welcome channel was not found.",

                        ephemeral:
                            true

                    });

                }


                const formattedMessage =
                    config.message

                        .replace(
                            /{user}/g,
                            `<@${interaction.user.id}>`
                        )

                        .replace(
                            /{server}/g,
                            interaction.guild.name
                        )

                        .replace(
                            /{count}/g,
                            interaction.guild.memberCount.toString()
                        );


                if (
                    config.embedEnabled
                ) {

                    const testEmbed =
                        new EmbedBuilder()

                            .setColor(
                                config.color ||
                                "#3BA4FF"
                            )

                            .setTitle(
                                `👋 Welcome to ${interaction.guild.name}!`
                            )

                            .setDescription(
                                formattedMessage
                            )

                            .setThumbnail(

                                interaction.user.displayAvatarURL({

                                    dynamic:
                                        true,

                                    size:
                                        256

                                })

                            )

                            .setFooter({

                                text:
                                    "Sapphier AIO • Welcome Test"

                            })

                            .setTimestamp();


                    await channel.send({

                        content:
                            config.mentionUser
                                ? `<@${interaction.user.id}>`
                                : undefined,

                        embeds:
                            [testEmbed]

                    });

                } else {

                    await channel.send({

                        content:
                            config.mentionUser

                                ? `<@${interaction.user.id}> ${formattedMessage}`

                                : formattedMessage

                    });

                }


                return interaction.reply({

                    content:
                        `✅ Welcome test message sent successfully in ${channel}.`,

                    ephemeral:
                        true

                });

            }


            // =========================================
            // WELCOME RESET
            // =========================================

            if (
                subcommand === "reset"
            ) {

                const deleted =
                    await Welcome.findOneAndUpdate(

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


                if (!deleted) {

                    return interaction.reply({

                        content:
                            "ℹ️ Welcome system is not configured.",

                        ephemeral:
                            true

                    });

                }


                return interaction.reply({

                    content:
                        "✅ Welcome system has been disabled successfully.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // GOODBYE SETUP
            // =========================================

            if (
                subcommand === "goodbye-setup"
            ) {

                const channel =
                    interaction.options.getChannel(
                        "channel"
                    );

                const message =
                    interaction.options.getString(
                        "message"
                    ) ||
                    "👋 **{user}** has left **{server}**.\nWe now have **{count} members**.";

                const embed =
                    interaction.options.getBoolean(
                        "embed"
                    ) ?? true;


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


                await Welcome.findOneAndUpdate(

                    {
                        guildId:
                            interaction.guild.id
                    },

                    {

                        guildId:
                            interaction.guild.id,

                        goodbyeEnabled:
                            true,

                        goodbyeChannelId:
                            channel.id,

                        goodbyeMessage:
                            message,

                        goodbyeEmbedEnabled:
                            embed,

                        showGoodbyeMemberCount:
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


                const goodbyeEmbed =
                    new EmbedBuilder()

                        .setColor(
                            "#FF4D4D"
                        )

                        .setTitle(
                            "👋 Goodbye System Enabled"
                        )

                        .setDescription(
                            "The goodbye system has been successfully configured."
                        )

                        .addFields(

                            {

                                name:
                                    "📢 Channel",

                                value:
                                    `${channel}`,

                                inline:
                                    true

                            },

                            {

                                name:
                                    "🖼️ Embed",

                                value:
                                    embed
                                        ? "Enabled"
                                        : "Disabled",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "📝 Message",

                                value:
                                    message.length > 1024
                                        ? message.substring(
                                            0,
                                            1021
                                        ) + "..."
                                        : message

                            }

                        )

                        .setFooter({

                            text:
                                "Sapphier AIO • Goodbye System"

                        })

                        .setTimestamp();


                return interaction.reply({

                    embeds:
                        [goodbyeEmbed],

                    ephemeral:
                        true

                });

            }


            // =========================================
            // GOODBYE CONFIG
            // =========================================

            if (
                subcommand === "goodbye-config"
            ) {

                const config =
                    await Welcome.findOne({

                        guildId:
                            interaction.guild.id

                    });


                if (
                    !config ||
                    !config.goodbyeEnabled
                ) {

                    return interaction.reply({

                        content:
                            "❌ Goodbye system is not configured yet.",

                        ephemeral:
                            true

                    });

                }


                const channel =
                    config.goodbyeChannelId
                        ? interaction.guild.channels.cache.get(
                            config.goodbyeChannelId
                        )
                        : null;


                const embed =
                    new EmbedBuilder()

                        .setColor(
                            "#FF4D4D"
                        )

                        .setTitle(
                            "⚙️ Goodbye Configuration"
                        )

                        .addFields(

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
                                    "📢 Channel",

                                value:
                                    channel
                                        ? `${channel}`
                                        : "Not found",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "🖼️ Embed",

                                value:
                                    config.goodbyeEmbedEnabled
                                        ? "Enabled"
                                        : "Disabled",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "📝 Message",

                                value:
                                    config.goodbyeMessage.length > 1024
                                        ? config.goodbyeMessage.substring(
                                            0,
                                            1021
                                        ) + "..."
                                        : config.goodbyeMessage

                            }

                        )

                        .setFooter({

                            text:
                                "Sapphier AIO • Goodbye System"

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
            // GOODBYE TEST
            // =========================================

            if (
                subcommand === "goodbye-test"
            ) {

                const config =
                    await Welcome.findOne({

                        guildId:
                            interaction.guild.id

                    });


                if (
                    !config ||
                    !config.goodbyeEnabled
                ) {

                    return interaction.reply({

                        content:
                            "❌ Goodbye system is not configured.\n\nUse `/welcome goodbye-setup` first.",

                        ephemeral:
                            true

                    });

                }


                const channel =
                    interaction.guild.channels.cache.get(
                        config.goodbyeChannelId
                    );


                if (
                    !channel ||
                    !channel.isTextBased()
                ) {

                    return interaction.reply({

                        content:
                            "❌ Goodbye channel was not found.",

                        ephemeral:
                            true

                    });

                }


                const formattedMessage =
                    config.goodbyeMessage

                        .replace(
                            /{user}/g,
                            interaction.user.tag
                        )

                        .replace(
                            /{server}/g,
                            interaction.guild.name
                        )

                        .replace(
                            /{count}/g,
                            Math.max(
                                0,
                                interaction.guild.memberCount - 1
                            ).toString()
                        );


                if (
                    config.goodbyeEmbedEnabled
                ) {

                    const testEmbed =
                        new EmbedBuilder()

                            .setColor(
                                config.goodbyeColor ||
                                "#FF4D4D"
                            )

                            .setTitle(
                                "👋 Member Left"
                            )

                            .setDescription(
                                formattedMessage
                            )

                            .setThumbnail(

                                interaction.user.displayAvatarURL({

                                    dynamic:
                                        true,

                                    size:
                                        256

                                })

                            )

                            .setFooter({

                                text:
                                    "Sapphier AIO • Goodbye Test"

                            })

                            .setTimestamp();


                    await channel.send({

                        embeds:
                            [testEmbed]

                    });

                } else {

                    await channel.send({

                        content:
                            formattedMessage

                    });

                }


                return interaction.reply({

                    content:
                        `✅ Goodbye test message sent successfully in ${channel}.`,

                    ephemeral:
                        true

                });

            }


            // =========================================
            // GOODBYE RESET
            // =========================================

            if (
                subcommand === "goodbye-reset"
            ) {

                const config =
                    await Welcome.findOneAndUpdate(

                        {
                            guildId:
                                interaction.guild.id
                        },

                        {

                            goodbyeEnabled:
                                false,

                            goodbyeChannelId:
                                null

                        }

                    );


                if (!config) {

                    return interaction.reply({

                        content:
                            "ℹ️ Goodbye system is not configured.",

                        ephemeral:
                            true

                    });

                }


                return interaction.reply({

                    content:
                        "✅ Goodbye system has been disabled successfully.",

                    ephemeral:
                        true

                });

            }

        } catch (error) {

            console.error(
                "❌ Welcome Command Error:",
                error
            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while processing the command.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ An unexpected error occurred while processing the command.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};