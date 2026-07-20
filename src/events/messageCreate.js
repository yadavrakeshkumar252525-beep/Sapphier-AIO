const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {

        if (message.author.bot) return;

        const prefix = process.env.PREFIX || ",";

        if (!message.content.startsWith(prefix)) return;

        const args = message.content
            .slice(prefix.length)
            .trim()
            .split(/ +/);

        const commandName = args.shift().toLowerCase();

        const command =
            message.client.prefixCommands.get(commandName) ||
            message.client.prefixCommands.find(cmd =>
                cmd.aliases && cmd.aliases.includes(commandName)
            );

        if (!command) return;

        try {
            console.log("Running command:", command.name);
await command.execute(message, args);
        } catch (error) {
            console.error(error);

            message.reply({
                content: "❌ Something went wrong while executing this command."
            }).catch(() => {});
        }
    }
};