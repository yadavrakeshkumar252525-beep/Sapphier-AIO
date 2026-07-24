class Logger {

    static success(message) {
        console.log("✅ [SUCCESS]", message);
    }

    static info(message) {
        console.log("ℹ️ [INFO]", message);
    }

    static warning(message) {
        console.log("⚠️ [WARNING]", message);
    }

    static error(message) {
        console.error("❌ [ERROR]", message);
    }

    static debug(message) {
        console.log("🔧 [DEBUG]", message);
    }

}

module.exports = Logger;