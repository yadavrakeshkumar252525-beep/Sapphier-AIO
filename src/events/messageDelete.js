const {
    Events
} = require("discord.js");

const {
    sendLog
} = require("../modules/logging/services/loggingService");

module.exports = {

    name: Events.MessageDelete,

    async execute(message) {

        try {

            // Ignore DMs
            if (!message.guild) {
                return;
            }

            // Ignore bot messages
            if (message.author?.bot) {
                return;
            }

            const username =
                message.author
                    ? message.author.tag
                    : "Unknown User";

            const content =
                message.content ||
                "No text content available.";

            await sendLog({

                guild:
                    message.guild,

                action:
                    "messageDelete",

                title:
                    "🗑️ Message Deleted",

                description:
                    `A message was deleted in ${message.channel}.`,

                color:
                    "#FF4D4D",

                fields: [

                    {

                        name:
                            "👤 Author",

                        value:
                            `${username}`,

                        inline:
                            true

                    },

                    {

                        name:
                            "📢 Channel",

                        value:
                            `${message.channel}`,

                        inline:
                            true

                    },

                    {

                        name:
                            "📝 Message",

                        value:
                            content.length > 1024
                                ? content.substring(
                                    0,
                                    1021
                                ) + "..."
                                : content

                    }

                ]

            });

        } catch (error) {

            console.error(
                "❌ Message Delete Log Error:",
                error
            );

        }

    }

};