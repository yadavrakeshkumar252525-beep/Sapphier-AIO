const {
    EmbedBuilder
} = require("discord.js");

const Verification =
    require("../models/Verification");

const Log =
    require("../models/Log");


module.exports = async function verificationInteraction(
    interaction
) {

    // =========================================
    // SERVER CHECK
    // =========================================

    if (
        !interaction.guild
    ) {

        return interaction.reply({

            content:
                "❌ Verification can only be used inside a server.",

            ephemeral:
                true

        });

    }


    // =========================================
    // BOT CHECK
    // =========================================

    if (
        interaction.user.bot
    ) {

        return interaction.reply({

            content:
                "❌ Bots cannot use verification.",

            ephemeral:
                true

        });

    }


    try {

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
                    "❌ Verification system is currently disabled.",

                ephemeral:
                    true

            });

        }


        // =========================================
        // ACCOUNT AGE
        // =========================================

        if (
            data.minimumAccountAge
        ) {

            const age =

                Date.now() -
                interaction.user.createdTimestamp;


            const requiredAge =

                data.minimumAccountAge *
                24 *
                60 *
                60 *
                1000;


            if (
                age <
                requiredAge
            ) {

                const remaining =

                    Math.ceil(

                        (

                            requiredAge -
                            age

                        )

                        /

                        (

                            24 *
                            60 *
                            60 *
                            1000

                        )

                    );


                return interaction.reply({

                    content:

                        `❌ Your Discord account is too new.\n\n` +

                        `⏳ Please wait approximately **${remaining} day(s)** before verifying.`,

                    ephemeral:
                        true

                });

            }

        }


        // =========================================
        // GET ROLE
        // =========================================

        const role =

            interaction.guild.roles.cache.get(

                data.roleId

            );


        if (
            !role
        ) {

            return interaction.reply({

                content:
                    "❌ Verification role was not found. Please contact an administrator.",

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
                    "✅ You are already verified.",

                ephemeral:
                    true

            });

        }


        // =========================================
        // ADD ROLE
        // =========================================

        await interaction.member.roles.add(

            role,

            "Sapphier AIO Verification"

        );


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

                moderatorId:
                    interaction.client.user.id,

                moderatorUsername:
                    interaction.client.user.tag,

                action:
                    "verification",

                channelId:
                    interaction.channel?.id,

                details:
                    `${interaction.user.tag} successfully verified`

            });

        } catch (logError) {

            console.error(

                "⚠️ Verification Log Error:",

                logError

            );

        }


        // =========================================
        // SUCCESS
        // =========================================

        return interaction.reply({

            content:
                "✅ **You have been successfully verified!**",

            ephemeral:
                true

        });


    } catch (error) {

        console.error(

            "❌ Verification Error:",

            error

        );


        if (

            interaction.replied ||

            interaction.deferred

        ) {

            return interaction.followUp({

                content:
                    "❌ Verification failed. Please try again later.",

                ephemeral:
                    true

            }).catch(
                () => {}
            );

        }


        return interaction.reply({

            content:
                "❌ Verification failed. Please try again later.",

            ephemeral:
                true

        }).catch(
            () => {}
        );

    }

};