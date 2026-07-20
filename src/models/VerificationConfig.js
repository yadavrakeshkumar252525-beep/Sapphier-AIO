const mongoose = require("mongoose");

const verificationConfigSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },

    enabled: {
        type: Boolean,
        default: false
    },

    verifyChannel: String,

    verifyMessage: String,

    verifiedRole: String,

    logChannel: String,

    verificationType: {
        type: String,
        enum: ["button", "captcha", "math"],
        default: "button"
    },

    minimumAccountAge: {
        type: Number,
        default: 0
    },

    createdBy: String

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "VerificationConfig",
    verificationConfigSchema
);