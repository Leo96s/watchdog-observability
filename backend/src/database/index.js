const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // desativa logs SQL
    retry: {
      max: 10
    },
    dialectOptions: {
      ssl: {
        require: true, // Render exige SSL
        rejectUnauthorized: false // Importante para bases de dados geridas
      }
    }
  }
);

// Testar a conexão
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão ao PostgreSQL estabelecida com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao PostgreSQL:', error);
  }
})();

module.exports = sequelize;
