const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const Guild =
    require("../../models/Guild");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("mod-config")

        .setDescription(
            "Configure automatic moderation settings"
        )

        // =========================================
        // STATUS
        // =========================================

        .addSubcommand(subcommand =>
            subcommand

                .setName("status")

                .setDescription(
                    "View automatic warning punishment settings"
                )
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

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),


    async execute(interaction) {

        try {

            // =========================================
            // GET SUBCOMMAND
            // =========================================

            const subcommand =
                interaction.options.getSubcommand();


            // =========================================
            // GET / CREATE CONFIG
            // =========================================

            let config =
                await Guild.findOne({

                    guildId:
                        interaction.guild.id

                });


            if (!config) {

                config =
                    await Guild.create({

                        guildId:
                            interaction.guild.id

                    });

            }


            // =========================================
            // STATUS
            // =========================================

            if (
                subcommand ===
                "status"
            ) {

                const settings =
                    config.warningPunishments;


                const statusEmbed =
                    new EmbedBuilder()

                        .setColor(
                            settings.enabled
                                ? "#57F287"
                                : "#ED4245"
                        )

                        .setTitle(
                            "🛡️ Automatic Moderation Configuration"
                        )

                        .setDescription(

                            settings.enabled

                                ? "🟢 Automatic warning punishments are **enabled**."

                                : "🔴 Automatic warning punishments are **disabled**."

                        )

                        .addFields(

                            {

                                name:
                                    "⚠️ 3 Warnings",

                                value:
                                    "🔇 10 Minutes Timeout",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "⚠️ 4 Warnings",

                                value:
                                    "🔇 1 Hour Timeout",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "⚠️ 5 Warnings",

                                value:
                                    "🔇 1 Day Timeout",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "⚠️ 6 Warnings",

                                value:
                                    "👢 Kick",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "⚠️ 7 Warnings",

                                value:
                                    "🔨 Ban",

                                inline:
                                    true

                            }

                        )

                        .setFooter({

                            text:
                                "Sapphier AIO • Automatic Moderation"

                        })

                        .setTimestamp();


                return interaction.reply({

                    embeds:
                        [statusEmbed],

                    ephemeral:
                        true

                });

            }


            // =========================================
            // ENABLE
            // =========================================

            if (
                subcommand ===
                "enable"
            ) {

                config.warningPunishments.enabled =
                    true;


                await config.save();


                const enableEmbed =
                    new EmbedBuilder()

                        .setColor(
                            "#57F287"
                        )

                        .setTitle(
                            "🟢 Automatic Punishments Enabled"
                        )

                        .setDescription(

                            "Automatic warning punishments are now enabled."

                        )

                        .addFields(

                            {

                                name:
                                    "3 Warnings",

                                value:
                                    "🔇 10 Minutes Timeout"

                            },

                            {

                                name:
                                    "4 Warnings",

                                value:
                                    "🔇 1 Hour Timeout"

                            },

                            {

                                name:
                                    "5 Warnings",

                                value:
                                    "🔇 1 Day Timeout"

                            },

                            {

                                name:
                                    "6 Warnings",

                                value:
                                    "👢 Kick"

                            },

                            {

                                name:
                                    "7 Warnings",

                                value:
                                    "🔨 Ban"

                            }

                        )

                        .setFooter({

                            text:
                                "Sapphier AIO • Moderation"

                        })

                        .setTimestamp();


                return interaction.reply({

                    embeds:
                        [enableEmbed],

                    ephemeral:
                        true

                });

            }


            // =========================================
            // DISABLE
            // =========================================

            if (
                subcommand ===
                "disable"
            ) {

                config.warningPunishments.enabled =
                    false;


                await config.save();


                const disableEmbed =
                    new EmbedBuilder()

                        .setColor(
                            "#ED4245"
                        )

                        .setTitle(
                            "🔴 Automatic Punishments Disabled"
                        )

                        .setDescription(

                            "Automatic warning punishments have been disabled.\n\nMembers can still receive warnings, but no automatic timeout, kick, or ban will be applied."

                        )

                        .setFooter({

                            text:
                                "Sapphier AIO • Moderation"

                        })

                        .setTimestamp();


                return interaction.reply({

                    embeds:
                        [disableEmbed],

                    ephemeral:
                        true

                });

            }

        } catch (error) {

            console.error(

                "❌ Mod Config Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while updating moderation configuration.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ An unexpected error occurred while updating moderation configuration.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};