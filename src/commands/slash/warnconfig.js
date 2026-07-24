const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const Guild =
    require("../../models/Guild");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("warnconfig")

        .setDescription(
            "Configure automatic warning punishments"
        )

        // =========================================
        // ENABLE
        // =========================================

        .addSubcommand(subcommand =>
            subcommand

                .setName("enable")

                .setDescription(
                    "Enable automatic warning punishments"
                )
        )

        // =========================================
        // DISABLE
        // =========================================

        .addSubcommand(subcommand =>
            subcommand

                .setName("disable")

                .setDescription(
                    "Disable automatic warning punishments"
                )
        )

        // =========================================
        // CONFIG
        // =========================================

        .addSubcommand(subcommand =>
            subcommand

                .setName("config")

                .setDescription(
                    "Set warning punishment thresholds"
                )

                .addIntegerOption(option =>
                    option
                        .setName("timeout10m")
                        .setDescription(
                            "Warnings required for 10 minute timeout"
                        )
                        .setMinValue(1)
                        .setMaxValue(100)
                        .setRequired(true)
                )

                .addIntegerOption(option =>
                    option
                        .setName("timeout1h")
                        .setDescription(
                            "Warnings required for 1 hour timeout"
                        )
                        .setMinValue(1)
                        .setMaxValue(100)
                        .setRequired(true)
                )

                .addIntegerOption(option =>
                    option
                        .setName("timeout1d")
                        .setDescription(
                            "Warnings required for 1 day timeout"
                        )
                        .setMinValue(1)
                        .setMaxValue(100)
                        .setRequired(true)
                )

                .addIntegerOption(option =>
                    option
                        .setName("kick")
                        .setDescription(
                            "Warnings required for kick"
                        )
                        .setMinValue(1)
                        .setMaxValue(100)
                        .setRequired(true)
                )

                .addIntegerOption(option =>
                    option
                        .setName("ban")
                        .setDescription(
                            "Warnings required for ban"
                        )
                        .setMinValue(1)
                        .setMaxValue(100)
                        .setRequired(true)
                )
        )

        // =========================================
        // VIEW
        // =========================================

        .addSubcommand(subcommand =>
            subcommand

                .setName("view")

                .setDescription(
                    "View current warning punishment settings"
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
            // GET OR CREATE GUILD CONFIG
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
            // ENABLE
            // =========================================

            if (
                subcommand === "enable"
            ) {

                guildConfig.warningPunishments.enabled =
                    true;

                await guildConfig.save();


                return interaction.reply({

                    embeds: [

                        new EmbedBuilder()

                            .setColor(
                                "#57F287"
                            )

                            .setTitle(
                                "🛡️ Automatic Punishments Enabled"
                            )

                            .setDescription(

                                "Automatic punishment for warning thresholds is now enabled."

                            )

                            .addFields(

                                {

                                    name:
                                        "⚠️ Warning System",

                                    value:
                                        "New warnings will automatically trigger punishments when thresholds are reached."

                                },

                                {

                                    name:
                                        "📊 Current Thresholds",

                                    value:
                                        `🔇 10m Timeout: **${guildConfig.warningPunishments.thresholds.timeout10m} warnings**\n` +
                                        `🔇 1h Timeout: **${guildConfig.warningPunishments.thresholds.timeout1h} warnings**\n` +
                                        `🔇 1d Timeout: **${guildConfig.warningPunishments.thresholds.timeout1d} warnings**\n` +
                                        `👢 Kick: **${guildConfig.warningPunishments.thresholds.kick} warnings**\n` +
                                        `🔨 Ban: **${guildConfig.warningPunishments.thresholds.ban} warnings**`

                                }

                            )

                            .setFooter({

                                text:
                                    "Sapphier AIO • Warning System"

                            })

                            .setTimestamp()

                    ]

                });

            }


            // =========================================
            // DISABLE
            // =========================================

            if (
                subcommand === "disable"
            ) {

                guildConfig.warningPunishments.enabled =
                    false;

                await guildConfig.save();


                return interaction.reply({

                    embeds: [

                        new EmbedBuilder()

                            .setColor(
                                "#ED4245"
                            )

                            .setTitle(
                                "🛡️ Automatic Punishments Disabled"
                            )

                            .setDescription(

                                "Automatic punishment has been disabled."

                            )

                            .addFields({

                                name:
                                    "⚠️ Warning System",

                                value:
                                    "Warnings will still be recorded, but automatic timeout, kick, and ban actions will not be applied."

                            })

                            .setFooter({

                                text:
                                    "Sapphier AIO • Warning System"

                            })

                            .setTimestamp()

                    ]

                });

            }


            // =========================================
            // CONFIG
            // =========================================

            if (
                subcommand === "config"
            ) {

                const timeout10m =
                    interaction.options.getInteger(
                        "timeout10m"
                    );

                const timeout1h =
                    interaction.options.getInteger(
                        "timeout1h"
                    );

                const timeout1d =
                    interaction.options.getInteger(
                        "timeout1d"
                    );

                const kick =
                    interaction.options.getInteger(
                        "kick"
                    );

                const ban =
                    interaction.options.getInteger(
                        "ban"
                    );


                // =========================================
                // THRESHOLD ORDER CHECK
                // =========================================

                if (
                    timeout10m >= timeout1h ||
                    timeout1h >= timeout1d ||
                    timeout1d >= kick ||
                    kick >= ban
                ) {

                    return interaction.reply({

                        content:
                            "❌ Invalid threshold order.\n\nRequired order:\n`10m Timeout < 1h Timeout < 1d Timeout < Kick < Ban`",

                        ephemeral:
                            true

                    });

                }


                // =========================================
                // SAVE CONFIG
                // =========================================

                guildConfig.warningPunishments.thresholds = {

                    timeout10m,

                    timeout1h,

                    timeout1d,

                    kick,

                    ban

                };


                await guildConfig.save();


                return interaction.reply({

                    embeds: [

                        new EmbedBuilder()

                            .setColor(
                                "#3BA4FF"
                            )

                            .setTitle(
                                "⚙️ Warning Punishments Updated"
                            )

                            .setDescription(

                                "Automatic warning punishment thresholds have been successfully updated."

                            )

                            .addFields(

                                {

                                    name:
                                        "🔇 10 Minute Timeout",

                                    value:
                                        `${timeout10m} warnings`,

                                    inline:
                                        true

                                },

                                {

                                    name:
                                        "🔇 1 Hour Timeout",

                                    value:
                                        `${timeout1h} warnings`,

                                    inline:
                                        true

                                },

                                {

                                    name:
                                        "🔇 1 Day Timeout",

                                    value:
                                        `${timeout1d} warnings`,

                                    inline:
                                        true

                                },

                                {

                                    name:
                                        "👢 Kick",

                                    value:
                                        `${kick} warnings`,

                                    inline:
                                        true

                                },

                                {

                                    name:
                                        "🔨 Ban",

                                    value:
                                        `${ban} warnings`,

                                    inline:
                                        true

                                },

                                {

                                    name:
                                        "📊 Status",

                                    value:
                                        guildConfig.warningPunishments.enabled
                                            ? "🟢 Enabled"
                                            : "🔴 Disabled",

                                    inline:
                                        true

                                }

                            )

                            .setFooter({

                                text:
                                    "Sapphier AIO • Warning System"

                            })

                            .setTimestamp()

                    ]

                });

            }


            // =========================================
            // VIEW
            // =========================================

            if (
                subcommand === "view"
            ) {

                const settings =
                    guildConfig.warningPunishments;


                return interaction.reply({

                    embeds: [

                        new EmbedBuilder()

                            .setColor(
                                "#FEE75C"
                            )

                            .setTitle(
                                "⚙️ Warning Punishment Configuration"
                            )

                            .addFields(

                                {

                                    name:
                                        "📊 Status",

                                    value:
                                        settings.enabled
                                            ? "🟢 Enabled"
                                            : "🔴 Disabled",

                                    inline:
                                        true

                                },

                                {

                                    name:
                                        "🔇 10 Minute Timeout",

                                    value:
                                        `${settings.thresholds.timeout10m} warnings`,

                                    inline:
                                        true

                                },

                                {

                                    name:
                                        "🔇 1 Hour Timeout",

                                    value:
                                        `${settings.thresholds.timeout1h} warnings`,

                                    inline:
                                        true

                                },

                                {

                                    name:
                                        "🔇 1 Day Timeout",

                                    value:
                                        `${settings.thresholds.timeout1d} warnings`,

                                    inline:
                                        true

                                },

                                {

                                    name:
                                        "👢 Kick",

                                    value:
                                        `${settings.thresholds.kick} warnings`,

                                    inline:
                                        true

                                },

                                {

                                    name:
                                        "🔨 Ban",

                                    value:
                                        `${settings.thresholds.ban} warnings`,

                                    inline:
                                        true

                                }

                            )

                            .setFooter({

                                text:
                                    "Sapphier AIO • Warning System"

                            })

                            .setTimestamp()

                    ]

                });

            }

        } catch (error) {

            console.error(

                "❌ WarnConfig Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while configuring the warning system.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ An unexpected error occurred while configuring the warning system.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};