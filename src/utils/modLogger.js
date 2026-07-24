const {
    EmbedBuilder
} = require("discord.js");

const Log =
    require("../models/Log");

async function logModeration({

    guild,

    user,

    moderator,

    action,

    reason,

    channelId,

    details,

    color = "#3BA4FF",

    punishment = null

}) {

    try {

        // =========================================
        // SAVE TO MONGODB
        // =========================================

        await Log.create({

            guildId:
                guild.id,

            userId:
                user.id,

            username:
                user.tag ||
                user.username ||
                "Unknown User",

            moderatorId:
                moderator
                    ? moderator.id
                    : null,

            moderatorUsername:
                moderator
                    ? (
                        moderator.tag ||
                        moderator.username ||
                        "Unknown Moderator"
                    )
                    : "Unknown Moderator",

            action:
                action ||
                "unknown",

            channelId:
                channelId ||
                null,

            reason:
                reason ||
                "No reason provided",

            details:
                details ||
                null

        });


        // =========================================
        // GET MOD LOG CHANNEL
        // =========================================

        const modLogChannel =
            guild.channels.cache.find(

                channel =>

                    channel.name ===
                    "mod-logs"

            );


        // =========================================
        // NO LOG CHANNEL
        // =========================================

        if (
            !modLogChannel ||
            !modLogChannel.isTextBased()
        ) {

            console.log(

                "⚠️ #mod-logs channel not found. MongoDB log saved successfully."

            );

            return;

        }


        // =========================================
        // CREATE LOG EMBED
        // =========================================

        const embed =
            new EmbedBuilder()

                .setColor(
                    color
                )

                .setTitle(
                    `🛡️ Moderation Action • ${String(
                        action || "UNKNOWN"
                    ).toUpperCase()}`
                )

                .setThumbnail(

                    user.displayAvatarURL({

                        dynamic:
                            true,

                        size:
                            256

                    })

                )

                .addFields(

                    {

                        name:
                            "👤 Target User",

                        value:
                            `${user.tag || user.username}\n\`${user.id}\``,

                        inline:
                            true

                    },

                    {

                        name:
                            "👮 Moderator",

                        value:
                            moderator
                                ? `${moderator.tag || moderator.username}\n\`${moderator.id}\``
                                : "Unknown",

                        inline:
                            true

                    },

                    {

                        name:
                            "⚖️ Action",

                        value:
                            String(
                                action ||
                                "Unknown"
                            ).toUpperCase(),

                        inline:
                            true

                    },

                    {

                        name:
                            "📝 Reason",

                        value:
                            reason ||
                            "No reason provided"

                    }

                );


        // =========================================
        // PUNISHMENT FIELD
        // =========================================

        if (
            punishment
        ) {

            embed.addFields({

                name:
                    "🔨 Punishment",

                value:
                    punishment,

                inline:
                    true

            });

        }


        // =========================================
        // DETAILS FIELD
        // =========================================

        if (
            details
        ) {

            embed.addFields({

                name:
                    "📌 Details",

                value:
                    details.length > 1024

                        ? details.substring(
                            0,
                            1021
                        ) + "..."

                        : details

            });

        }


        // =========================================
        // CHANNEL FIELD
        // =========================================

        if (
            channelId
        ) {

            embed.addFields({

                name:
                    "📢 Action Channel",

                value:
                    `<#${channelId}>`,

                inline:
                    true

            });

        }


        // =========================================
        // FOOTER
        // =========================================

        embed

            .setFooter({

                text:
                    "Sapphier AIO • Moderation Logs"

            })

            .setTimestamp();


        // =========================================
        // SEND DISCORD LOG
        // =========================================

        await modLogChannel
            .send({

                embeds:
                    [embed]

            })
            .catch(error => {

                console.error(

                    "⚠️ Failed to send moderation log:",

                    error

                );

            });


    } catch (error) {

        console.error(

            "❌ Moderation Logger Error:",

            error

        );

    }

}


module.exports = {

    logModeration

};