const {
    Events
} = require("discord.js");

const {
    sendLog
} = require("../modules/logging/services/loggingService");

module.exports = {

    name: Events.MessageUpdate,

    async execute(
        oldMessage,
        newMessage
    ) {

        try {

            // Ignore DMs
            if (!newMessage.guild) {
                return;
            }

            // Ignore bot messages
            if (
                newMessage.author?.bot
            ) {
                return;
            }

            // Ignore if content did not change
            if (
                oldMessage.content ===
                newMessage.content
            ) {
                return;
            }

            const oldContent =
                oldMessage.content ||
                "Unknown / unavailable";

            const newContent =
                newMessage.content ||
                "Unknown / unavailable";

            await sendLog({

                guild:
                    newMessage.guild,

                action:
                    "messageEdit",

                title:
                    "✏️ Message Edited",

                description:
                    `A message was edited in ${newMessage.channel}.`,

                color:
                    "#FEE75C",

                fields: [

                    {

                        name:
                            "👤 Author",

                        value:
                            `${newMessage.author?.tag || "Unknown User"}`,

                        inline:
                            true

                    },

                    {

                        name:
                            "📢 Channel",

                        value:
                            `${newMessage.channel}`,

                        inline:
                            true

                    },

                    {

                        name:
                            "📝 Before",

                        value:
                            oldContent.length > 1024
                                ? oldContent.substring(
                                    0,
                                    1021
                                ) + "..."
                                : oldContent

                    },

                    {

                        name:
                            "📝 After",

                        value:
                            newContent.length > 1024
                                ? newContent.substring(
                                    0,
                                    1021
                                ) + "..."
                                : newContent

                    }

                ]

            });

        } catch (error) {

            console.error(
                "❌ Message Edit Log Error:",
                error
            );

        }

    }

};