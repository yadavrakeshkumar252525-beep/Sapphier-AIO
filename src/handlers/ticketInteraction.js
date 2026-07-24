const {
    EmbedBuilder,
    ChannelType,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const Ticket = require("../models/Ticket");
const Log = require("../models/Log");

// =====================================================
// STAFF ROLE
// =====================================================

function getStaffRole(guild) {
    return guild.roles.cache.find(role =>
        ["staff", "support"].includes(
            role.name.toLowerCase()
        )
    );
}

// =====================================================
// STAFF CHECK
// =====================================================

function isStaff(interaction) {
    const staffRole = getStaffRole(interaction.guild);

    return (
        interaction.member.permissions.has(
            PermissionFlagsBits.ManageChannels
        ) ||
        (
            staffRole &&
            interaction.member.roles.cache.has(
                staffRole.id
            )
        )
    );
}

// =====================================================
// SAVE LOG
// =====================================================

async function saveLog(
    interaction,
    action,
    userId,
    username,
    details
) {
    try {
        await Log.create({
            guildId: interaction.guild.id,

            userId:
                userId ||
                interaction.user.id,

            username:
                username ||
                interaction.user.tag,

            moderatorId:
                interaction.user.id,

            moderatorUsername:
                interaction.user.tag,

            action,

            channelId:
                interaction.channel?.id || null,

            details:
                details || null
        });

    } catch (error) {
        console.error(
            "⚠️ Log Error:",
            error
        );
    }
}

// =====================================================
// CATEGORY MENU
// =====================================================

function categoryMenu() {
    return new ActionRowBuilder().addComponents(

        new StringSelectMenuBuilder()

            .setCustomId(
                "ticket_category"
            )

            .setPlaceholder(
                "📂 Select your ticket category"
            )

            .addOptions(

                {
                    label:
                        "Purchase / Order",

                    description:
                        "For purchases and orders",

                    value:
                        "purchase",

                    emoji:
                        "🛒"
                },

                {
                    label:
                        "Payment Support",

                    description:
                        "For payment related issues",

                    value:
                        "payment",

                    emoji:
                        "💳"
                },

                {
                    label:
                        "Order Issue",

                    description:
                        "For existing order problems",

                    value:
                        "order_issue",

                    emoji:
                        "🔄"
                },

                {
                    label:
                        "General Support",

                    description:
                        "For general questions",

                    value:
                        "general",

                    emoji:
                        "❓"
                }

            )
    );
}

// =====================================================
// CATEGORY NAME
// =====================================================

function categoryName(category) {

    const names = {

        purchase:
            "purchase",

        payment:
            "payment",

        order_issue:
            "order-issue",

        general:
            "general"

    };

    return (
        names[category] ||
        "general"
    );
}

// =====================================================
// CATEGORY LABEL
// =====================================================

function categoryLabel(category) {

    const labels = {

        purchase:
            "🛒 Purchase / Order",

        payment:
            "💳 Payment Support",

        order_issue:
            "🔄 Order Issue",

        general:
            "❓ General Support"

    };

    return (
        labels[category] ||
        "❓ General Support"
    );
}

// =====================================================
// TICKET BUTTON ROW
// =====================================================

function openTicketButtons() {

    const claimButton =
        new ButtonBuilder()

            .setCustomId(
                "ticket_claim"
            )

            .setLabel(
                "Claim Ticket"
            )

            .setEmoji(
                "🎯"
            )

            .setStyle(
                ButtonStyle.Success
            );

    const closeButton =
        new ButtonBuilder()

            .setCustomId(
                "ticket_close"
            )

            .setLabel(
                "Close Ticket"
            )

            .setEmoji(
                "🔒"
            )

            .setStyle(
                ButtonStyle.Danger
            );

    return new ActionRowBuilder()
        .addComponents(
            claimButton,
            closeButton
        );
}

// =====================================================
// GENERATE TRANSCRIPT
// =====================================================

async function generateTranscript(
    channel,
    ticket
) {

    try {

        const messages =
            await channel.messages.fetch({
                limit: 100
            });

        const sortedMessages =
            [...messages.values()].sort(
                (a, b) =>
                    a.createdTimestamp -
                    b.createdTimestamp
            );

        const transcriptDir =
            path.join(
                process.cwd(),
                "transcripts"
            );

        if (
            !fs.existsSync(
                transcriptDir
            )
        ) {

            fs.mkdirSync(
                transcriptDir,
                {
                    recursive:
                        true
                }
            );

        }

        const safeName =
            channel.name.replace(
                /[^a-zA-Z0-9-_]/g,
                "-"
            );

        const filePath =
            path.join(
                transcriptDir,
                `${safeName}-${Date.now()}.html`
            );

        const escapeHTML =
            text =>
                String(
                    text || ""
                )

                    .replace(
                        /&/g,
                        "&amp;"
                    )

                    .replace(
                        /</g,
                        "&lt;"
                    )

                    .replace(
                        />/g,
                        "&gt;"
                    )

                    .replace(
                        /"/g,
                        "&quot;"
                    )

                    .replace(
                        /'/g,
                        "&#039;"
                    );

        let html = `<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
Sapphier AIO Ticket Transcript
</title>

<style>

body {
    background:#111827;
    color:#f9fafb;
    font-family:Arial,sans-serif;
    padding:30px;
}

.container {
    max-width:900px;
    margin:auto;
}

.header {
    background:#1f2937;
    padding:20px;
    border-radius:10px;
    margin-bottom:20px;
}

.message {
    background:#1f2937;
    padding:15px;
    margin-bottom:10px;
    border-radius:8px;
}

.author {
    font-weight:bold;
    color:#60a5fa;
}

.time {
    color:#9ca3af;
    font-size:12px;
}

.content {
    margin-top:8px;
    white-space:pre-wrap;
}

</style>

</head>

<body>

<div class="container">

<div class="header">

<h1>
🎫 Sapphier AIO Ticket Transcript
</h1>

<p>
<b>Channel:</b>
${escapeHTML(channel.name)}
</p>

<p>
<b>Ticket Owner:</b>
${escapeHTML(ticket.username)}
</p>

<p>
<b>Category:</b>
${escapeHTML(
    categoryLabel(
        ticket.category
    )
)}
</p>

<p>
<b>Ticket ID:</b>
${ticket.channelId}
</p>

<p>
<b>Generated:</b>
${new Date().toLocaleString()}
</p>

</div>
`;

        for (
            const message
            of sortedMessages
        ) {

            const author =
                message.author;

            html += `

<div class="message">

<div>

<span class="author">

${escapeHTML(
    author.tag
)}

</span>

<span class="time">

${new Date(
    message.createdTimestamp
).toLocaleString()}

</span>

</div>

<div class="content">

${escapeHTML(
    message.content ||
    "[No text content]"
)}

</div>
`;

            if (
                message.attachments.size > 0
            ) {

                html += `

<div>

<b>
📎 Attachments:
</b>

<ul>
`;

                for (
                    const attachment
                    of message.attachments.values()
                ) {

                    html += `

<li>

<a
href="${attachment.url}"
target="_blank"
>

${escapeHTML(
    attachment.name ||
    "Attachment"
)}

</a>

</li>
`;

                }

                html += `

</ul>

</div>
`;

            }

            html += `

</div>
`;

        }

        html += `

</div>

</body>

</html>
`;

        fs.writeFileSync(
            filePath,
            html,
            "utf8"
        );

        return filePath;

    } catch (error) {

        console.error(
            "❌ Transcript Error:",
            error
        );

        return null;

    }

}

// =====================================================
// MAIN TICKET HANDLER
// =====================================================

module.exports =
async function ticketInteraction(
    interaction
) {

    try {

        // =================================================
        // SERVER CHECK
        // =================================================

        if (
            !interaction.guild
        ) {

            return interaction.reply({

                content:
                    "❌ This can only be used inside a server.",

                ephemeral:
                    true

            });

        }

        const id =
            interaction.customId;

        // =================================================
        // CREATE TICKET PANEL BUTTON
        // =================================================

        if (
            id === "ticket_create"
        ) {

            return interaction.reply({

                content:
                    "📂 **Select the category for your ticket:**",

                components: [

                    categoryMenu()

                ],

                ephemeral:
                    true

            });

        }

        // =================================================
        // CATEGORY SELECT MENU
        // =================================================

        if (
            id === "ticket_category"
        ) {

            const category =
                interaction.values[0];

            const existingTicket =
                await Ticket.findOne({

                    guildId:
                        interaction.guild.id,

                    userId:
                        interaction.user.id,

                    status:
                        "open"

                });

            if (
                existingTicket
            ) {

                const existingChannel =
                    interaction.guild.channels.cache.get(
                        existingTicket.channelId
                    );

                if (
                    existingChannel
                ) {

                    return interaction.update({

                        content:
                            `❌ You already have an open ticket: ${existingChannel}`,

                        components:
                            []

                    });

                }

                await Ticket.deleteOne({

                    _id:
                        existingTicket._id

                });

            }

            await interaction.update({

                content:
                    "⏳ Creating your ticket...",

                components:
                    []

            });

            const staffRole =
                getStaffRole(
                    interaction.guild
                );

            let username =
                interaction.user.username

                    .toLowerCase()

                    .replace(
                        /[^a-z0-9-]/g,
                        ""
                    )

                    .slice(
                        0,
                        30
                    );

            if (
                !username
            ) {

                username =
                    "user";

            }

            let ticketChannel;

            // =================================================
            // CREATE CHANNEL
            // =================================================

            try {

                ticketChannel =
                    await interaction.guild.channels.create({

                        name:
                            `ticket-${categoryName(category)}-${username}`,

                        type:
                            ChannelType.GuildText,

                        permissionOverwrites:

                            [

                                {

                                    id:
                                        interaction.guild.roles.everyone.id,

                                    deny:

                                        [

                                            PermissionFlagsBits.ViewChannel

                                        ]

                                },

                                {

                                    id:
                                        interaction.user.id,

                                    allow:

                                        [

                                            PermissionFlagsBits.ViewChannel,

                                            PermissionFlagsBits.SendMessages,

                                            PermissionFlagsBits.ReadMessageHistory,

                                            PermissionFlagsBits.AttachFiles,

                                            PermissionFlagsBits.EmbedLinks

                                        ]

                                },

                                ...(staffRole
                                    ? [

                                        {

                                            id:
                                                staffRole.id,

                                            allow:

                                                [

                                                    PermissionFlagsBits.ViewChannel,

                                                    PermissionFlagsBits.SendMessages,

                                                    PermissionFlagsBits.ReadMessageHistory,

                                                    PermissionFlagsBits.AttachFiles,

                                                    PermissionFlagsBits.EmbedLinks,

                                                    PermissionFlagsBits.ManageMessages

                                                ]

                                        }

                                    ]

                                    : [])

                            ]

                    });

            } catch (
                error
            ) {

                console.error(
                    "❌ Ticket Channel Error:",
                    error
                );

                return interaction.editReply({

                    content:
                        "❌ I couldn't create the ticket channel. Check my **Manage Channels** permission."

                });

            }

            // =================================================
            // DATABASE
            // =================================================

            let ticket;

            try {

                ticket =
                    await Ticket.create({

                        guildId:
                            interaction.guild.id,

                        channelId:
                            ticketChannel.id,

                        messageId:
                            null,

                        userId:
                            interaction.user.id,

                        username:
                            interaction.user.tag,

                        category:
                            category,

                        status:
                            "open",

                        claimedBy:
                            null,

                        transcriptUrl:
                            null

                    });

            } catch (
                error
            ) {

                console.error(
                    "❌ Ticket Database Error:",
                    error
                );

                await ticketChannel
                    .delete()
                    .catch(
                        () => {}
                    );

                return interaction.editReply({

                    content:
                        "❌ Failed to save the ticket in database."

                });

            }

            // =================================================
            // TICKET EMBED
            // =================================================

            const ticketEmbed =
                new EmbedBuilder()

                    .setColor(
                        "#3BA4FF"
                    )

                    .setTitle(
                        "🎫 Sapphier Support Ticket"
                    )

                    .setDescription(

                        `Welcome ${interaction.user}!\n\n` +

                        `📂 **Category:** ${categoryLabel(category)}\n\n` +

                        "Please explain your request clearly.\n" +

                        "A staff member will assist you shortly."

                    )

                    .addFields(

                        {

                            name:
                                "👤 Owner",

                            value:
                                `${interaction.user}`,

                            inline:
                                true

                        },

                        {

                            name:
                                "📂 Category",

                            value:
                                categoryLabel(
                                    category
                                ),

                            inline:
                                true

                        },

                        {

                            name:
                                "📊 Status",

                            value:
                                "🟢 Open",

                            inline:
                                true

                        },

                        {

                            name:
                                "🎯 Claimed By",

                            value:
                                "Nobody",

                            inline:
                                true

                        }

                    )

                    .setFooter({

                        text:
                            "Sapphier AIO • Premium Ticket System"

                    })

                    .setTimestamp();

            // =================================================
            // SEND TICKET MESSAGE WITH BUTTONS
            // =================================================

            const message =
                await ticketChannel.send({

                    content:
                        `${interaction.user}`,

                    embeds:
                        [
                            ticketEmbed
                        ],

                    components:
                        [
                            openTicketButtons()
                        ]

                });

            // =================================================
            // SAVE MESSAGE ID
            // =================================================

            ticket.messageId =
                message.id;

            await ticket.save();

            // =================================================
            // LOG
            // =================================================

            await saveLog(

                interaction,

                "ticket_create",

                interaction.user.id,

                interaction.user.tag,

                `Ticket created: ${ticketChannel.name} | Category: ${categoryLabel(category)}`

            );

            // =================================================
            // SUCCESS
            // =================================================

            return interaction.editReply({

                content:

                    `✅ **Ticket created successfully!**\n\n` +

                    `🎫 ${ticketChannel}\n` +

                    `📂 **Category:** ${categoryLabel(category)}`

            });

        }

        // =================================================
        // FIND DATABASE TICKET
        // =================================================

        const ticket =
            await Ticket.findOne({

                guildId:
                    interaction.guild.id,

                channelId:
                    interaction.channel.id

            });

        if (
            !ticket
        ) {

            return interaction.reply({

                content:
                    "❌ This channel is not a registered ticket.",

                ephemeral:
                    true

            });

        }

        // =================================================
        // CLAIM
        // =================================================

        if (
            id === "ticket_claim"
        ) {

            if (
                !isStaff(interaction)
            ) {

                return interaction.reply({

                    content:
                        "❌ Only staff can claim tickets.",

                    ephemeral:
                        true

                });

            }

            if (
                ticket.status !==
                "open"
            ) {

                return interaction.reply({

                    content:
                        "❌ This ticket is closed.",

                    ephemeral:
                        true

                });

            }

            if (
                ticket.claimedBy
            ) {

                return interaction.reply({

                    content:
                        `⚠️ This ticket is already claimed by <@${ticket.claimedBy}>.`,

                    ephemeral:
                        true

                });

            }

            ticket.claimedBy =
                interaction.user.id;

            await ticket.save();

            const message =
                await interaction.channel.messages.fetch(
                    ticket.messageId
                );

            const unclaimButton =
                new ButtonBuilder()

                    .setCustomId(
                        "ticket_unclaim"
                    )

                    .setLabel(
                        "Unclaim Ticket"
                    )

                    .setEmoji(
                        "🔄"
                    )

                    .setStyle(
                        ButtonStyle.Secondary
                    );

            const closeButton =
                new ButtonBuilder()

                    .setCustomId(
                        "ticket_close"
                    )

                    .setLabel(
                        "Close Ticket"
                    )

                    .setEmoji(
                        "🔒"
                    )

                    .setStyle(
                        ButtonStyle.Danger
                    );

            await message.edit({

                components:

                    [

                        new ActionRowBuilder()

                            .addComponents(

                                unclaimButton,

                                closeButton

                            )

                    ]

            });

            await saveLog(

                interaction,

                "ticket_claim",

                ticket.userId,

                ticket.username,

                `Ticket claimed by ${interaction.user.tag}`

            );

            return interaction.reply({

                content:
                    "✅ Ticket claimed successfully.",

                ephemeral:
                    true

            });

        }

        // =================================================
        // UNCLAIM
        // =================================================

        if (
            id === "ticket_unclaim"
        ) {

            if (

                ticket.claimedBy !==
                interaction.user.id

                &&

                !interaction.member.permissions.has(
                    PermissionFlagsBits.ManageChannels
                )

            ) {

                return interaction.reply({

                    content:
                        "❌ Only the claimer or a manager can unclaim this ticket.",

                    ephemeral:
                        true

                });

            }

            ticket.claimedBy =
                null;

            await ticket.save();

            const message =
                await interaction.channel.messages.fetch(
                    ticket.messageId
                );

            await message.edit({

                components:

                    [

                        openTicketButtons()

                    ]

            });

            return interaction.reply({

                content:
                    "✅ Ticket unclaimed successfully.",

                ephemeral:
                    true

            });

        }

        // =================================================
        // CLOSE
        // =================================================

        if (
            id === "ticket_close"
        ) {

            if (

                ticket.userId !==
                interaction.user.id

                &&

                !isStaff(interaction)

            ) {

                return interaction.reply({

                    content:
                        "❌ You don't have permission to close this ticket.",

                    ephemeral:
                        true

                });

            }

            const confirm =
                new ButtonBuilder()

                    .setCustomId(
                        "ticket_close_confirm"
                    )

                    .setLabel(
                        "Confirm Close"
                    )

                    .setEmoji(
                        "🔒"
                    )

                    .setStyle(
                        ButtonStyle.Danger
                    );

            const cancel =
                new ButtonBuilder()

                    .setCustomId(
                        "ticket_close_cancel"
                    )

                    .setLabel(
                        "Cancel"
                    )

                    .setStyle(
                        ButtonStyle.Secondary
                    );

            return interaction.reply({

                content:
                    "⚠️ **Are you sure you want to close this ticket?**",

                components:

                    [

                        new ActionRowBuilder()

                            .addComponents(

                                confirm,

                                cancel

                            )

                    ],

                ephemeral:
                    true

            });

        }

        // =================================================
        // CANCEL CLOSE
        // =================================================

        if (
            id === "ticket_close_cancel"
        ) {

            return interaction.update({

                content:
                    "❌ Ticket close cancelled.",

                components:
                    []

            });

        }

        // =================================================
        // CONFIRM CLOSE
        // =================================================

        if (
            id === "ticket_close_confirm"
        ) {

            if (

                ticket.userId !==
                interaction.user.id

                &&

                !isStaff(interaction)

            ) {

                return interaction.update({

                    content:
                        "❌ You don't have permission.",

                    components:
                        []

                });

            }

            await interaction.update({

                content:
                    "⏳ Closing ticket and generating transcript...",

                components:
                    []

            });

            let transcriptPath =
                ticket.transcriptUrl ||
                null;

            if (
                !transcriptPath
            ) {

                transcriptPath =
                    await generateTranscript(

                        interaction.channel,

                        ticket

                    );

            }

            let transcriptSentToLogs =
                false;

            let transcriptSentToUser =
                false;

            // =================================================
            // LOG CHANNEL
            // =================================================

            if (
                transcriptPath
            ) {

                const logChannelId =
                    process.env.TICKET_LOG_CHANNEL_ID;

                const logChannel =
                    logChannelId

                        ? interaction.guild.channels.cache.get(
                            logChannelId
                        )

                        : null;

                if (

                    logChannel &&

                    logChannel.isTextBased()

                ) {

                    try {

                        await logChannel.send({

                            embeds:

                                [

                                    new EmbedBuilder()

                                        .setColor(
                                            "#ED4245"
                                        )

                                        .setTitle(
                                            "📄 Ticket Transcript"
                                        )

                                        .setDescription(

                                            `🎫 **Ticket:** ${interaction.channel.name}\n` +

                                            `👤 **Owner:** <@${ticket.userId}>\n` +

                                            `🔒 **Closed By:** ${interaction.user}\n` +

                                            `📂 **Category:** ${categoryLabel(ticket.category)}`

                                        )

                                        .setTimestamp()

                                ],

                            files:

                                [

                                    {

                                        attachment:
                                            transcriptPath,

                                        name:
                                            path.basename(
                                                transcriptPath
                                            )

                                    }

                                ]

                        });

                        transcriptSentToLogs =
                            true;

                    } catch (
                        error
                    ) {

                        console.error(
                            "⚠️ Transcript Log Error:",
                            error
                        );

                    }

                }

                // =================================================
                // OWNER DM
                // =================================================

                try {

                    const owner =
                        await interaction.client.users.fetch(
                            ticket.userId
                        );

                    await owner.send({

                        content:

                            "🔒 **Your Sapphier AIO support ticket has been closed.**\n\n" +

                            "📄 Your ticket transcript is attached below.\n\n" +

                            "Thank you for contacting **Sapphier's Slots**.",

                        files:

                            [

                                {

                                    attachment:
                                        transcriptPath,

                                    name:
                                        path.basename(
                                            transcriptPath
                                        )

                                }

                            ]

                    });

                    transcriptSentToUser =
                        true;

                } catch (
                    error
                ) {

                    console.error(
                        "⚠️ Owner DM Error:",
                        error
                    );

                }

            }

            // =================================================
            // DATABASE UPDATE
            // =================================================

            if (
                transcriptPath
            ) {

                ticket.transcriptUrl =
                    transcriptPath;

            }

            ticket.status =
                "closed";

            ticket.closedBy =
                interaction.user.id;

            ticket.closeReason =
                `Closed by ${interaction.user.tag}`;

            await ticket.save();

            // =================================================
            // LOCK OWNER
            // =================================================

            await interaction.channel.permissionOverwrites.edit(

                ticket.userId,

                {

                    SendMessages:
                        false

                }

            );

            // =================================================
            // CLOSED BUTTONS
            // =================================================

            const reopenButton =
                new ButtonBuilder()

                    .setCustomId(
                        "ticket_reopen"
                    )

                    .setLabel(
                        "Reopen Ticket"
                    )

                    .setEmoji(
                        "🔓"
                    )

                    .setStyle(
                        ButtonStyle.Success
                    );

            const deleteButton =
                new ButtonBuilder()

                    .setCustomId(
                        "ticket_delete"
                    )

                    .setLabel(
                        "Delete Ticket"
                    )

                    .setEmoji(
                        "🗑️"
                    )

                    .setStyle(
                        ButtonStyle.Danger
                    );

            const message =
                await interaction.channel.messages.fetch(
                    ticket.messageId
                );

            const closedEmbed =
                new EmbedBuilder()

                    .setColor(
                        "#ED4245"
                    )

                    .setTitle(
                        "🔒 Ticket Closed"
                    )

                    .setDescription(

                        `This ticket was closed by ${interaction.user}.\n\n` +

                        (

                            transcriptPath

                                ? "📄 Transcript generated successfully."

                                : "⚠️ Transcript generation failed."

                        )

                    )

                    .addFields(

                        {

                            name:
                                "👤 Owner",

                            value:
                                `<@${ticket.userId}>`,

                            inline:
                                true

                        },

                        {

                            name:
                                "📂 Category",

                            value:
                                categoryLabel(
                                    ticket.category
                                ),

                            inline:
                                true

                        },

                        {

                            name:
                                "📊 Status",

                            value:
                                "🔴 Closed",

                            inline:
                                true

                        }

                    )

                    .setTimestamp();

            await message.edit({

                embeds:
                    [
                        closedEmbed
                    ],

                components:

                    [

                        new ActionRowBuilder()

                            .addComponents(

                                reopenButton,

                                deleteButton

                            )

                    ]

            });

            await saveLog(

                interaction,

                "ticket_close",

                ticket.userId,

                ticket.username,

                `Ticket closed. Transcript: ${Boolean(transcriptPath)} | Log: ${transcriptSentToLogs} | DM: ${transcriptSentToUser}`

            );

            return interaction.editReply({

                content:

                    "🔒 **Ticket closed successfully.**\n" +

                    (

                        transcriptPath

                            ? "📄 Transcript generated."

                            : "⚠️ Transcript generation failed."

                    )

            });

        }

        // =================================================
        // REOPEN
        // =================================================

        if (
            id === "ticket_reopen"
        ) {

            if (
                !isStaff(interaction)
            ) {

                return interaction.reply({

                    content:
                        "❌ Only staff can reopen tickets.",

                    ephemeral:
                        true

                });

            }

            if (
                ticket.status !==
                "closed"
            ) {

                return interaction.reply({

                    content:
                        "❌ This ticket is already open.",

                    ephemeral:
                        true

                });

            }

            await interaction.deferUpdate();

            ticket.status =
                "open";

            ticket.closedBy =
                null;

            ticket.closeReason =
                null;

            ticket.claimedBy =
                null;

            await ticket.save();

            // =================================================
            // RESTORE USER
            // =================================================

            await interaction.channel.permissionOverwrites.edit(

                ticket.userId,

                {

                    ViewChannel:
                        true,

                    SendMessages:
                        true,

                    ReadMessageHistory:
                        true,

                    AttachFiles:
                        true,

                    EmbedLinks:
                        true

                }

            );

            const message =
                await interaction.channel.messages.fetch(
                    ticket.messageId
                );

            const reopenedEmbed =
                new EmbedBuilder()

                    .setColor(
                        "#3BA4FF"
                    )

                    .setTitle(
                        "🔓 Ticket Reopened"
                    )

                    .setDescription(

                        `This ticket has been reopened by ${interaction.user}.\n\n` +

                        "You can continue your conversation below.\n\n" +

                        "🎯 A staff member can claim this ticket.\n" +

                        "🔒 The ticket can be closed again when the issue is resolved."

                    )

                    .addFields(

                        {

                            name:
                                "👤 Owner",

                            value:
                                `<@${ticket.userId}>`,

                            inline:
                                true

                        },

                        {

                            name:
                                "📂 Category",

                            value:
                                categoryLabel(
                                    ticket.category
                                ),

                            inline:
                                true

                        },

                        {

                            name:
                                "📊 Status",

                            value:
                                "🟢 Open",

                            inline:
                                true

                        },

                        {

                            name:
                                "🎯 Claimed By",

                            value:
                                "Nobody",

                            inline:
                                true

                        }

                    )

                    .setFooter({

                        text:
                            "Sapphier AIO • Premium Ticket System"

                    })

                    .setTimestamp();

            await message.edit({

                embeds:
                    [
                        reopenedEmbed
                    ],

                components:

                    [

                        openTicketButtons()

                    ]

            });

            await saveLog(

                interaction,

                "ticket_reopen",

                ticket.userId,

                ticket.username,

                `Ticket reopened by ${interaction.user.tag}`

            );

            return;

        }

        // =================================================
        // DELETE
        // =================================================

        if (
            id === "ticket_delete"
        ) {

            if (
                !isStaff(interaction)
            ) {

                return interaction.reply({

                    content:
                        "❌ Only staff can delete tickets.",

                    ephemeral:
                        true

                });

            }

            if (
                ticket.status !==
                "closed"
            ) {

                return interaction.reply({

                    content:
                        "❌ Please close the ticket before deleting it.",

                    ephemeral:
                        true

                });

            }

            const confirm =
                new ButtonBuilder()

                    .setCustomId(
                        "ticket_delete_confirm"
                    )

                    .setLabel(
                        "Confirm Delete"
                    )

                    .setEmoji(
                        "🗑️"
                    )

                    .setStyle(
                        ButtonStyle.Danger
                    );

            const cancel =
                new ButtonBuilder()

                    .setCustomId(
                        "ticket_delete_cancel"
                    )

                    .setLabel(
                        "Cancel"
                    )

                    .setStyle(
                        ButtonStyle.Secondary
                    );

            return interaction.reply({

                content:

                    "⚠️ **Are you sure?** This will permanently delete the ticket channel.",

                components:

                    [

                        new ActionRowBuilder()

                            .addComponents(

                                confirm,

                                cancel

                            )

                    ],

                ephemeral:
                    true

            });

        }

        // =================================================
        // CANCEL DELETE
        // =================================================

        if (
            id === "ticket_delete_cancel"
        ) {

            return interaction.update({

                content:
                    "❌ Ticket deletion cancelled.",

                components:
                    []

            });

        }

        // =================================================
        // CONFIRM DELETE
        // =================================================

        if (
            id === "ticket_delete_confirm"
        ) {

            if (
                !isStaff(interaction)
            ) {

                return interaction.update({

                    content:
                        "❌ Only staff can delete tickets.",

                    components:
                        []

                });

            }

            await interaction.update({

                content:
                    "🗑️ **Deleting ticket...**",

                components:
                    []

            });

            await saveLog(

                interaction,

                "ticket_delete",

                ticket.userId,

                ticket.username,

                ticket.transcriptUrl

                    ? "Ticket deleted. Transcript was already generated."

                    : "Ticket deleted. No transcript available."

            );

            await Ticket.deleteOne({

                _id:
                    ticket._id

            });

            setTimeout(

                () => {

                    interaction.channel

                        .delete(
                            "Ticket deleted by staff"
                        )

                        .catch(
                            () => {}
                        );

                },

                1000

            );

            return;

        }

    } catch (
        error
    ) {

        console.error(
            "❌ Ticket Interaction Error:",
            error
        );

        if (
            interaction.replied ||
            interaction.deferred
        ) {

            return interaction.followUp({

                content:
                    "❌ An unexpected error occurred while processing this ticket.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }

        return interaction.reply({

            content:
                "❌ An unexpected error occurred while processing this ticket.",

            ephemeral:
                true

        }).catch(
            () => {}
        );

    }

};