const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
{
    guildId: {
        type: String,
        required: true,
        unique: true
    },

    enabled: {
        type: Boolean,
        default: false
    },

    channelId: String,

    roleId: String,

    logChannel: String,

    messageId: String,

    method: {
        type: String,
        default: "button"
    },

    minimumAccountAge: {
        type: Number,
        default: 0
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Verification", verificationSchema);