const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials
} = require("discord.js");

class SapphierClient extends Client {

    constructor() {

        super({
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

        // =========================
        // Command Collections
        // =========================

        // Slash commands
        this.commands = new Collection();

        // Prefix commands
        this.prefixCommands = new Collection();

        // =========================
        // Interaction Collections
        // =========================

        // Buttons
        this.buttons = new Collection();

        // Modals
        this.modals = new Collection();

        // Select Menus
        this.selectMenus = new Collection();

        // =========================
        // Module Collections
        // =========================

        this.modules = new Collection();

        // =========================
        // Bot Metadata
        // =========================

        this.startedAt = null;

        this.version = "0.3.0-alpha";

    }

    /**
     * Get bot uptime in milliseconds
     */
    getUptime() {

        if (!this.startedAt) {
            return 0;
        }

        return Date.now() - this.startedAt;

    }

    /**
     * Get basic bot statistics
     */
    getStats() {

        return {
            guilds: this.guilds.cache.size,
            users: this.users.cache.size,
            channels: this.channels.cache.size,
            commands: this.commands.size,
            prefixCommands: this.prefixCommands.size,
            buttons: this.buttons.size,
            modals: this.modals.size,
            selectMenus: this.selectMenus.size,
            modules: this.modules.size
        };

    }

}

module.exports = SapphierClient;