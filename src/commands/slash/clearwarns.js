const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const Warning =
    require("../../models/Warning");

const {
    logModeration
} = require("../../utils/modLogger");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("clearwarns")

        .setDescription(
            "Clear a member's warnings"
        )

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription(
                    "The member whose warnings you want to clear"
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("warning_id")
                .setDescription(
                    "Optional: ID of a specific warning to remove"
                )
                .setRequired(false)
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

            const warningId =
                interaction.options.getString(
                    "warning_id"
                );


            // =========================================
            // CLEAR SPECIFIC WARNING
            // =========================================

            if (
                warningId
            ) {

                const warning =
                    await Warning.findOne({

                        _id:
                            warningId,

                        guildId:
                            interaction.guild.id,

                        userId:
                            user.id

                    });


                if (!warning) {

                    return interaction.reply({

                        content:
                            "❌ No warning found with that ID for this user.",

                        ephemeral:
                            true

                    });

                }


                await Warning.deleteOne({

                    _id:
                        warning._id

                });


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
                        "warning_clear",

                    reason:
                        "Specific warning removed",

                    channelId:
                        interaction.channel.id,

                    details:
                        `Warning ID removed: ${warning._id}\nOriginal reason: ${warning.reason || "No reason provided"}`,

                    color:
                        "#57F287",

                    punishment:
                        "🗑️ One Warning Removed"

                });


                // =========================================
                // SUCCESS EMBED
                // =========================================

                const embed =
                    new EmbedBuilder()

                        .setColor(
                            "#57F287"
                        )

                        .setTitle(
                            "🗑️ Warning Removed"
                        )

                        .setDescription(

                            `One warning has been removed from ${user}.`

                        )

                        .addFields(

                            {

                                name:
                                    "👤 User",

                                value:
                                    `${user.tag}\n\`${user.id}\``,

                                inline:
                                    true

                            },

                            {

                                name:
                                    "🆔 Warning ID",

                                value:
                                    `\`${warning._id}\``,

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
                                    "📝 Original Reason",

                                value:
                                    warning.reason ||
                                    "No reason provided"

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

            }


            // =========================================
            // CLEAR ALL WARNINGS
            // =========================================

            const warnings =
                await Warning.find({

                    guildId:
                        interaction.guild.id,

                    userId:
                        user.id

                });


            if (
                warnings.length === 0
            ) {

                return interaction.reply({

                    content:
                        `ℹ️ ${user.tag} does not have any warnings to clear.`,

                    ephemeral:
                        true

                });

            }


            // =========================================
            // DELETE ALL WARNINGS
            // =========================================

            const deleteResult =
                await Warning.deleteMany({

                    guildId:
                        interaction.guild.id,

                    userId:
                        user.id

                });


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
                    "warning_clear",

                reason:
                    "All warnings cleared",

                channelId:
                    interaction.channel.id,

                details:
                    `Total warnings removed: ${deleteResult.deletedCount}`,

                color:
                    "#57F287",

                punishment:
                    `🗑️ ${deleteResult.deletedCount} Warning(s) Removed`

            });


            // =========================================
            // SUCCESS EMBED
            // =========================================

            const embed =
                new EmbedBuilder()

                    .setColor(
                        "#57F287"
                    )

                    .setTitle(
                        "🗑️ Warnings Cleared"
                    )

                    .setDescription(

                        `All warnings for ${user} have been successfully cleared.`

                    )

                    .addFields(

                        {

                            name:
                                "👤 User",

                            value:
                                `${user.tag}\n\`${user.id}\``,

                            inline:
                                true

                        },

                        {

                            name:
                                "🗑️ Warnings Removed",

                            value:
                                `${deleteResult.deletedCount}`,

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

                "❌ Clear Warnings Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ An unexpected error occurred while clearing warnings.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ I could not clear the warnings.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};