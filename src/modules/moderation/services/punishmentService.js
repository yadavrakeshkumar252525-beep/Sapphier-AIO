const Guild = require("../../../models/Guild");

async function getGuildConfig(guildId) {

    let config =
        await Guild.findOne({
            guildId
        });

    if (!config) {

        config =
            await Guild.create({

                guildId

            });

    }

    return config;
}


async function applyWarningPunishment({

    guild,

    member,

    warningCount,

    reason = "Automatic punishment after reaching warning threshold"

}) {

    try {

        // =========================================
        // GET SERVER CONFIG
        // =========================================

        const config =
            await getGuildConfig(
                guild.id
            );


        // =========================================
        // CHECK SYSTEM
        // =========================================

        if (
            !config.warningPunishments ||
            !config.warningPunishments.enabled
        ) {

            return {

                punished:
                    false,

                action:
                    "disabled"

            };

        }


        // =========================================
        // GET ACTION
        // =========================================

        const action =
            config.warningPunishments[
                `warning${warningCount}`
            ];


        // =========================================
        // NO ACTION
        // =========================================

        if (
            !action
        ) {

            return {

                punished:
                    false,

                action:
                    "none"

            };

        }


        // =========================================
        // BOT PROTECTION
        // =========================================

        if (
            member.user.bot
        ) {

            return {

                punished:
                    false,

                action:
                    "bot"

            };

        }


        // =========================================
        // ROLE HIERARCHY
        // =========================================

        const botMember =
            guild.members.me;


        if (
            !botMember
        ) {

            return {

                punished:
                    false,

                action:
                    "bot_member_not_found"

            };

        }


        if (
            member.roles.highest.position >=
            botMember.roles.highest.position
        ) {

            return {

                punished:
                    false,

                action:
                    "role_hierarchy"

            };

        }


        // =========================================
        // TIMEOUT 10 MINUTES
        // =========================================

        if (
            action ===
            "timeout_10m"
        ) {

            await member.timeout(

                10 * 60 * 1000,

                reason

            );

            return {

                punished:
                    true,

                action:
                    "timeout",

                duration:
                    "10 minutes"

            };

        }


        // =========================================
        // TIMEOUT 1 HOUR
        // =========================================

        if (
            action ===
            "timeout_1h"
        ) {

            await member.timeout(

                60 * 60 * 1000,

                reason

            );

            return {

                punished:
                    true,

                action:
                    "timeout",

                duration:
                    "1 hour"

            };

        }


        // =========================================
        // TIMEOUT 1 DAY
        // =========================================

        if (
            action ===
            "timeout_1d"
        ) {

            await member.timeout(

                24 * 60 * 60 * 1000,

                reason

            );

            return {

                punished:
                    true,

                action:
                    "timeout",

                duration:
                    "1 day"

            };

        }


        // =========================================
        // KICK
        // =========================================

        if (
            action ===
            "kick"
        ) {

            await member.kick(

                reason

            );

            return {

                punished:
                    true,

                action:
                    "kick"

            };

        }


        // =========================================
        // BAN
        // =========================================

        if (
            action ===
            "ban"
        ) {

            await member.ban({

                reason

            });

            return {

                punished:
                    true,

                action:
                    "ban"

            };

        }


        // =========================================
        // UNKNOWN ACTION
        // =========================================

        return {

            punished:
                false,

            action:
                "unknown"

        };

    } catch (error) {

        console.error(

            "❌ Automatic Punishment Error:",

            error

        );

        return {

            punished:
                false,

            action:
                "error",

            error:
                error.message

        };

    }

}


module.exports = {

    applyWarningPunishment

};