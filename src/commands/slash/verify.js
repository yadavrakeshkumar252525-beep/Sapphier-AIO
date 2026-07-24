const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType
} = require("discord.js");

const Verification = require("../../models/Verification");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Manage the server verification system")

        // =========================================
        // /verify setup
        // =========================================
        .addSubcommand(subcommand =>
            subcommand
                .setName("setup")
                .setDescription("Configure the verification system")

                .addRoleOption(option =>
                    option
                        .setName("role")
                        .setDescription(
                            "Role given to members after verification"
                        )
                        .setRequired(true)
                )

                .addChannelOption(option =>
                    option
                        .setName("log_channel")
                        .setDescription(
                            "Channel where verification logs will be sent"
                        )
                        .addChannelTypes(
                            ChannelType.GuildText
                        )
                        .setRequired(false)
                )

                .addIntegerOption(option =>
                    option
                        .setName("minimum_age")
                        .setDescription(
                            "Minimum Discord account age in days (0 = disabled)"
                        )
                        .setMinValue(0)
                        .setMaxValue(3650)
                        .setRequired(false)
                )
        )

        // =========================================
        // /verify panel
        // =========================================
        .addSubcommand(subcommand =>
            subcommand
                .setName("panel")
                .setDescription(
                    "Create the verification panel"
                )
        )

        // =========================================
        // /verify config
        // =========================================
        .addSubcommand(subcommand =>
            subcommand
                .setName("config")
                .setDescription(
                    "View verification configuration"
                )
        )

        // =========================================
        // /verify reset
        // =========================================
        .addSubcommand(subcommand =>
            subcommand
                .setName("reset")
                .setDescription(
                    "Reset verification configuration"
                )
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        try {

            if (!interaction.guild) {
                return interaction.reply({
                    content:
                        "❌ This command can only be used inside a server.",
                    ephemeral: true
                });
            }

            const subcommand =
                interaction.options.getSubcommand();


            // =========================================
            // SETUP
            // =========================================

            if (subcommand === "setup") {

                const role =
                    interaction.options.getRole("role");

                const logChannel =
                    interaction.options.getChannel(
                        "log_channel"
                    );

                const minimumAge =
                    interaction.options.getInteger(
                        "minimum_age"
                    ) ?? 0;


                // =========================================
                // BOT MEMBER
                // =========================================

                const botMember =
                    interaction.guild.members.me;

                if (!botMember) {
                    return interaction.reply({
                        content:
                            "❌ I couldn't find my bot member in this server.",
                        ephemeral: true
                    });
                }


                // =========================================
                // ROLE HIERARCHY
                // =========================================

                if (
                    role.position >=
                    botMember.roles.highest.position
                ) {
                    return interaction.reply({
                        content:
                            "❌ I cannot assign this role because it is higher than or equal to my highest role.\n\nMove my bot role above the verification role and try again.",
                        ephemeral: true
                    });
                }


                // =========================================
                // LOG CHANNEL PERMISSIONS
                // =========================================

                if (logChannel) {

                    const permissions =
                        logChannel.permissionsFor(
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
                                "❌ I don't have the required permissions in the selected log channel.\n\nRequired:\n• View Channel\n• Send Messages\n• Embed Links",
                            ephemeral: true
                        });
                    }
                }


                // =========================================
                // SAVE CONFIG
                // =========================================

                await Verification.findOneAndUpdate(
                    {
                        guildId:
                            interaction.guild.id
                    },
                    {
                        guildId:
                            interaction.guild.id,

                        roleId:
                            role.id,

                        logChannel:
                            logChannel
                                ? logChannel.id
                                : null,

                        minimumAccountAge:
                            minimumAge,

                        enabled:
                            true,

                        method:
                            "button"
                    },
                    {
                        upsert: true,
                        new: true
                    }
                );


                // =========================================
                // SETUP EMBED
                // =========================================

                const embed =
                    new EmbedBuilder()
                        .setColor("#3BA4FF")
                        .setTitle(
                            "⚙️ Verification Setup Complete"
                        )
                        .setDescription(
                            "The Sapphier AIO verification system has been configured successfully."
                        )
                        .addFields(

                            {
                                name:
                                    "🛡️ Verification Role",
                                value:
                                    `${role}`,
                                inline:
                                    true
                            },

                            {
                                name:
                                    "📝 Log Channel",
                                value:
                                    logChannel
                                        ? `${logChannel}`
                                        : "Disabled",
                                inline:
                                    true
                            },

                            {
                                name:
                                    "📅 Minimum Account Age",
                                value:
                                    minimumAge === 0
                                        ? "Disabled"
                                        : `${minimumAge} day(s)`,
                                inline:
                                    true
                            },

                            {
                                name:
                                    "🔐 Method",
                                value:
                                    "Button Verification",
                                inline:
                                    true
                            }

                        )
                        .setFooter({
                            text:
                                "Sapphier AIO • Verification System"
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
            // PANEL
            // =========================================

            if (subcommand === "panel") {

                const config =
                    await Verification.findOne({
                        guildId:
                            interaction.guild.id
                    });

                if (
                    !config ||
                    !config.roleId
                ) {
                    return interaction.reply({
                        content:
                            "❌ Verification is not configured yet.\n\nFirst run `/verify setup`.",
                        ephemeral: true
                    });
                }


                const role =
                    interaction.guild.roles.cache.get(
                        config.roleId
                    );

                if (!role) {
                    return interaction.reply({
                        content:
                            "❌ The configured verification role no longer exists.\n\nPlease run `/verify setup` again.",
                        ephemeral: true
                    });
                }


                const ageText =
                    config.minimumAccountAge > 0
                        ? `Accounts must be at least **${config.minimumAccountAge} day(s)** old.`
                        : "No minimum account age requirement.";


                const embed =
                    new EmbedBuilder()
                        .setColor("#3BA4FF")
                        .setTitle(
                            "🔒 Server Verification"
                        )
                        .setDescription(
                            "Welcome to the server! 💎\n\n" +
                            "To gain access to the server, click the **Verify** button below.\n\n" +
                            ageText
                        )
                        .addFields(

                            {
                                name:
                                    "🛡️ Verification Role",
                                value:
                                    `${role}`,
                                inline:
                                    true
                            },

                            {
                                name:
                                    "🔐 Security",
                                value:
                                    "Account Age Protection",
                                inline:
                                    true
                            },

                            {
                                name:
                                    "⚡ Status",
                                value:
                                    "🟢 Active",
                                inline:
                                    true
                            }

                        )
                        .setFooter({
                            text:
                                "Sapphier AIO • Verification System"
                        })
                        .setTimestamp();


                const row =
                    new ActionRowBuilder()
                        .addComponents(

                            new ButtonBuilder()
                                .setCustomId(
                                    "verify_button"
                                )
                                .setLabel(
                                    "Verify"
                                )
                                .setEmoji(
                                    "✅"
                                )
                                .setStyle(
                                    ButtonStyle.Success
                                )

                        );


                const msg =
                    await interaction.channel.send({
                        embeds:
                            [embed],
                        components:
                            [row]
                    });


                await Verification.findOneAndUpdate(
                    {
                        guildId:
                            interaction.guild.id
                    },
                    {
                        channelId:
                            interaction.channel.id,

                        messageId:
                            msg.id,

                        enabled:
                            true
                    },
                    {
                        upsert:
                            true
                    }
                );


                return interaction.reply({
                    content:
                        "✅ Verification panel created successfully.",
                    ephemeral:
                        true
                });

            }


            // =========================================
            // CONFIG
            // =========================================

            if (subcommand === "config") {

                const config =
                    await Verification.findOne({
                        guildId:
                            interaction.guild.id
                    });

                if (!config) {
                    return interaction.reply({
                        content:
                            "❌ Verification has not been configured yet.",
                        ephemeral: true
                    });
                }


                const role =
                    config.roleId
                        ? interaction.guild.roles.cache.get(
                            config.roleId
                        )
                        : null;


                const channel =
                    config.channelId
                        ? interaction.guild.channels.cache.get(
                            config.channelId
                        )
                        : null;


                const logChannel =
                    config.logChannel
                        ? interaction.guild.channels.cache.get(
                            config.logChannel
                        )
                        : null;


                const embed =
                    new EmbedBuilder()
                        .setColor("#3BA4FF")
                        .setTitle(
                            "⚙️ Verification Configuration"
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
                                    "🛡️ Verification Role",
                                value:
                                    role
                                        ? `${role}`
                                        : "Not configured",
                                inline:
                                    true
                            },

                            {
                                name:
                                    "📢 Panel Channel",
                                value:
                                    channel
                                        ? `${channel}`
                                        : "Not configured",
                                inline:
                                    true
                            },

                            {
                                name:
                                    "📝 Log Channel",
                                value:
                                    logChannel
                                        ? `${logChannel}`
                                        : "Disabled",
                                inline:
                                    true
                            },

                            {
                                name:
                                    "📅 Minimum Account Age",
                                value:
                                    config.minimumAccountAge > 0
                                        ? `${config.minimumAccountAge} day(s)`
                                        : "Disabled",
                                inline:
                                    true
                            },

                            {
                                name:
                                    "🔐 Method",
                                value:
                                    config.method ||
                                    "button",
                                inline:
                                    true
                            }

                        )
                        .setFooter({
                            text:
                                "Sapphier AIO • Verification System"
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

            if (subcommand === "reset") {

                const deleted =
                    await Verification.findOneAndDelete({
                        guildId:
                            interaction.guild.id
                    });


                if (!deleted) {
                    return interaction.reply({
                        content:
                            "ℹ️ No verification configuration was found.",
                        ephemeral:
                            true
                    });
                }


                return interaction.reply({
                    content:
                        "✅ Verification configuration has been reset successfully.",
                    ephemeral:
                        true
                });

            }

        } catch (error) {

            console.error(
                "❌ Verification Command Error:",
                error
            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {
                return interaction.followUp({
                    content:
                        "❌ An unexpected error occurred while processing the verification command.",
                    ephemeral:
                        true
                }).catch(() => {});
            }


            return interaction.reply({
                content:
                    "❌ An unexpected error occurred while processing the verification command.",
                ephemeral:
                    true
            }).catch(() => {});

        }

    }
};