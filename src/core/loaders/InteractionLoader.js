const fs = require("fs");
const path = require("path");

class InteractionLoader {

    constructor(client) {
        this.client = client;
    }

    /**
     * Load all Discord interactions
     *
     * Supported:
     * - Buttons
     * - Modals
     * - Select Menus
     */
    async load() {

        const results = {
            buttons: 0,
            modals: 0,
            selectMenus: 0
        };

        // =========================
        // Load Buttons
        // =========================

        const buttonsPath = path.join(
            process.cwd(),
            "src",
            "interactions",
            "buttons"
        );

        results.buttons = this.loadType(
            buttonsPath,
            this.client.buttons,
            "button"
        );

        // =========================
        // Load Modals
        // =========================

        const modalsPath = path.join(
            process.cwd(),
            "src",
            "interactions",
            "modals"
        );

        results.modals = this.loadType(
            modalsPath,
            this.client.modals,
            "modal"
        );

        // =========================
        // Load Select Menus
        // =========================

        const selectMenusPath = path.join(
            process.cwd(),
            "src",
            "interactions",
            "selectMenus"
        );

        results.selectMenus = this.loadType(
            selectMenusPath,
            this.client.selectMenus,
            "select menu"
        );

        // =========================
        // Summary
        // =========================

        console.log(`
========================================
🧩 Interaction Loader
========================================
🔘 Buttons     : ${results.buttons}
📝 Modals      : ${results.modals}
📋 Select Menus: ${results.selectMenus}
========================================
`);

        return results;

    }

    /**
     * Load a specific interaction type
     */
    loadType(directory, collection, type) {

        if (!fs.existsSync(directory)) {
            return 0;
        }

        let loaded = 0;

        const files = this.getJavaScriptFiles(directory);

        for (const filePath of files) {

            try {

                // Clear cache for future reload support
                delete require.cache[
                    require.resolve(filePath)
                ];

                const interaction = require(filePath);

                // =========================
                // Validate
                // =========================

                if (!interaction.customId) {

                    console.warn(
                        `⚠️ Skipping ${type}: ${path.basename(filePath)}`
                    );

                    console.warn(
                        `   Missing "customId".`
                    );

                    continue;

                }

                // =========================
                // Register
                // =========================

                collection.set(
                    interaction.customId,
                    interaction
                );

                loaded++;

                console.log(
                    `  ↳ ${interaction.customId} (${type})`
                );

            } catch (error) {

                console.error(
                    `❌ Failed to load ${type}: ${path.basename(filePath)}`
                );

                console.error(error);

            }

        }

        return loaded;

    }

    /**
     * Recursively find JavaScript files
     */
    getJavaScriptFiles(directory) {

        let files = [];

        const entries = fs.readdirSync(
            directory,
            { withFileTypes: true }
        );

        for (const entry of entries) {

            const fullPath = path.join(
                directory,
                entry.name
            );

            if (entry.isDirectory()) {

                files.push(
                    ...this.getJavaScriptFiles(fullPath)
                );

            }

            else if (
                entry.isFile() &&
                entry.name.endsWith(".js")
            ) {

                files.push(fullPath);

            }

        }

        return files;

    }

}

module.exports = InteractionLoader;