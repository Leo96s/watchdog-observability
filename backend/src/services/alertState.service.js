const AlertState = require("../models/alertState.model");

/**
 * This service is responsible for tracking the last known state of each monitored service.
 * It allows us to determine when a service changes state (e.g., from UP to DOWN) 
 * and trigger alerts accordingly.
 * @param {*} serviceId 
 * @param {*} newStatus 
 * @returns 
 */
async function hasStateChanged(serviceId, newStatus) {

  const state = await AlertState.findByPk(serviceId);

  if (!state) {
    await AlertState.create({
      serviceId,
      lastStatus: newStatus,
      lastChange: new Date()
    });
    return true;
  }

  if (state.lastStatus !== newStatus) {
    state.lastStatus = newStatus;
    state.lastChange = new Date();
    await state.save();
    return true;
  }

  return false;
}

module.exports = { hasStateChanged };
