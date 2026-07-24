const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const {
    logModeration
} = require("../../utils/modLogger");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("slowmode")

        .setDescription(
            "Set or remove slowmode for the current channel"
        )

        .addIntegerOption(option =>
            option
                .setName("seconds")
                .setDescription(
                    "Slowmode duration in seconds (0 to disable, max 21600)"
                )
                .setMinValue(0)
                .setMaxValue(21600)
                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageChannels
        ),

    async execute(interaction) {

        try {

            // =========================================
            // CHECK CHANNEL
            // =========================================

            const channel =
                interaction.channel;


            if (
                !channel ||
                !channel.isTextBased()
            ) {

                return interaction.reply({

                    content:
                        "❌ This command can only be used in a text channel.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // GET SECONDS
            // =========================================

            const seconds =
                interaction.options.getInteger(
                    "seconds"
                );


            // =========================================
            // BOT PERMISSION CHECK
            // =========================================

            const botMember =
                interaction.guild.members.me;


            if (!botMember) {

                return interaction.reply({

                    content:
                        "❌ I could not find my bot member in this server.",

                    ephemeral:
                        true

                });

            }


            const permissions =
                channel.permissionsFor(
                    botMember
                );


            if (
                !permissions ||
                !permissions.has(
                    PermissionFlagsBits.ManageChannels
                )
            ) {

                return interaction.reply({

                    content:
                        "❌ I need the **Manage Channels** permission to change slowmode.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // SET SLOWMODE
            // =========================================

            await channel.setRateLimitPerUser(

                seconds,

                `Slowmode changed by ${interaction.user.tag}`

            );


            // =========================================
            // ACTION DETAILS
            // =========================================

            const action =
                seconds === 0
                    ? "slowmode_off"
                    : "slowmode";


            const details =
                seconds === 0

                    ? `Slowmode disabled in ${channel}.`

                    : `Slowmode set to ${seconds} second(s) in ${channel}.`;


            const punishment =
                seconds === 0

                    ? "🚫 Slowmode Disabled"

                    : `🐢 Slowmode: ${seconds} second(s)`;


            // =========================================
            // MODERATION LOG
            // =========================================

            await logModeration({

                guild:
                    interaction.guild,

                user:
                    interaction.user,

                moderator:
                    interaction.user,

                action:
                    action,

                reason:
                    "Channel slowmode configuration",

                channelId:
                    channel.id,

                details:
                    details,

                color:
                    "#5865F2",

                punishment:
                    punishment

            });


            // =========================================
            // SUCCESS EMBED
            // =========================================

            const embed =
                new EmbedBuilder()

                    .setColor(
                        "#5865F2"
                    )

                    .setTitle(

                        seconds === 0

                            ? "🐢 Slowmode Disabled"

                            : "🐢 Slowmode Updated"

                    )

                    .setDescription(

                        seconds === 0

                            ? `Slowmode has been **disabled** in ${channel}.`

                            : `Slowmode has been set to **${seconds} second(s)** in ${channel}.`

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
                                "⏱️ Duration",

                            value:
                                seconds === 0

                                    ? "Disabled"

                                    : `${seconds} second(s)`,

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

                        }

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

                "❌ Slowmode Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ I could not change the channel slowmode.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ An unexpected error occurred while changing slowmode.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};