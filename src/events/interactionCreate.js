const {
    Events,
    MessageFlags
} = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {

        // Get Discord client directly
        const client = interaction.client;

        try {

            // =====================================================
            // SLASH COMMANDS
            // =====================================================

            if (interaction.isChatInputCommand()) {

                const command = client.commands.get(
                    interaction.commandName
                );

                if (!command) {
                    console.log(
                        `⚠️ Command not found: /${interaction.commandName}`
                    );
                    return;
                }

                try {

                    // Execute command
                    // Command itself handles interaction.reply()
                    await command.execute(
                        interaction,
                        client
                    );

                } catch (error) {

                    console.error(
                        `❌ Command Error [/${interaction.commandName}]:`,
                        error
                    );

                    // If command already replied/deferred,
                    // edit the existing response
                    if (
                        interaction.deferred ||
                        interaction.replied
                    ) {

                        try {

                            await interaction.editReply({
                                content:
                                    "❌ An error occurred while executing this command."
                            });

                        } catch (editError) {

                            console.error(
                                "❌ Failed to edit interaction reply:",
                                editError
                            );

                        }

                    } else {

                        // If command hasn't replied yet,
                        // send an ephemeral error
                        try {

                            await interaction.reply({
                                content:
                                    "❌ An error occurred while executing this command.",
                                flags:
                                    MessageFlags.Ephemeral
                            });

                        } catch (replyError) {

                            console.error(
                                "❌ Failed to send interaction error:",
                                replyError
                            );

                        }
                    }
                }

                return;
            }


            // =====================================================
            // BUTTON INTERACTIONS
            // =====================================================

            if (interaction.isButton()) {

                // =================================================
                // VERIFY BUTTON
                // =================================================

                if (
                    interaction.customId === "verify_button"
                ) {

                    try {

                        const member =
                            interaction.member;

                        if (!member) {

                            return interaction.reply({
                                content:
                                    "❌ Unable to find your member information.",
                                flags:
                                    MessageFlags.Ephemeral
                            });

                        }

                        // Load Verification Model
                        const Verification =
                            require("../models/Verification");

                        // Get verification settings
                        const verification =
                            await Verification.findOne({
                                guildId:
                                    interaction.guildId
                            });

                        if (
                            !verification ||
                            !verification.enabled
                        ) {

                            return interaction.reply({
                                content:
                                    "❌ Verification system is currently disabled.",
                                flags:
                                    MessageFlags.Ephemeral
                            });

                        }

                        // Get verification role
                        const role =
                            interaction.guild.roles.cache.get(
                                verification.roleId
                            );

                        if (!role) {

                            return interaction.reply({
                                content:
                                    "❌ Verification role was not found.",
                                flags:
                                    MessageFlags.Ephemeral
                            });

                        }

                        // Check if already verified
                        if (
                            member.roles.cache.has(
                                role.id
                            )
                        ) {

                            return interaction.reply({
                                content:
                                    "✅ You are already verified!",
                                flags:
                                    MessageFlags.Ephemeral
                            });

                        }

                        // Add role
                        await member.roles.add(role);

                        // Success
                        return interaction.reply({
                            content:
                                "✅ You have been successfully verified! Welcome to the server. 🎉",
                            flags:
                                MessageFlags.Ephemeral
                        });

                    } catch (error) {

                        console.error(
                            "❌ Verification Button Error:",
                            error
                        );

                        try {

                            if (
                                interaction.deferred ||
                                interaction.replied
                            ) {

                                await interaction.editReply({
                                    content:
                                        "❌ Verification failed. Please contact the staff team."
                                });

                            } else {

                                await interaction.reply({
                                    content:
                                        "❌ Verification failed. Please contact the staff team.",
                                    flags:
                                        MessageFlags.Ephemeral
                                });

                            }

                        } catch (replyError) {

                            console.error(
                                "❌ Verification reply failed:",
                                replyError
                            );

                        }
                    }

                    return;
                }
            }


            // =====================================================
            // SELECT MENUS
            // =====================================================

            if (
                interaction.isStringSelectMenu()
            ) {

                // Your select menu handlers
                // can be added here.

                return;
            }


        } catch (error) {

            console.error(
                "❌ Interaction Router Error:",
                error
            );

            try {

                if (
                    interaction.deferred ||
                    interaction.replied
                ) {

                    await interaction.editReply({
                        content:
                            "❌ Something went wrong while processing this interaction."
                    });

                } else {

                    await interaction.reply({
                        content:
                            "❌ Something went wrong while processing this interaction.",
                        flags:
                            MessageFlags.Ephemeral
                    });

                }

            } catch (finalError) {

                console.error(
                    "❌ Final Interaction Error:",
                    finalError
                );

            }
        }
    }
};