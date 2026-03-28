<script setup lang="ts">
import { useNetwork, useRpc, type KaspaNetwork } from 'vue-kaspa'

const network = useNetwork()
const rpc = useRpc()

const networkDescriptions: Record<string, string> = {
  mainnet: 'Kaspa mainnet — production network (kaspa: prefix)',
  'testnet-10': 'Testnet v10 — public test network (kaspatest: prefix)',
  'testnet-11': 'Testnet v11 — newer public test network (kaspatest: prefix)',
  simnet: 'Simulation network — local testing',
  devnet: 'Development network — local development',
}

async function select(n: KaspaNetwork) {
  await network.switchNetwork(n)
}
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Network Switcher</h1>

    <div class="card">
      <h2>Current Network</h2>
      <div class="row" style="margin-bottom:12px">
        <span class="badge badge-green" style="font-size:14px;padding:6px 12px">{{ network.currentNetwork.value }}</span>
        <span v-if="rpc.networkId.value" class="label" style="margin-left:8px">
          ID: {{ rpc.networkId.value }}
        </span>
      </div>
      <div class="row">
        <span class="label">DAA Score:</span>
        <span class="value mono">{{ network.daaScore.value.toString() }}</span>
      </div>
    </div>

    <div class="card">
      <h2>Available Networks</h2>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div
          v-for="n in network.availableNetworks"
          :key="n"
          style="display:flex;align-items:center;gap:12px;padding:12px;background:#0f172a;border-radius:6px;cursor:pointer;border:1px solid transparent;transition:all 0.15s"
          :style="{ borderColor: n === network.currentNetwork.value ? '#70c7ba' : 'transparent' }"
          @click="select(n)"
        >
          <span
            :class="['badge', n === network.currentNetwork.value ? 'badge-green' : 'badge-gray']"
            style="min-width:100px;justify-content:center"
          >{{ n }}</span>
          <span style="color:#64748b;font-size:13px">{{ networkDescriptions[n] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
