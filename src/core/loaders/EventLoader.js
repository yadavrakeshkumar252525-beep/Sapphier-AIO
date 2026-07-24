const fs = require("fs");
const path = require("path");

class EventLoader {

    constructor(client) {
        this.client = client;
    }

    /**
     * Load all Discord events
     */
    async load() {

        const eventsPath = path.join(
            process.cwd(),
            "src",
            "events"
        );

        if (!fs.existsSync(eventsPath)) {

            console.warn(
                "⚠️ Events directory not found."
            );

            return 0;
        }

        const files = fs
            .readdirSync(eventsPath)
            .filter(file => file.endsWith(".js"));

        let loaded = 0;

        for (const file of files) {

            try {

                const filePath = path.join(
                    eventsPath,
                    file
                );

                // Clear cache
                delete require.cache[
                    require.resolve(filePath)
                ];

                const event = require(filePath);

                // Validate event name
                if (!event.name) {

                    console.warn(
                        `⚠️ Skipping event: ${file} (missing name)`
                    );

                    continue;

                }

                // Register one-time event
                if (event.once) {

                    this.client.once(
                        event.name,
                        (...args) => {

                            try {

                                event.execute(
                                    ...args
                                );

                            } catch (error) {

                                console.error(
                                    `❌ Error in event: ${event.name}`
                                );

                                console.error(error);

                            }

                        }
                    );

                }

                // Register normal event
                else {

                    this.client.on(
                        event.name,
                        (...args) => {

                            try {

                                event.execute(
                                    ...args
                                );

                            } catch (error) {

                                console.error(
                                    `❌ Error in event: ${event.name}`
                                );

                                console.error(error);

                            }

                        }
                    );

                }

                loaded++;

                console.log(
                    `  ↳ ${event.name} (${file})`
                );

            } catch (error) {

                console.error(
                    `❌ Failed to load event: ${file}`
                );

                console.error(error);

            }

        }

        console.log(`
========================================
📡 Event Loader
========================================
✅ Loaded Events: ${loaded}
========================================
`);

        return loaded;

    }

}

module.exports = EventLoader;