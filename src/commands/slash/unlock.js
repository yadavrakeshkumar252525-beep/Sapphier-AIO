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

        .setName("unlock")

        .setDescription(
            "Unlock the current channel"
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageChannels
        ),

    async execute(interaction) {

        try {

            const channel =
                interaction.channel;

            const botMember =
                interaction.guild.members.me;


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


            if (!botMember) {

                return interaction.reply({

                    content:
                        "❌ I could not find my bot member.",

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
                        "❌ I need **Manage Channels** permission to unlock this channel.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // UNLOCK CHANNEL
            // =========================================

            await channel.permissionOverwrites.edit(

                interaction.guild.roles.everyone,

                {

                    SendMessages:
                        null

                },

                {

                    reason:
                        `Channel unlocked by ${interaction.user.tag}`

                }

            );


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
                    "channel_unlock",

                reason:
                    "Channel manually unlocked",

                channelId:
                    channel.id,

                details:
                    `Channel ${channel} was unlocked.`,

                color:
                    "#57F287",

                punishment:
                    "🔓 Channel Unlocked"

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
                        "🔓 Channel Unlocked"
                    )

                    .setDescription(

                        `${channel} has been unlocked successfully.`

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
                                "👮 Moderator",

                            value:
                                interaction.user.tag,

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

                "❌ Unlock Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ I could not unlock this channel.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ An unexpected error occurred while unlocking this channel.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};