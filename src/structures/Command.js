class Command {
    constructor(options) {
        this.name = options.name;
        this.description = options.description || "No description.";
        this.category = options.category || "General";
        this.cooldown = options.cooldown || 3;
        this.permissions = options.permissions || [];
        this.ownerOnly = options.ownerOnly || false;
        this.aliases = options.aliases || [];
    }
}

module.exports = Command;