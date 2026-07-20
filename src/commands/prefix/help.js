const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "help",
    aliases: ["commands"],

    async execute(message) {

        const embed = new EmbedBuilder()
            .setColor("#3BA4FF")
            .setTitle("💎 Sapphier AIO Help")
            .setDescription("Welcome to **Sapphier AIO**!")
            .addFields(
                {
                    name: "⚡ Utility",
                    value: "`,ping`\n`,help`",
                    inline: true
                },
                {
                    name: "🎫 Tickets",
                    value: "Coming Soon",
                    inline: true
                },
                {
                    name: "🛒 Shop",
                    value: "Coming Soon",
                    inline: true
                }
            )
            .setTimestamp();

        return message.channel.send({
            embeds: [embed]
        });

    }
};