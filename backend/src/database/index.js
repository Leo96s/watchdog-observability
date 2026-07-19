const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
const isProduction = process.env.NODE_ENV === 'production';
/**
 * This module initializes the Sequelize instance to connect to a PostgreSQL database using credentials 
 * from environment variables. It also includes a test connection to ensure that the database is reachable 
 * and the credentials are correct. The Sequelize instance is exported for use in other parts of the 
 * application, such as defining models and performing database operations.
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // Deactivate logging for cleaner output
    retry: {
      max: 10
    },
    dialectOptions: isProduction ?{
      ssl: {
        require: true, // Render needs SSL
        rejectUnauthorized: false //Its important for managed databases like Heroku Postgres, which use self-signed certificates
      }
    } : {}
  }
);

// Testing the connection
(async () => {
  try {
    logger.info(`Trying to connect to database: ${process.env.DB_NAME}`);
    await sequelize.authenticate();
    logger.info('Connection to PostgreSQL established successfully!');
  } catch (error) {
    logger.error({ error }, 'Error connecting to PostgreSQL');
  }
})();

module.exports = sequelize;
