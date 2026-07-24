const {
    Events
} = require("discord.js");

const {
    sendLog
} = require("../modules/logging/services/loggingService");

module.exports = {

    name: Events.GuildBanRemove,

    async execute(ban) {

        try {

            const user =
                ban.user;

            await sendLog({

                guild:
                    ban.guild,

                action:
                    "memberUnban",

                title:
                    "🔓 Member Unbanned",

                description:
                    `**${user.tag}** has been unbanned from the server.`,

                color:
                    "#57F287",

                fields: [

                    {

                        name:
                            "👤 User",

                        value:
                            `${user.tag}`,

                        inline:
                            true

                    },

                    {

                        name:
                            "🆔 User ID",

                        value:
                            user.id,

                        inline:
                            true

                    }

                ]

            });

        } catch (error) {

            console.error(
                "❌ Unban Log Error:",
                error
            );

        }

    }

};