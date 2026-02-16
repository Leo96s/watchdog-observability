const AlertState = require("../models/alertState.model");

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
