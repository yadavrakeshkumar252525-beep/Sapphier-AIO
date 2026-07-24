const { Events } = require("discord.js");

const {
    sendLog
} = require("../modules/logging/services/loggingService");

const {
    sendWelcome
} = require("../modules/welcome/services/welcomeService");

module.exports = {

    name: Events.GuildMemberAdd,

    async execute(member) {

        try {

            // =========================================
            // WELCOME MESSAGE
            // =========================================

            await sendWelcome(member);


            // =========================================
            // JOIN LOG
            // =========================================

            await sendLog({

                guild:
                    member.guild,

                action:
                    "memberJoin",

                title:
                    "👤 Member Joined",

                description:
                    `${member} has joined the server.`,

                color:
                    "#57F287",

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

                    },

                    {

                        name:
                            "📅 Account Created",

                        value:
                            `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,

                        inline:
                            true

                    }

                ]

            });


        } catch (error) {

            console.error(
                "❌ Guild Member Add Error:",
                error
            );

        }

    }

};