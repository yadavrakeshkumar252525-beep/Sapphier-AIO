require("dotenv").config();

const path = require("path");

const SapphierClient = require("./classes/SapphierClient");

const CommandLoader = require("./loaders/CommandLoader");
const EventLoader = require("./loaders/EventLoader");
const InteractionLoader = require("./loaders/InteractionLoader");

const connectDatabase = require("../database/connect");

class Bot {

    constructor() {

        // =========================
        // Create Discord Client
        // =========================

        this.client = new SapphierClient();

        // =========================
        // Create Loaders
        // =========================

        this.commandLoader = new CommandLoader(this.client);

        this.eventLoader = new EventLoader(this.client);

        this.interactionLoader = new InteractionLoader(this.client);

        // =========================
        // Bot State
        // =========================

        this.started = false;

    }

    /**
     * Start the Sapphier AIO application
     */

    async start() {

        if (this.started) {

            console.log("⚠️ Sapphier AIO is already running.");

            return;

        }

        console.log(`
========================================
💎 Sapphier AIO
========================================
🚀 Starting application...
========================================
`);

        try {

            // =========================
            // Validate Environment
            // =========================

            this.validateEnvironment();

            // =========================
            // Connect MongoDB
            // =========================

            console.log("🔄 Connecting to MongoDB...");

            await connectDatabase();

            // =========================
            // Load Commands
            // =========================

            console.log("🔄 Loading commands...");

            await this.commandLoader.load();

            // =========================
            // Load Events
            // =========================

            console.log("🔄 Loading events...");

            await this.eventLoader.load();

            // =========================
            // Load Interactions
            // =========================

            console.log("🔄 Loading interactions...");

            await this.interactionLoader.load();

            // =========================
            // Login Discord
            // =========================

            console.log("🔄 Connecting to Discord...");

            await this.client.login(process.env.TOKEN);

            // =========================
            // Bot Started
            // =========================

            this.client.startedAt = Date.now();

            this.started = true;

            console.log(`
========================================
💎 Sapphier AIO
========================================
✅ Application Started Successfully
🤖 Discord: Connected
🗄️ MongoDB: Connected
📦 Version: ${this.client.version}
========================================
`);

        } catch (error) {

            console.error(`
========================================
🔴 Sapphier AIO Startup Failed
========================================
`);

            console.error(error);

            process.exit(1);

        }

    }

    /**
     * Validate required environment variables
     */

    validateEnvironment() {

        const requiredVariables = [
            "TOKEN",
            "MONGO_URI"
        ];

        const missingVariables = requiredVariables.filter(
            variable => !process.env[variable]
        );

        if (missingVariables.length > 0) {

            throw new Error(
                `Missing environment variables: ${missingVariables.join(", ")}`
            );

        }

    }

}

module.exports = Bot;