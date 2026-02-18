const pino = require("pino");

/**
 * This logger is responsible for logging important events and errors throughout the application.
 * It uses the Pino library for efficient logging and is configured to output logs in a human-readable format.
 * The logger can be used across all services and modules to maintain consistent logging practices.
 */
const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty"
  }
});

module.exports = logger;
