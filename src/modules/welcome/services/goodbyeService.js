const {
    EmbedBuilder
} = require("discord.js");

const Welcome =
    require("../../../models/Welcome");


function formatGoodbyeMessage(
    message,
    member
) {

    return message
        .replace(
            /{user}/g,
            member.user.tag
        )
        .replace(
            /{server}/g,
            member.guild.name
        )
        .replace(
            /{count}/g,
            member.guild.memberCount.toString()
        );

}


async function sendGoodbye(
    member
) {

    try {

        // =========================================
        // GET CONFIG
        // =========================================

        const config =
            await Welcome.findOne({

                guildId:
                    member.guild.id

            });


        if (
            !config ||
            !config.goodbyeEnabled ||
            !config.goodbyeChannelId
        ) {

            return false;

        }


        // =========================================
        // GET CHANNEL
        // =========================================

        const channel =
            member.guild.channels.cache.get(

                config.goodbyeChannelId

            );


        if (
            !channel ||
            !channel.isTextBased()
        ) {

            console.warn(

                `⚠️ Goodbye channel not found in ${member.guild.name}`

            );

            return false;

        }


        // =========================================
        // FORMAT MESSAGE
        // =========================================

        const formattedMessage =
            formatGoodbyeMessage(

                config.goodbyeMessage,

                member

            );


        // =========================================
        // SEND EMBED
        // =========================================

        if (
            config.goodbyeEmbedEnabled
        ) {

            const embed =
                new EmbedBuilder()

                    .setColor(

                        config.goodbyeColor ||
                        "#FF4D4D"

                    )

                    .setTitle(

                        "👋 Member Left"

                    )

                    .setDescription(

                        formattedMessage

                    )

                    .setThumbnail(

                        member.user.displayAvatarURL({

                            dynamic:
                                true,

                            size:
                                256

                        })

                    )

                    .setFooter({

                        text:

                            `Sapphier AIO • ${member.guild.memberCount} members remaining`

                    })

                    .setTimestamp();


            await channel.send({

                embeds:
                    [embed]

            });

        } else {

            // =========================================
            // NORMAL MESSAGE
            // =========================================

            await channel.send({

                content:
                    formattedMessage

            });

        }


        console.log(

            `👋 Goodbye message sent for ${member.user.tag} in ${member.guild.name}`

        );


        return true;


    } catch (error) {

        console.error(

            "❌ Goodbye Service Error:",

            error

        );

        return false;

    }

}


module.exports = {

    sendGoodbye,

    formatGoodbyeMessage

};