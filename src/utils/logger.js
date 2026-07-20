const chalk = require("chalk");

class Logger {

    static info(message) {
        console.log(chalk.blue("[INFO]"), message);
    }

    static success(message) {
        console.log(chalk.green("[SUCCESS]"), message);
    }

    static warn(message) {
        console.log(chalk.yellow("[WARNING]"), message);
    }

    static error(message) {
        console.log(chalk.red("[ERROR]"), message);
    }

}

module.exports = Logger;