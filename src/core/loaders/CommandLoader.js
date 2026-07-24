const fs = require("fs");
const path = require("path");

class CommandLoader {

    constructor(client) {
        this.client = client;
    }

    /**
     * Load all Slash and Prefix commands
     */
    async load() {

        // =========================
        // Load Slash Commands
        // =========================

        const slashPath = path.join(
            process.cwd(),
            "src",
            "commands",
            "slash"
        );

        if (fs.existsSync(slashPath)) {

            const files = fs
                .readdirSync(slashPath)
                .filter(file => file.endsWith(".js"));

            for (const file of files) {

                try {

                    const filePath = path.join(slashPath, file);

                    // Clear cache so commands can be reloaded later
                    delete require.cache[require.resolve(filePath)];

                    const command = require(filePath);

                    if (!command.data) {

                        console.warn(
                            `⚠️ Skipping slash command: ${file} (missing data)`
                        );

                        continue;

                    }

                    const commandName = command.data.name;

                    this.client.commands.set(
                        commandName,
                        command
                    );

                    console.log(
                        `  ↳ /${commandName}`
                    );

                } catch (error) {

                    console.error(
                        `❌ Failed to load slash command: ${file}`
                    );

                    console.error(error);

                }

            }

        }

        // =========================
        // Load Prefix Commands
        // =========================

        const prefixPath = path.join(
            process.cwd(),
            "src",
            "commands",
            "prefix"
        );

        if (fs.existsSync(prefixPath)) {

            const files = fs
                .readdirSync(prefixPath)
                .filter(file => file.endsWith(".js"));

            for (const file of files) {

                try {

                    const filePath = path.join(prefixPath, file);

                    // Clear cache
                    delete require.cache[require.resolve(filePath)];

                    const command = require(filePath);

                    if (!command.name) {

                        console.warn(
                            `⚠️ Skipping prefix command: ${file} (missing name)`
                        );

                        continue;

                    }

                    const commandName = command.name.toLowerCase();

                    this.client.prefixCommands.set(
                        commandName,
                        command
                    );

                    // Load aliases
                    if (Array.isArray(command.aliases)) {

                        for (const alias of command.aliases) {

                            this.client.prefixCommands.set(
                                alias.toLowerCase(),
                                command
                            );

                        }

                    }

                    console.log(
                        `  ↳ ${process.env.PREFIX || ","}${commandName}`
                    );

                } catch (error) {

                    console.error(
                        `❌ Failed to load prefix command: ${file}`
                    );

                    console.error(error);

                }

            }

        }

        // =========================
        // Loading Summary
        // =========================

        console.log(`
========================================
📦 Command Loader
========================================
⚡ Slash Commands : ${this.client.commands.size}
⌨️ Prefix Commands: ${this.client.prefixCommands.size}
========================================
`);

        return {
            slash: this.client.commands.size,
            prefix: this.client.prefixCommands.size
        };

    }

}

module.exports = CommandLoader;