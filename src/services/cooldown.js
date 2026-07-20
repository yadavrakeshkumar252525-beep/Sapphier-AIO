const cooldowns = new Map();

module.exports = {
    check(userId, command, seconds) {
        const key = `${userId}:${command}`;

        if (!cooldowns.has(key)) {
            cooldowns.set(key, Date.now());
            return false;
        }

        const expire = cooldowns.get(key) + seconds * 1000;

        if (Date.now() < expire) {
            return Math.ceil((expire - Date.now()) / 1000);
        }

        cooldowns.set(key, Date.now());
        return false;
    }
};