const { Events } = require("discord.js");

const {
    sendGoodbye
} = require(
    "../modules/welcome/services/goodbyeService"
);

const {
    sendLog
} = require(
    "../modules/logging/services/loggingService"
);

module.exports = {

    name:
        Events.GuildMemberRemove,

    async execute(member) {

        try {

            // =========================================
            // GOODBYE MESSAGE
            // =========================================

            await sendGoodbye(
                member
            );


            // =========================================
            // LEAVE LOG
            // =========================================

            await sendLog({

                guild:
                    member.guild,

                action:
                    "memberLeave",

                title:
                    "🚪 Member Left",

                description:
                    `${member.user.tag} has left the server.`,

                color:
                    "#FF4D4D",

                fields: [

                    {

                        name:
                            "👤 User",

                        value:
                            `${member.user.tag}`,

                        inline:
                            true

                    },

                    {

                        name:
                            "🆔 User ID",

                        value:
                            member.user.id,

                        inline:
                            true

                    },

                    {

                        name:
                            "📊 Member Count",

                        value:
                            `${member.guild.memberCount}`,

                        inline:
                            true

                    }

                ]

            });

        } catch (error) {

            console.error(
                "❌ Guild Member Remove Error:",
                error
            );

        }

    }

};