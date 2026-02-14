<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>System Overview</h1>
        <v-alert :type="globalStatusColor" prominent>
          {{ globalStatusText }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="service in services" :key="service.id" cols="12" md="4">
        <v-card>
          <v-card-title>
            {{ service.name }}
            <v-spacer />
            <v-chip :color="statusColor(service.status)" dark>
              {{ service.status }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div>Response Time: {{ service.responseTime }} ms</div>
            <div>
              SSL Expiry:
              <v-chip :color="sslColor(service.sslExpiry)">
                {{ formatDate(service.sslExpiry) }}
              </v-chip>
            </div>
            <div>
              Uptime 24h:
              <v-progress-linear
                :model-value="service.uptime"
                height="10"
                color="green"
              />
              {{ service.uptime }}%
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from "../services/api.service";

export default {
  data() {
    return {
      services: [],
    };
  },
  computed: {
    globalStatusColor() {
      if (this.services.some(s => s.status === "DOWN")) return "error";
      if (this.services.some(s => s.sslStatus === "CRITICAL")) return "warning";
      return "success";
    },
    globalStatusText() {
      if (this.services.some(s => s.status === "DOWN"))
        return "Incident Detected";
      return "All Systems Operational";
    },
  },
  methods: {
    async fetchData() {
      const { data } = await api.get("/health");
      this.services = data;
    },
    statusColor(status) {
      if (status === "UP") return "green";
      return "red";
    },
    sslColor(date) {
      const days =
        (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
      if (days < 7) return "red";
      if (days < 30) return "orange";
      return "green";
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>
