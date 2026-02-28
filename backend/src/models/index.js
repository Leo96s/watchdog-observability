// 1. Importa a tua instância que já tens configurada
const sequelize = require("../database"); // Ajusta o caminho se necessário

// 2. Importa os teus modelos
const ServiceStatus = require("./serviceStatus.model");
const NotificationDestination = require("./notificationDestination.model");
const ServiceLog = require("./serviceLog.model");
const AlertState = require("./alertState.model");

// 3. DEFINE AS ASSOCIAÇÕES AQUI
// Dizemos que um Serviço tem muitos Destinos de Notificação (1:N)
ServiceStatus.hasMany(NotificationDestination, { 
  as: 'destinations', 
  foreignKey: 'serviceId',
  onDelete: 'CASCADE' // Se o serviço for apagado da DB, apaga as notificações dele
});

// Relacionamento inverso (útil para consultas complexas)
NotificationDestination.belongsTo(ServiceStatus, { 
  foreignKey: 'serviceId' 
});

// Um Serviço também tem muitos Logs (Histórico)
ServiceStatus.hasMany(ServiceLog, { 
  foreignKey: 'serviceId' 
});

// 4. Exporta tudo junto
module.exports = {
  sequelize,
  ServiceStatus,
  NotificationDestination,
  ServiceLog,
  AlertState
};