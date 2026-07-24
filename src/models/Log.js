const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
    {
        // =========================================
        // SERVER
        // =========================================

        guildId: {
            type: String,
            required: true,
            index: true
        },


        // =========================================
        // TARGET USER
        // =========================================

        userId: {
            type: String,
            required: true,
            index: true
        },

        username: {
            type: String,
            default: "Unknown User"
        },


        // =========================================
        // MODERATOR
        // =========================================

        moderatorId: {
            type: String,
            default: null,
            index: true
        },

        moderatorUsername: {
            type: String,
            default: "Unknown Moderator"
        },


        // =========================================
        // ACTION
        // =========================================

        action: {
            type: String,
            required: true,
            default: "unknown",
            index: true
        },


        // =========================================
        // CHANNEL
        // =========================================

        channelId: {
            type: String,
            default: null
        },


        // =========================================
        // DETAILS
        // =========================================

        details: {
            type: String,
            default: null
        },


        // =========================================
        // REASON
        // =========================================

        reason: {
            type: String,
            default: "No reason provided"
        }

    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "Log",
        logSchema
    );