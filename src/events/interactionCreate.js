const { Events } = require("discord.js");
const Verification = require("../models/Verification");

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {

        if (!interaction.isButton()) return;

        if (interaction.customId !== "verify_button") return;

        const data = await Verification.findOne({
            guildId: interaction.guild.id
        });

        if (!data)
            return interaction.reply({
                content: "Verification is not configured.",
                ephemeral: true
            });

        if (data.roleId) {

            const role = interaction.guild.roles.cache.get(data.roleId);

            if (role)
                await interaction.member.roles.add(role);

        }

        await interaction.reply({
            content: "✅ You have been verified!",
            ephemeral: true
        });

    }
};