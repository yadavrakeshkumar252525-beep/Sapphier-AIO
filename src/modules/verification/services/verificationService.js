const VerificationConfig = require("../../../models/VerificationConfig");

class VerificationService {

    static async get(guildId) {

        let config = await VerificationConfig.findOne({
            guildId
        });

        if (!config) {
            config = await VerificationConfig.create({
                guildId
            });
        }

        return config;

    }

}

module.exports = VerificationService;