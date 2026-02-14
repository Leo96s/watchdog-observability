require('dotenv').config(); // garante que lê o .env
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // desativa logs SQL, podes mudar para true se quiseres debug
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
