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
          {{ rpc.connectionState.value === 'connecting' ? 'Connecting...' : `Connect to ${network.currentNetwork.value}` }}
        </button>
        <button v-else class="btn btn-secondary" @click="handleDisconnect">Disconnect</button>
      </div>
    </div>

    <div class="card">
      <h2>Network</h2>
      <div v-if="rpc.connectionState.value === 'reconnecting' || rpc.connectionState.value === 'connecting'" style="margin-bottom:12px;color:#fbbf24;font-size:13px">
        Switching network...
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div
          v-for="n in network.availableNetworks"
          :key="n"
          :style="{
            padding: '10px 12px',
            borderRadius: '6px',
            border: n === network.currentNetwork.value ? '1px solid #70c7ba' : '1px solid #334155',
            background: n === network.currentNetwork.value ? '#0f2922' : '#1e293b',
            cursor: n === network.currentNetwork.value ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }"
          @click="n !== network.currentNetwork.value && network.switchNetwork(n)"
        >
          <span :class="['badge', n === network.currentNetwork.value ? 'badge-green' : 'badge-gray']">{{ n }}</span>
          <span style="font-size:13px;color:#94a3b8">{{ {
            'mainnet': 'Kaspa mainnet — production network',
            'testnet-10': 'Testnet v10 — public test network',
            'testnet-11': 'Testnet v11 — newer public test network',
            'simnet': 'Simulation network — local testing',
            'devnet': 'Development network — local development',
          }[n] ?? n }}</span>
          <span v-if="n === network.currentNetwork.value" style="margin-left:auto;font-size:12px;color:#70c7ba">current</span>
        </div>
      </div>
    </div>
  </div>
</template>
