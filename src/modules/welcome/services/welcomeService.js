const Welcome = require("../../../models/Welcome");

function formatWelcomeMessage(message, member) {

    return message
        .replace(/{user}/g, `<@${member.id}>`)
        .replace(/{server}/g, member.guild.name)
        .replace(
            /{count}/g,
            member.guild.memberCount.toString()
        );
}


async function sendWelcome(member) {

    try {

        // =========================================
        // GET WELCOME CONFIG
        // =========================================

        const config =
            await Welcome.findOne({
                guildId:
                    member.guild.id
            });


        // =========================================
        // CHECK CONFIG
        // =========================================

        if (
            !config ||
            !config.enabled ||
            !config.channelId
        ) {

            return false;

        }


        // =========================================
        // GET CHANNEL
        // =========================================

        const channel =
            member.guild.channels.cache.get(
                config.channelId
            );


        if (
            !channel ||
            !channel.isTextBased()
        ) {

            console.warn(
                `⚠️ Welcome channel not found in ${member.guild.name}`
            );

            return false;

        }


        // =========================================
        // FORMAT MESSAGE
        // =========================================

        const formattedMessage =
            formatWelcomeMessage(
                config.message,
                member
            );


        // =========================================
        // SEND EMBED
        // =========================================

        if (
            config.embedEnabled
        ) {

            const {
                EmbedBuilder
            } = require("discord.js");


            const embed =
                new EmbedBuilder()

                    .setColor(
                        config.color ||
                        "#3BA4FF"
                    )

                    .setTitle(
                        `👋 Welcome to ${member.guild.name}!`
                    )

                    .setDescription(
                        formattedMessage
                    )

                    .setThumbnail(
                        member.user.displayAvatarURL({
                            dynamic: true,
                            size: 256
                        })
                    )

                    .setFooter({
                        text:
                            `Member #${member.guild.memberCount} • Sapphier AIO`
                    })

                    .setTimestamp();


            await channel.send({

                content:
                    config.mentionUser
                        ? `<@${member.id}>`
                        : undefined,

                embeds:
                    [embed]

            });

        } else {

            // =========================================
            // NORMAL MESSAGE
            // =========================================

            await channel.send({

                content:
                    config.mentionUser
                        ? `<@${member.id}> ${formattedMessage}`
                        : formattedMessage

            });

        }


        console.log(
            `👋 Welcome message sent for ${member.user.tag} in ${member.guild.name}`
        );


        return true;


    } catch (error) {

        console.error(
            "❌ Welcome Service Error:",
            error
        );

        return false;

    }

}


module.exports = {
    sendWelcome,
    formatWelcomeMessage
};