const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema(
{
    guildId: {
        type: String,
        required: true,
        unique: true
    },

    prefix: {
        type: String,
        default: ","
    },

    language: {
        type: String,
        default: "en"
    },

    welcomeChannel: String,

    goodbyeChannel: String,

    logChannel: String,

    autoRole: String,

    verificationRole: String,

    ticketCategory: String,

    transcriptChannel: String,

    modLogChannel: String,

    // =========================================
    // WARNING PUNISHMENT SYSTEM
    // =========================================

    warningPunishments: {

        enabled: {
            type: Boolean,
            default: false
        },

        thresholds: {

            timeout10m: {
                type: Number,
                default: 3
            },

            timeout1h: {
                type: Number,
                default: 4
            },

            timeout1d: {
                type: Number,
                default: 5
            },

            kick: {
                type: Number,
                default: 6
            },

            ban: {
                type: Number,
                default: 7
            }

        }

    },

    // =========================================
    // PREMIUM
    // =========================================

    premium: {
        type: Boolean,
        default: false
    }

},
{
    timestamps: true
});

module.exports =
    mongoose.model(
        "Guild",
        guildSchema
    );