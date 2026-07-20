const { Events } = require("discord.js");
const Logger = require("../utils/logger");

module.exports = {
    name: Events.ClientReady,
    once: true,

    async execute(client) {

        Logger.success(`${client.user.tag} is Online`);

        client.user.setPresence({
            activities: [
                {
                    name: "/help | Sapphier AIO",
                    type: 3
                }
            ],
            status: "online"
        });

    }
};