const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
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
        // TICKET CHANNEL
        // =========================================

        channelId: {
            type: String,
            required: true,
            unique: true
        },

        messageId: {
            type: String,
            default: null
        },

        // =========================================
        // TICKET OWNER
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
        // TICKET TYPE
        // =========================================

        category: {
            type: String,
            default: "general"
        },


        // =========================================
        // TICKET STATUS
        // =========================================

        status: {
            type: String,
            enum: [
                "open",
                "closed"
            ],
            default: "open",
            index: true
        },


        // =========================================
        // STAFF
        // =========================================

        claimedBy: {
            type: String,
            default: null
        },


        // =========================================
        // CLOSED BY
        // =========================================

        closedBy: {
            type: String,
            default: null
        },


        // =========================================
        // CLOSE REASON
        // =========================================

        closeReason: {
            type: String,
            default: null
        },


        // =========================================
        // TRANSCRIPT
        // =========================================

        transcriptUrl: {
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
        "Ticket",
        ticketSchema
    );