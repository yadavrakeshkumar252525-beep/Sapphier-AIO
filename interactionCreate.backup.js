const {
    Events,
    EmbedBuilder,
    ChannelType,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Verification =
    require("../models/Verification");

const Log =
    require("../models/Log");

const Ticket =
    require("../models/Ticket");


module.exports = {

    name:
        Events.InteractionCreate,


    async execute(interaction) {

        try {

            // =========================================
            // SLASH COMMANDS
            // =========================================

            if (
                interaction.isChatInputCommand()
            ) {

                const command =
                    interaction.client.commands.get(
                        interaction.commandName
                    );


                if (!command) {

                    console.warn(
                        `⚠️ Command not found: /${interaction.commandName}`
                    );

                    return;

                }


                await command.execute(
                    interaction
                );

                return;

            }


            // =========================================
            // BUTTON CHECK
            // =========================================

            if (
                !interaction.isButton()
            ) {

                return;

            }


            // =========================================
            // SERVER CHECK
            // =========================================

            if (
                !interaction.guild
            ) {

                return interaction.reply({

                    content:
                        "❌ This action can only be used inside a server.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // TICKET CREATE
            // =========================================

            if (
                interaction.customId ===
                "ticket_create"
            ) {

                if (
                    interaction.user.bot
                ) {

                    return interaction.reply({

                        content:
                            "❌ Bot accounts cannot create tickets.",

                        ephemeral:
                            true

                    });

                }


                // =========================================
                // CHECK EXISTING TICKET
                // =========================================

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

                        return interaction.reply({

                            content:
                                `❌ You already have an open ticket: ${existingChannel}`,

                            ephemeral:
                                true

                        });

                    }


                    await Ticket.deleteOne({

                        _id:
                            existingTicket._id

                    });

                }


                // =========================================
                // DEFER
                // =========================================

                await interaction.deferReply({

                    ephemeral:
                        true

                });


                // =========================================
                // FIND STAFF ROLE
                // =========================================

                const staffRole =

                    interaction.guild.roles.cache.find(

                        role =>

                            role.name.toLowerCase() ===
                                "staff"

                            ||

                            role.name.toLowerCase() ===
                                "support"

                    );


                // =========================================
                // USERNAME
                // =========================================

                let username =

                    interaction.user.username

                        .toLowerCase()

                        .replace(
                            /[^a-z0-9-]/g,
                            ""
                        )

                        .substring(
                            0,
                            60
                        );


                if (
                    !username
                ) {

                    username =
                        "user";

                }


                // =========================================
                // CREATE CHANNEL
                // =========================================

                let ticketChannel;


                try {

                    ticketChannel =

                        await interaction.guild.channels.create({

                            name:
                                `ticket-${username}`,

                            type:
                                ChannelType.GuildText,

                            permissionOverwrites: [

                                // EVERYONE
                                {

                                    id:
                                        interaction.guild.roles.everyone.id,

                                    deny: [

                                        PermissionFlagsBits.ViewChannel

                                    ]

                                },


                                // TICKET OWNER
                                {

                                    id:
                                        interaction.user.id,

                                    allow: [

                                        PermissionFlagsBits.ViewChannel,

                                        PermissionFlagsBits.SendMessages,

                                        PermissionFlagsBits.ReadMessageHistory,

                                        PermissionFlagsBits.AttachFiles,

                                        PermissionFlagsBits.EmbedLinks

                                    ]

                                },


                                // STAFF
                                ...(staffRole

                                    ? [

                                        {

                                            id:
                                                staffRole.id,

                                            allow: [

                                                PermissionFlagsBits.ViewChannel,

                                                PermissionFlagsBits.SendMessages,

                                                PermissionFlagsBits.ReadMessageHistory,

                                                PermissionFlagsBits.AttachFiles,

                                                PermissionFlagsBits.EmbedLinks,

                                                PermissionFlagsBits.ManageMessages

                                            ]

                                        }

                                    ]

                                    : []),


                                // BOT
                                {

                                    id:
                                        interaction.client.user.id,

                                    allow: [

                                        PermissionFlagsBits.ViewChannel,

                                        PermissionFlagsBits.SendMessages,

                                        PermissionFlagsBits.ReadMessageHistory,

                                        PermissionFlagsBits.AttachFiles,

                                        PermissionFlagsBits.EmbedLinks,

                                        PermissionFlagsBits.ManageChannels,

                                        PermissionFlagsBits.ManageMessages

                                    ]

                                }

                            ]

                        });


                } catch (channelError) {

                    console.error(

                        "❌ Ticket Channel Creation Error:",

                        channelError

                    );


                    return interaction.editReply({

                        content:

                            "❌ I couldn't create the ticket channel.\n\n" +

                            "Please make sure I have **Manage Channels** permission."

                    });

                }


                // =========================================
                // SAVE DATABASE
                // =========================================

                try {

                    await Ticket.create({

                        guildId:
                            interaction.guild.id,

                        channelId:
                            ticketChannel.id,

                        userId:
                            interaction.user.id,

                        username:
                            interaction.user.tag,

                        category:
                            "general",

                        status:
                            "open",

                        claimedBy:
                            null,

                        closedBy:
                            null,

                        closeReason:
                            null

                    });

                } catch (databaseError) {

                    console.error(

                        "❌ Ticket Database Error:",

                        databaseError

                    );


                    await ticketChannel.delete(

                        "Ticket database creation failed"

                    ).catch(
                        () => {}
                    );


                    return interaction.editReply({

                        content:
                            "❌ Ticket could not be saved to the database."

                    });

                }


                // =========================================
                // TICKET EMBED
                // =========================================

                const ticketEmbed =

                    new EmbedBuilder()

                        .setColor(
                            "#3BA4FF"
                        )

                        .setTitle(
                            "🎫 Welcome to Your Ticket"
                        )

                        .setDescription(

                            `Hello ${interaction.user}!\n\n` +

                            "Thank you for contacting **Sapphier's Slots** support.\n\n" +

                            "Please explain your request clearly and provide any relevant information.\n\n" +

                            "🛒 **Purchase / Order**\n" +

                            "💳 **Payment Support**\n" +

                            "🔄 **Order Issue**\n" +

                            "❓ **General Support**\n\n" +

                            "A staff member will assist you shortly."

                        )

                        .addFields(

                            {

                                name:
                                    "👤 Ticket Owner",

                                value:
                                    `${interaction.user}`,

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
                                    "Nobody yet",

                                inline:
                                    true

                            },

                            {

                                name:
                                    "👮 Support",

                                value:
                                    staffRole

                                        ? `${staffRole}`

                                        : "Staff role not configured",

                                inline:
                                    true

                            }

                        )

                        .setThumbnail(

                            interaction.user.displayAvatarURL({

                                dynamic:
                                    true,

                                size:
                                    256

                            })

                        )

                        .setFooter({

                            text:
                                "Sapphier AIO • Premium Support System"

                        })

                        .setTimestamp();


                // =========================================
                // CLAIM BUTTON
                // =========================================

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


                // =========================================
                // CLOSE BUTTON
                // =========================================

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


                const row =

                    new ActionRowBuilder()

                        .addComponents(

                            claimButton,

                            closeButton

                        );


                // =========================================
                // SEND TICKET MESSAGE
                // =========================================

                await ticketChannel.send({

                    content:
                        `${interaction.user}`,

                    embeds:
                        [ticketEmbed],

                    components:
                        [row]

                });


                // =========================================
                // LOG
                // =========================================

                try {

                    await Log.create({

                        guildId:
                            interaction.guild.id,

                        userId:
                            interaction.user.id,

                        username:
                            interaction.user.tag,

                        action:
                            "ticket_create",

                        channelId:
                            ticketChannel.id,

                        details:
                            `Ticket created by ${interaction.user.tag}`

                    });

                } catch (logError) {

                    console.error(

                        "⚠️ Failed to save ticket creation log:",

                        logError

                    );

                }


                return interaction.editReply({

                    content:

                        `✅ **Your ticket has been created successfully!**\n\n` +

                        `🎫 ${ticketChannel}`

                });

            }


            // =========================================
            // TICKET CLAIM
            // =========================================

            if (
                interaction.customId ===
                "ticket_claim"
            ) {

                const ticket =

                    await Ticket.findOne({

                        guildId:
                            interaction.guild.id,

                        channelId:
                            interaction.channel.id,

                        status:
                            "open"

                    });


                if (
                    !ticket
                ) {

                    return interaction.reply({

                        content:
                            "❌ This channel is not an active ticket.",

                        ephemeral:
                            true

                    });

                }


                // =========================================
                // FIND STAFF
                // =========================================

                const staffRole =

                    interaction.guild.roles.cache.find(

                        role =>

                            role.name.toLowerCase() ===
                                "staff"

                            ||

                            role.name.toLowerCase() ===
                                "support"

                    );


                const isStaff =

                    staffRole &&

                    interaction.member.roles.cache.has(

                        staffRole.id

                    );


                // =========================================
                // PERMISSION
                // =========================================

                if (

                    !isStaff &&

                    !interaction.member.permissions.has(

                        PermissionFlagsBits.ManageChannels

                    )

                ) {

                    return interaction.reply({

                        content:
                            "❌ Only staff members can claim tickets.",

                        ephemeral:
                            true

                    });

                }


                // =========================================
                // ALREADY CLAIMED
                // =========================================

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


                // =========================================
                // UPDATE DATABASE
                // =========================================

                await Ticket.findOneAndUpdate(

                    {

                        guildId:
                            interaction.guild.id,

                        channelId:
                            interaction.channel.id,

                        status:
                            "open",

                        claimedBy:
                            null

                    },

                    {

                        claimedBy:
                            interaction.user.id

                    }

                );


                // =========================================
                // CLAIMED EMBED
                // =========================================

                const claimEmbed =

                    new EmbedBuilder()

                        .setColor(
                            "#57F287"
                        )

                        .setTitle(
                            "🎯 Ticket Claimed"
                        )

                        .setDescription(

                            `${interaction.user} is now handling this ticket.\n\n` +

                            "If you need to release this ticket, use the **Unclaim Ticket** button."

                        )

                        .addFields({

                            name:
                                "🎯 Claimed By",

                            value:
                                `${interaction.user}`,

                            inline:
                                true

                        })

                        .setFooter({

                            text:
                                "Sapphier AIO • Ticket System"

                        })

                        .setTimestamp();


                // =========================================
                // UNCLAIM BUTTON
                // =========================================

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


                // =========================================
                // CLOSE BUTTON
                // =========================================

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


                const claimRow =

                    new ActionRowBuilder()

                        .addComponents(

                            unclaimButton,

                            closeButton

                        );


                // =========================================
                // SEND CLAIM MESSAGE
                // =========================================

                await interaction.channel.send({

                    embeds:
                        [claimEmbed],

                    components:
                        [claimRow]

                });


                // =========================================
                // LOG
                // =========================================

                try {

                    await Log.create({

                        guildId:
                            interaction.guild.id,

                        userId:
                            interaction.user.id,

                        username:
                            interaction.user.tag,

                        action:
                            "ticket_claim",

                        channelId:
                            interaction.channel.id,

                        details:
                            `Ticket claimed by ${interaction.user.tag}`

                    });

                } catch (logError) {

                    console.error(

                        "⚠️ Failed to save ticket claim log:",

                        logError

                    );

                }


                return interaction.reply({

                    content:
                        "✅ You have successfully claimed this ticket.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // TICKET UNCLAIM
            // =========================================

            if (
                interaction.customId ===
                "ticket_unclaim"
            ) {

                const ticket =

                    await Ticket.findOne({

                        guildId:
                            interaction.guild.id,

                        channelId:
                            interaction.channel.id,

                        status:
                            "open"

                    });


                if (
                    !ticket
                ) {

                    return interaction.reply({

                        content:
                            "❌ This channel is not an active ticket.",

                        ephemeral:
                            true

                    });

                }


                // =========================================
                // CHECK CLAIM
                // =========================================

                if (
                    !ticket.claimedBy
                ) {

                    return interaction.reply({

                        content:
                            "⚠️ This ticket is not currently claimed.",

                        ephemeral:
                            true

                    });

                }


                // =========================================
                // FIND STAFF
                // =========================================

                const staffRole =

                    interaction.guild.roles.cache.find(

                        role =>

                            role.name.toLowerCase() ===
                                "staff"

                            ||

                            role.name.toLowerCase() ===
                                "support"

                    );


                const isStaff =

                    staffRole &&

                    interaction.member.roles.cache.has(

                        staffRole.id

                    );


                const isManager =

                    interaction.member.permissions.has(

                        PermissionFlagsBits.ManageChannels

                    );


                // =========================================
                // ONLY CLAIMED STAFF / MANAGER
                // =========================================

                if (

                    ticket.claimedBy !==
                    interaction.user.id

                    &&

                    !isManager

                ) {

                    return interaction.reply({

                        content:

                            "❌ Only the staff member who claimed this ticket can unclaim it.",

                        ephemeral:
                            true

                    });

                }


                // =========================================
                // UPDATE DATABASE
                // =========================================

                await Ticket.findOneAndUpdate(

                    {

                        guildId:
                            interaction.guild.id,

                        channelId:
                            interaction.channel.id,

                        status:
                            "open"

                    },

                    {

                        claimedBy:
                            null

                    }

                );


                // =========================================
                // UNCLAIM EMBED
                // =========================================

                const unclaimEmbed =

                    new EmbedBuilder()

                        .setColor(
                            "#FEE75C"
                        )

                        .setTitle(
                            "🔄 Ticket Unclaimed"
                        )

                        .setDescription(

                            `${interaction.user} has unclaimed this ticket.\n\n` +

                            "This ticket is now available for another staff member."

                        )

                        .addFields({

                            name:
                                "🎯 Claimed By",

                            value:
                                "Nobody yet",

                            inline:
                                true

                        })

                        .setFooter({

                            text:
                                "Sapphier AIO • Ticket System"

                        })

                        .setTimestamp();


                // =========================================
                // CLAIM BUTTON
                // =========================================

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


                // =========================================
                // CLOSE BUTTON
                // =========================================

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


                const unclaimRow =

                    new ActionRowBuilder()

                        .addComponents(

                            claimButton,

                            closeButton

                        );


                await interaction.channel.send({

                    embeds:
                        [unclaimEmbed],

                    components:
                        [unclaimRow]

                });


                // =========================================
                // LOG
                // =========================================

                try {

                    await Log.create({

                        guildId:
                            interaction.guild.id,

                        userId:
                            interaction.user.id,

                        username:
                            interaction.user.tag,

                        action:
                            "ticket_unclaim",

                        channelId:
                            interaction.channel.id,

                        details:
                            `Ticket unclaimed by ${interaction.user.tag}`

                    });

                } catch (logError) {

                    console.error(

                        "⚠️ Failed to save ticket unclaim log:",

                        logError

                    );

                }


                return interaction.reply({

                    content:
                        "✅ Ticket successfully unclaimed.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // CLOSE TICKET
            // =========================================

            if (
                interaction.customId ===
                "ticket_close"
            ) {

                const ticket =

                    await Ticket.findOne({

                        guildId:
                            interaction.guild.id,

                        channelId:
                            interaction.channel.id,

                        status:
                            "open"

                    });


                if (
                    !ticket
                ) {

                    return interaction.reply({

                        content:
                            "❌ This channel is not an active ticket.",

                        ephemeral:
                            true

                    });

                }


                const confirmButton =

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


                const cancelButton =

                    new ButtonBuilder()

                        .setCustomId(
                            "ticket_close_cancel"
                        )

                        .setLabel(
                            "Cancel"
                        )

                        .setEmoji(
                            "❌"
                        )

                        .setStyle(
                            ButtonStyle.Secondary
                        );


                const row =

                    new ActionRowBuilder()

                        .addComponents(

                            confirmButton,

                            cancelButton

                        );


                return interaction.reply({

                    content:

                        "⚠️ **Are you sure you want to close this ticket?**",

                    components:
                        [row],

                    ephemeral:
                        true

                });

            }


            // =========================================
            // CANCEL CLOSE
            // =========================================

            if (
                interaction.customId ===
                "ticket_close_cancel"
            ) {

                return interaction.update({

                    content:
                        "❌ Ticket closing cancelled.",

                    components:
                        []

                });

            }


            // =========================================
            // CONFIRM CLOSE
            // =========================================

            if (
                interaction.customId ===
                "ticket_close_confirm"
            ) {

                const ticket =

                    await Ticket.findOne({

                        guildId:
                            interaction.guild.id,

                        channelId:
                            interaction.channel.id,

                        status:
                            "open"

                    });


                if (
                    !ticket
                ) {

                    return interaction.update({

                        content:
                            "❌ This ticket is already closed.",

                        components:
                            []

                    });

                }


                // =========================================
                // FIND STAFF
                // =========================================

                const staffRole =

                    interaction.guild.roles.cache.find(

                        role =>

                            role.name.toLowerCase() ===
                                "staff"

                            ||

                            role.name.toLowerCase() ===
                                "support"

                    );


                const isStaff =

                    staffRole &&

                    interaction.member.roles.cache.has(

                        staffRole.id

                    );


                const isOwner =

                    ticket.userId ===
                    interaction.user.id;


                // =========================================
                // CLOSE PERMISSION
                // =========================================

                if (

                    !isOwner &&

                    !isStaff &&

                    !interaction.member.permissions.has(

                        PermissionFlagsBits.ManageChannels

                    )

                ) {

                    return interaction.update({

                        content:

                            "❌ You do not have permission to close this ticket.",

                        components:
                            []

                    });

                }


                // =========================================
                // UPDATE DATABASE
                // =========================================

                await Ticket.findOneAndUpdate(

                    {

                        guildId:
                            interaction.guild.id,

                        channelId:
                            interaction.channel.id,

                        status:
                            "open"

                    },

                    {

                        status:
                            "closed",

                        closedBy:
                            interaction.user.id,

                        closeReason:
                            `Closed by ${interaction.user.tag}`

                    }

                );


                // =========================================
                // LOCK OWNER
                // =========================================

                await interaction.channel.permissionOverwrites.edit(

                    ticket.userId,

                    {

                        SendMessages:
                            false

                    }

                );


                // =========================================
                // DELETE BUTTON
                // =========================================

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


                const deleteRow =

                    new ActionRowBuilder()

                        .addComponents(

                            deleteButton

                        );


                // =========================================
                // CLOSED EMBED
                // =========================================

                const closedEmbed =

                    new EmbedBuilder()

                        .setColor(
                            "#ED4245"
                        )

                        .setTitle(
                            "🔒 Ticket Closed"
                        )

                        .setDescription(

                            `This ticket has been closed by ${interaction.user}.\n\n` +

                            "The ticket owner can no longer send messages in this channel.\n\n" +

                            "Staff can review the conversation."

                        )

                        .addFields(

                            {

                                name:
                                    "👤 Ticket Owner",

                                value:
                                    `<@${ticket.userId}>`,

                                inline:
                                    true

                            },

                            {

                                name:
                                    "🔒 Closed By",

                                value:
                                    `${interaction.user}`,

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

                        .setFooter({

                            text:
                                "Sapphier AIO • Ticket System"

                        })

                        .setTimestamp();


                // =========================================
                // UPDATE CONFIRMATION
                // =========================================

                await interaction.update({

                    content:
                        "",

                    embeds:
                        [closedEmbed],

                    components:
                        [deleteRow]

                });


                // =========================================
                // CLOSE NOTICE
                // =========================================

                await interaction.channel.send({

                    content:

                        `🔒 **Ticket Closed**\n\n` +

                        `Closed by: ${interaction.user}\n` +

                        `Ticket Owner: <@${ticket.userId}>`

                });


                // =========================================
                // LOG
                // =========================================

                try {

                    await Log.create({

                        guildId:
                            interaction.guild.id,

                        userId:
                            ticket.userId,

                        username:
                            ticket.username,

                        action:
                            "ticket_close",

                        channelId:
                            interaction.channel.id,

                        details:
                            `Ticket closed by ${interaction.user.tag}`

                    });

                } catch (logError) {

                    console.error(

                        "⚠️ Failed to save ticket close log:",

                        logError

                    );

                }


                return;

            }


            // =========================================
            // DELETE TICKET
            // =========================================

            if (
                interaction.customId ===
                "ticket_delete"
            ) {

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
                            "❌ This channel is not registered as a ticket.",

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
                            "❌ You can only delete a closed ticket.",

                        ephemeral:
                            true

                    });

                }


                const staffRole =

                    interaction.guild.roles.cache.find(

                        role =>

                            role.name.toLowerCase() ===
                                "staff"

                            ||

                            role.name.toLowerCase() ===
                                "support"

                    );


                const isStaff =

                    staffRole &&

                    interaction.member.roles.cache.has(

                        staffRole.id

                    );


                if (

                    !isStaff &&

                    !interaction.member.permissions.has(

                        PermissionFlagsBits.ManageChannels

                    )

                ) {

                    return interaction.reply({

                        content:
                            "❌ Only staff members can delete tickets.",

                        ephemeral:
                            true

                    });

                }


                const confirmDeleteButton =

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


                const cancelDeleteButton =

                    new ButtonBuilder()

                        .setCustomId(
                            "ticket_delete_cancel"
                        )

                        .setLabel(
                            "Cancel"
                        )

                        .setEmoji(
                            "❌"
                        )

                        .setStyle(
                            ButtonStyle.Secondary
                        );


                const row =

                    new ActionRowBuilder()

                        .addComponents(

                            confirmDeleteButton,

                            cancelDeleteButton

                        );


                return interaction.reply({

                    content:

                        "⚠️ **Are you sure you want to permanently delete this ticket?**\n\n" +

                        "🗑️ The ticket channel and database record will be permanently deleted.",

                    components:
                        [row],

                    ephemeral:
                        true

                });

            }


            // =========================================
            // CANCEL DELETE
            // =========================================

            if (
                interaction.customId ===
                "ticket_delete_cancel"
            ) {

                return interaction.update({

                    content:
                        "❌ Ticket deletion cancelled.",

                    components:
                        []

                });

            }


            // =========================================
            // CONFIRM DELETE
            // =========================================

            if (
                interaction.customId ===
                "ticket_delete_confirm"
            ) {

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

                    return interaction.update({

                        content:
                            "❌ Ticket record not found.",

                        components:
                            []

                    });

                }


                if (
                    ticket.status !==
                    "closed"
                ) {

                    return interaction.update({

                        content:
                            "❌ Only closed tickets can be deleted.",

                        components:
                            []

                    });

                }


                const staffRole =

                    interaction.guild.roles.cache.find(

                        role =>

                            role.name.toLowerCase() ===
                                "staff"

                            ||

                            role.name.toLowerCase() ===
                                "support"

                    );


                const isStaff =

                    staffRole &&

                    interaction.member.roles.cache.has(

                        staffRole.id

                    );


                if (

                    !isStaff &&

                    !interaction.member.permissions.has(

                        PermissionFlagsBits.ManageChannels

                    )

                ) {

                    return interaction.update({

                        content:
                            "❌ Only staff members can delete tickets.",

                        components:
                            []

                    });

                }


                // =========================================
                // LOG BEFORE DELETE
                // =========================================

                try {

                    await Log.create({

                        guildId:
                            interaction.guild.id,

                        userId:
                            interaction.user.id,

                        username:
                            interaction.user.tag,

                        action:
                            "ticket_delete",

                        channelId:
                            interaction.channel.id,

                        details:

                            `Ticket deleted by ${interaction.user.tag}. Ticket owner: ${ticket.username}`

                    });

                } catch (logError) {

                    console.error(

                        "⚠️ Failed to save ticket deletion log:",

                        logError

                    );

                }


                // =========================================
                // UPDATE RESPONSE
                // =========================================

                await interaction.update({

                    content:
                        "🗑️ **Ticket is being deleted...**",

                    components:
                        []

                });


                // =========================================
                // DELETE CHANNEL FIRST
                // =========================================

                try {

                    await interaction.channel.delete(

                        "Ticket deleted by staff"

                    );

                } catch (deleteError) {

                    console.error(

                        "❌ Failed to delete ticket channel:",

                        deleteError

                    );

                    return;

                }


                // =========================================
                // DELETE DATABASE RECORD
                // =========================================

                try {

                    await Ticket.deleteOne({

                        _id:
                            ticket._id

                    });

                } catch (databaseError) {

                    console.error(

                        "❌ Failed to delete ticket database record:",

                        databaseError

                    );

                }


                return;

            }


            // =========================================
            // VERIFICATION BUTTON
            // =========================================

            if (
                interaction.customId !==
                "verify_button"
            ) {

                return;

            }


            // =========================================
            // BOT PROTECTION
            // =========================================

            if (
                interaction.user.bot
            ) {

                return interaction.reply({

                    content:
                        "❌ Bot accounts cannot use the verification system.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // GET CONFIG
            // =========================================

            const data =

                await Verification.findOne({

                    guildId:
                        interaction.guild.id

                });


            if (
                !data ||
                !data.enabled
            ) {

                return interaction.reply({

                    content:
                        "❌ Verification is not currently configured.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // ROLE CHECK
            // =========================================

            if (
                !data.roleId
            ) {

                return interaction.reply({

                    content:
                        "❌ No verification role has been configured.",

                    ephemeral:
                        true

                });

            }


            const role =

                interaction.guild.roles.cache.get(

                    data.roleId

                );


            if (
                !role
            ) {

                return interaction.reply({

                    content:
                        "❌ The verification role no longer exists.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // ALREADY VERIFIED
            // =========================================

            if (

                interaction.member.roles.cache.has(

                    role.id

                )

            ) {

                return interaction.reply({

                    content:
                        "ℹ️ You are already verified! ✅",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // ACCOUNT AGE
            // =========================================

            if (

                data.minimumAccountAge &&

                data.minimumAccountAge > 0

            ) {

                const accountCreated =

                    interaction.user.createdTimestamp;


                const accountAgeMs =

                    Date.now() -
                    accountCreated;


                const accountAgeDays =

                    accountAgeMs /
                    (1000 * 60 * 60 * 24);


                if (

                    accountAgeDays <

                    data.minimumAccountAge

                ) {

                    const remainingDays =

                        Math.ceil(

                            data.minimumAccountAge -

                            accountAgeDays

                        );


                    return interaction.reply({

                        content:

                            `❌ **Verification Denied**\n\n` +

                            `Your Discord account is too new to verify in this server.\n\n` +

                            `📅 Required account age: **${data.minimumAccountAge} day(s)**\n` +

                            `⏳ Please wait approximately **${remainingDays} more day(s)** and try again.`,

                        ephemeral:
                            true

                    });

                }

            }


            // =========================================
            // BOT MEMBER
            // =========================================

            const botMember =

                interaction.guild.members.me;


            if (
                !botMember
            ) {

                return interaction.reply({

                    content:
                        "❌ I could not find my bot member in this server.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // ROLE HIERARCHY
            // =========================================

            if (

                role.position >=

                botMember.roles.highest.position

            ) {

                return interaction.reply({

                    content:

                        "❌ I cannot assign the verification role because my bot role is not high enough.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // ADD ROLE
            // =========================================

            try {

                await interaction.member.roles.add(

                    role,

                    "Sapphier AIO Verification"

                );

            } catch (error) {

                console.error(

                    "❌ Verification Role Error:",

                    error

                );


                return interaction.reply({

                    content:

                        "❌ I couldn't assign the verification role. Please contact a server administrator.",

                    ephemeral:
                        true

                });

            }


            // =========================================
            // MONGODB LOG
            // =========================================

            try {

                await Log.create({

                    guildId:
                        interaction.guild.id,

                    userId:
                        interaction.user.id,

                    username:
                        interaction.user.tag,

                    action:
                        "verification",

                    channelId:
                        interaction.channel.id,

                    details:

                        `User verified successfully and received role ${role.name} (${role.id})`

                });

            } catch (logError) {

                console.error(

                    "⚠️ Failed to save verification log:",

                    logError

                );

            }


            // =========================================
            // DISCORD LOG CHANNEL
            // =========================================

            if (
                data.logChannel
            ) {

                const logChannel =

                    interaction.guild.channels.cache.get(

                        data.logChannel

                    );


                if (

                    logChannel &&

                    logChannel.isTextBased()

                ) {

                    const logEmbed =

                        new EmbedBuilder()

                            .setColor(
                                "#3BA4FF"
                            )

                            .setTitle(
                                "🔐 Member Verified"
                            )

                            .setDescription(

                                `${interaction.user} has successfully completed server verification.`

                            )

                            .addFields(

                                {

                                    name:
                                        "👤 User",

                                    value:
                                        `${interaction.user.tag}`,

                                    inline:
                                        true

                                },

                                {

                                    name:
                                        "🆔 User ID",

                                    value:
                                        interaction.user.id,

                                    inline:
                                        true

                                },

                                {

                                    name:
                                        "🛡️ Role Given",

                                    value:
                                        `${role}`,

                                    inline:
                                        true

                                },

                                {

                                    name:
                                        "📢 Verification Channel",

                                    value:
                                        `${interaction.channel}`,

                                    inline:
                                        true

                                }

                            )

                            .setThumbnail(

                                interaction.user.displayAvatarURL({

                                    dynamic:
                                        true,

                                    size:
                                        256

                                })

                            )

                            .setFooter({

                                text:
                                    "Sapphier AIO • Verification Logs"

                            })

                            .setTimestamp();


                    await logChannel

                        .send({

                            embeds:
                                [logEmbed]

                        })

                        .catch(

                            error => {

                                console.error(

                                    "⚠️ Failed to send verification Discord log:",

                                    error

                                );

                            }

                        );

                }

            }


            // =========================================
            // VERIFICATION SUCCESS
            // =========================================

            return interaction.reply({

                content:

                    `✅ **Verification Successful!**\n\n` +

                    `You have received the ${role} role.\n\n` +

                    `Welcome to **${interaction.guild.name}**! 💎`,

                ephemeral:
                    true

            });

        } catch (error) {

            console.error(

                "❌ Interaction Error:",

                error

            );


            if (

                interaction.replied ||

                interaction.deferred

            ) {

                return interaction.followUp({

                    content:

                        "❌ An unexpected error occurred while processing this interaction.",

                    ephemeral:
                        true

                }).catch(

                    () => {}

                );

            }


            return interaction.reply({

                content:

                    "❌ An unexpected error occurred while processing this interaction.",

                ephemeral:
                    true

            }).catch(

                () => {}

            );

        }

    }

};