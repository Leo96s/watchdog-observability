/**
 * Shared shape for a service status used by the REST list endpoint and the
 * Socket.IO real-time updates, so both stay in sync.
 */
function toServiceStatusPayload(service) {
  return {
    id: service.id,
    name: service.serviceName,
    url: service.url,
    status: service.status,
    lastChecked: service.updatedAt,
    responseTime: service.responseTime || null,
    sslExpiry: service.sslExpiry || null,
  };
}

module.exports = { toServiceStatusPayload };
