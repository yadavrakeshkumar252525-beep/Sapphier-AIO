const {
    EmbedBuilder
} = require("discord.js");

const LoggingConfig =
    require("../../../models/LoggingConfig");

async function sendLog({
    guild,
    action,
    title,
    description,
    color = "#3BA4FF",
    fields = []
}) {

    try {

        if (!guild) {
            return false;
        }

        const config =
            await LoggingConfig.findOne({
                guildId: guild.id
            });

        if (
            !config ||
            !config.enabled ||
            !config.channelId
        ) {
            return false;
        }

        const channel =
            guild.channels.cache.get(
                config.channelId
            );

        if (
            !channel ||
            !channel.isTextBased()
        ) {
            return false;
        }

        // =========================================
        // CHECK EVENT TYPE
        // =========================================

        const eventSettings = {

            memberJoin:
                config.memberJoin,

            memberLeave:
                config.memberLeave,

            messageDelete:
                config.messageDelete,

            messageEdit:
                config.messageEdit,

            memberBan:
                config.memberBan,

            memberUnban:
                config.memberUnban,

            verification:
                config.verification,

            moderation:
                config.moderation

        };

        if (
            eventSettings[action] === false
        ) {
            return false;
        }

        // =========================================
        // CREATE EMBED
        // =========================================

        const embed =
            new EmbedBuilder()

                .setColor(color)

                .setTitle(title)

                .setDescription(
                    description || "No details provided."
                )

                .addFields(
                    fields
                )

                .setFooter({
                    text:
                        `Sapphier AIO • ${action}`
                })

                .setTimestamp();

        // =========================================
        // SEND LOG
        // =========================================

        await channel.send({
            embeds: [
                embed
            ]
        });

        return true;

    } catch (error) {

        console.error(
            "❌ Logging Service Error:",
            error
        );

        return false;

    }

}

module.exports = {
    sendLog
};