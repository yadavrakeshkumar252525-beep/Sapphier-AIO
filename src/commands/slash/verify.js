const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Verification = require("../../models/Verification");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Setup verification panel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#3BA4FF")
            .setTitle("🔒 Server Verification")
            .setDescription(
                "Click the button below to verify yourself and gain access to the server."
            )
            .setFooter({
                text: "Sapphier AIO Verification"
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("verify_button")
                .setLabel("Verify")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Success)
        );

        const msg = await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        await Verification.findOneAndUpdate(
            {
                guildId: interaction.guild.id
            },
            {
                guildId: interaction.guild.id,
                channelId: interaction.channel.id,
                messageId: msg.id,
                enabled: true
            },
            {
                upsert: true
            }
        );

        await interaction.reply({
            content: "✅ Verification panel created.",
            ephemeral: true
        });

    }
};