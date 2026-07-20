const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Show all bot commands"),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#3BA4FF")
            .setTitle("💎 Sapphier AIO Help")
            .setDescription("Welcome to **Sapphier AIO**!")
            .addFields(
                {
                    name: "⚡ Utility",
                    value: "`/ping`\n`/help`",
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
            .setFooter({
                text: "Sapphier AIO"
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};