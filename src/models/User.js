const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    guildId: String,

    userId: String,

    xp: {
        type: Number,
        default: 0
    },

    level: {
        type: Number,
        default: 1
    },

    balance: {
        type: Number,
        default: 0
    },

    bank: {
        type: Number,
        default: 0
    },

    warnings: {
        type: Number,
        default: 0
    },

    verified: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);