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

    premium: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Guild", guildSchema);