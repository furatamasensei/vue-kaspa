<script setup lang="ts">
import { useKaspa, useRpc, useNetwork } from 'vue-kaspa'
import { onMounted } from 'vue'

const kaspa = useKaspa()
const rpc = useRpc()
const network = useNetwork()

const statusColor = {
  idle: 'badge-gray',
  loading: 'badge-yellow',
  ready: 'badge-green',
  error: 'badge-red',
}

const connColor = {
  disconnected: 'badge-gray',
  connecting: 'badge-yellow',
  connected: 'badge-green',
  reconnecting: 'badge-yellow',
  error: 'badge-red',
}

async function initAndConnect() {
  try {
    await kaspa.init()
    await rpc.connect()
  } catch (e) {
    console.error(e)
  }
}

async function handleDisconnect() {
  await rpc.disconnect()
}
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Dashboard</h1>

    <div class="card">
      <h2>WASM Status</h2>
      <div class="row">
        <span :class="['badge', statusColor[kaspa.wasmStatus.value]]">
          {{ kaspa.wasmStatus.value }}
        </span>
        <span v-if="kaspa.wasmError.value" style="color:#f87171;font-size:13px">
          {{ kaspa.wasmError.value?.message }}
        </span>
      </div>
    </div>

    <div class="card">
      <h2>RPC Connection</h2>
      <div class="row" style="margin-bottom:12px">
        <span :class="['badge', connColor[rpc.connectionState.value]]">
          {{ rpc.connectionState.value }}
        </span>
        <span v-if="rpc.url.value" class="mono" style="font-size:12px;color:#64748b">{{ rpc.url.value }}</span>
      </div>

      <div v-if="rpc.isConnected.value">
        <div class="row">
          <span class="label">Network:</span>
          <span class="value">{{ rpc.networkId.value }}</span>
        </div>
        <div class="row">
          <span class="label">Server Version:</span>
          <span class="value">{{ rpc.serverVersion.value }}</span>
        </div>
        <div class="row">
          <span class="label">Synced:</span>
          <span :class="['badge', rpc.isSynced.value ? 'badge-green' : 'badge-yellow']">
            {{ rpc.isSynced.value ? 'Yes' : 'Syncing...' }}
          </span>
        </div>
        <div class="row">
          <span class="label">DAA Score:</span>
          <span class="value mono">{{ rpc.virtualDaaScore.value.toString() }}</span>
        </div>
      </div>

      <div style="margin-top:12px;display:flex;gap:8px">
        <button
          v-if="!rpc.isConnected.value"
          class="btn btn-primary"
          :disabled="rpc.connectionState.value === 'connecting'"
          @click="initAndConnect"
        >
          {{ rpc.connectionState.value === 'connecting' ? 'Connecting...' : 'Connect to mainnet' }}
        </button>
        <button v-else class="btn btn-secondary" @click="handleDisconnect">Disconnect</button>
      </div>
    </div>

    <div class="card">
      <h2>Network</h2>
      <div class="row">
        <span class="label">Current:</span>
        <span class="value">{{ network.currentNetwork.value }}</span>
      </div>
      <div class="row">
        <span class="label">Available:</span>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <span
            v-for="n in network.availableNetworks"
            :key="n"
            :class="['badge', n === network.currentNetwork.value ? 'badge-green' : 'badge-gray']"
          >{{ n }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
