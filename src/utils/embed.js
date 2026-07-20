const { EmbedBuilder } = require("discord.js");
const colors = require("../config/colors");

module.exports = (title, description) => {

    return new EmbedBuilder()

        .setColor(colors.PRIMARY)

        .setTitle(title)

        .setDescription(description)

        .setTimestamp();

};