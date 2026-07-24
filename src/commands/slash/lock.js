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

        .setName("lock")

        .setDescription(
            "Lock the current channel"
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
                        "❌ I need **Manage Channels** permission to lock this channel.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // LOCK CHANNEL
            // =========================================

            await channel.permissionOverwrites.edit(

                interaction.guild.roles.everyone,

                {

                    SendMessages:
                        false

                },

                {

                    reason:
                        `Channel locked by ${interaction.user.tag}`

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
                    "channel_lock",

                reason:
                    "Channel manually locked",

                channelId:
                    channel.id,

                details:
                    `Channel ${channel} was locked.`,

                color:
                    "#ED4245",

                punishment:
                    "🔒 Channel Locked"

            });


            // =========================================
            // SUCCESS EMBED
            // =========================================

            const embed =
                new EmbedBuilder()

                    .setColor(
                        "#ED4245"
                    )

                    .setTitle(
                        "🔒 Channel Locked"
                    )

                    .setDescription(

                        `${channel} has been locked successfully.`

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

                "❌ Lock Command Error:",

                error

            );


            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        "❌ I could not lock this channel.",

                    ephemeral:
                        true

                }).catch(
                    () => {}
                );

            }


            return interaction.reply({

                content:
                    "❌ An unexpected error occurred while locking this channel.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

    }

};