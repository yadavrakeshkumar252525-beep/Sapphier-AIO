const mongoose = require("mongoose");

const loggingConfigSchema = new mongoose.Schema(
    {
        // =========================================
        // SERVER
        // =========================================

        guildId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        // =========================================
        // MAIN LOG CHANNEL
        // =========================================

        channelId: {
            type: String,
            default: null
        },

        // =========================================
        // LOG STATUS
        // =========================================

        enabled: {
            type: Boolean,
            default: false
        },

        // =========================================
        // EVENT SETTINGS
        // =========================================

        memberJoin: {
            type: Boolean,
            default: true
        },

        memberLeave: {
            type: Boolean,
            default: true
        },

        messageDelete: {
            type: Boolean,
            default: true
        },

        messageEdit: {
            type: Boolean,
            default: true
        },

        memberBan: {
            type: Boolean,
            default: true
        },

        memberUnban: {
            type: Boolean,
            default: true
        },

        verification: {
            type: Boolean,
            default: true
        },

        moderation: {
            type: Boolean,
            default: true
        },

        // =========================================
        // META
        // =========================================

        createdBy: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "LoggingConfig",
        loggingConfigSchema
    );