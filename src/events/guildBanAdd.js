const {
    Events
} = require("discord.js");

const {
    sendLog
} = require("../modules/logging/services/loggingService");

module.exports = {

    name: Events.GuildBanAdd,

    async execute(ban) {

        try {

            const user =
                ban.user;

            await sendLog({

                guild:
                    ban.guild,

                action:
                    "memberBan",

                title:
                    "🔨 Member Banned",

                description:
                    `**${user.tag}** has been banned from the server.`,

                color:
                    "#ED4245",

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
                "❌ Ban Log Error:",
                error
            );

        }

    }

};