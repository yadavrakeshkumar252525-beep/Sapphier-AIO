require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
    Events
} = require("discord.js");

// =======================
// Create Client
// =======================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction
    ]
});

// =======================
// Collections
// =======================

client.commands = new Collection();
client.prefixCommands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();

// =======================
// MongoDB
// =======================

(async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("🟢 MongoDB Connected");

    } catch (err) {

        console.error("🔴 MongoDB Connection Failed");
        console.error(err);

    }
})();

// =======================
// Load Slash Commands
// =======================

const slashPath = path.join(__dirname, "src", "commands", "slash");

if (fs.existsSync(slashPath)) {

    const files = fs.readdirSync(slashPath).filter(f => f.endsWith(".js"));

    for (const file of files) {

        const command = require(path.join(slashPath, file));

        if (command.data)
            client.commands.set(command.data.name, command);

    }

    console.log(`✅ Loaded ${client.commands.size} Slash Commands`);

}

// =======================
// Load Prefix Commands
// =======================

const prefixPath = path.join(__dirname, "src", "commands", "prefix");

if (fs.existsSync(prefixPath)) {

    const files = fs.readdirSync(prefixPath).filter(f => f.endsWith(".js"));

    for (const file of files) {

        const command = require(path.join(prefixPath, file));

        client.prefixCommands.set(command.name, command);

    }

    console.log(`✅ Loaded ${client.prefixCommands.size} Prefix Commands`);

}

// =======================
// Load Events
// =======================

const eventsPath = path.join(__dirname, "src", "events");

if (fs.existsSync(eventsPath)) {

    const files = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

    for (const file of files) {

        const event = require(path.join(eventsPath, file));

        if (event.once)
            client.once(event.name, (...args) => event.execute(...args));

        else
            client.on(event.name, (...args) => event.execute(...args));

    }

}

console.log("✅ Events Loaded");

// =======================
// Ready
// =======================

client.once(Events.ClientReady, () => {

    console.log(`
========================================
💎 Sapphier AIO
========================================

Logged in as : ${client.user.tag}

Servers      : ${client.guilds.cache.size}

Users        : ${client.users.cache.size}

Version      : v0.2.6

Status       : ONLINE

========================================
`);

});

// =======================
// Login
// =======================

client.login(process.env.TOKEN);