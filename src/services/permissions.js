module.exports = {
    has(member, permissions = []) {
        if (!permissions.length) return true;

        return permissions.every(permission =>
            member.permissions.has(permission)
        );
    }
};