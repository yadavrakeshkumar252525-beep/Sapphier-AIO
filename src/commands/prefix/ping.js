module.exports = {
    name: "ping",

    async execute(message) {

        const msg = await message.reply("🏓 Pinging...");

        await msg.edit(
            `🏓 Pong! ${msg.createdTimestamp - message.createdTimestamp}ms`
        );
    }
};