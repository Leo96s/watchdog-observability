# Arquitetura do frontend

Vue 3 (`<script setup>`) + Vite + Tailwind + Vuetify/Lucide para
ícones. Estrutura em `frontend/src/`:

```
src/
  App.vue                     # Estado da lista de serviços, liga tudo
  services/
    api.service.js             # Instância axios (baseURL + interceptor da API key)
  composables/
    useSocket.js                # Liga ao Socket.IO, expõe snapshot/updates
  utils/
    resolveApiUrl.js             # Normaliza VITE_API_URL/VITE_DOCS_URL (ver Configuração)
  components/
    ServiceForm.vue               # Criar serviço (+ secção avançada: method/status/headers)
    ServiceCard.vue                # Um serviço na grid (editar/histórico/apagar)
    EditServiceModal.vue           # Editar um serviço existente
    AddAlertModal.vue              # Gerir destinos de notificação de um serviço
    HistoryModal.vue               # Histórico de checks
    ApiKeySettings.vue             # Botão para definir a admin API key
    DocsButton.vue                  # Abre este site de docs
    Toast.vue / BaseSelect.vue      # Componentes de UI genéricos
```

## Como os dados chegam à UI

`App.vue` faz um `fetchStatus()` inicial (`GET /api/health`) e depois
delega em `useServiceSocket` (`composables/useSocket.js`):

- `services:snapshot` (ao ligar) substitui a lista toda.
- `service:update` (a cada check) atualiza só o serviço em causa.
- Mantém-se um `fetchStatus()` de reserva a cada 60s, caso a ligação
  Socket.IO caia silenciosamente.

Ações que escrevem dados (criar/editar/apagar serviço, gerir
notificações) chamam a API diretamente via `api.service.js`, que
injeta o header `X-API-Key` automaticamente em pedidos
`POST`/`PATCH`/`PUT`/`DELETE` a partir do valor guardado em
`localStorage` — ver [Segurança](/seguranca).

## Variáveis de build

`VITE_API_URL` e `VITE_DOCS_URL` são lidas em build-time e passam por
`resolveApiOrigin()` antes de qualquer pedido — ver
[Configuração](/config) para o porquê (hostnames internos do Render).
