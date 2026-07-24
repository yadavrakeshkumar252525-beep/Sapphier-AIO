const mongoose = require("mongoose");

const welcomeSchema = new mongoose.Schema(
    {
        guildId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        // ================================
        // WELCOME SYSTEM
        // ================================

        enabled: {
            type: Boolean,
            default: false
        },

        channelId: {
            type: String,
            default: null
        },

        message: {
            type: String,
            default:
                "Welcome {user} to **{server}**! 🎉\nYou are our **{count}th member**!"
        },

        embedEnabled: {
            type: Boolean,
            default: true
        },

        color: {
            type: String,
            default: "#3BA4FF"
        },

        mentionUser: {
            type: Boolean,
            default: true
        },

        showMemberCount: {
            type: Boolean,
            default: true
        },

        // ================================
        // GOODBYE SYSTEM
        // ================================

        goodbyeEnabled: {
            type: Boolean,
            default: false
        },

        goodbyeChannelId: {
            type: String,
            default: null
        },

        goodbyeMessage: {
            type: String,
            default:
                "👋 **{user}** has left **{server}**.\nWe now have **{count} members**."
        },

        goodbyeEmbedEnabled: {
            type: Boolean,
            default: true
        },

        goodbyeColor: {
            type: String,
            default: "#FF4D4D"
        },

        showGoodbyeMemberCount: {
            type: Boolean,
            default: true
        },

        // ================================
        // META
        // ================================

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
        "Welcome",
        welcomeSchema
    );