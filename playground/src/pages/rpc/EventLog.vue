<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRpc, type RpcEventType } from 'vue-kaspa'

const rpc = useRpc()
const filter = ref<RpcEventType | 'all'>('all')
const allTypes: Array<RpcEventType | 'all'> = [
  'all', 'blockAdded', 'virtualChainChanged', 'utxosChanged',
  'finalityConflict', 'sinkBlueScoreChanged', 'virtualDaaScoreChanged',
  'newBlockTemplate', 'syncStateChanged', 'connect', 'disconnect',
]

const filtered = computed(() =>
  filter.value === 'all'
    ? rpc.eventLog.value
    : rpc.eventLog.value.filter(e => e.type === filter.value)
)

const colorMap: Record<string, string> = {
  blockAdded: '#4ade80',
  virtualDaaScoreChanged: '#60a5fa',
  sinkBlueScoreChanged: '#818cf8',
  syncStateChanged: '#fbbf24',
  utxosChanged: '#f472b6',
  finalityConflict: '#fb923c',
  connect: '#4ade80',
  disconnect: '#f87171',
  default: '#94a3b8',
}

function colorFor(type: string) {
  return colorMap[type] ?? colorMap.default
}

import { computed } from 'vue'
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Live Event Log</h1>
    <div class="card">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="label" style="margin-bottom:0">Filter:</span>
        <button
          v-for="t in allTypes"
          :key="t"
          :class="['btn', filter === t ? 'btn-primary' : 'btn-secondary']"
          style="padding:4px 8px;font-size:12px"
          @click="filter = t"
        >{{ t }}</button>
        <button class="btn btn-secondary" style="margin-left:auto" @click="rpc.clearEventLog()">Clear</button>
      </div>
    </div>
    <div class="card">
      <div v-if="filtered.length === 0" style="color:#64748b;text-align:center;padding:24px">
        No events yet. Connect to a node and subscribe to see live events.
      </div>
      <div
        v-for="(event, i) in filtered.slice().reverse().slice(0, 100)"
        :key="i"
        style="padding:8px 0;border-bottom:1px solid #1e293b;display:flex;gap:12px;align-items:flex-start"
      >
        <span class="mono" style="color:#475569;font-size:11px;white-space:nowrap;padding-top:2px">
          {{ new Date(event.timestamp).toLocaleTimeString() }}
        </span>
        <span
          class="badge"
          :style="{ background: colorFor(event.type) + '22', color: colorFor(event.type) }"
        >{{ event.type }}</span>
        <pre class="mono" style="font-size:11px;color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:400px">{{ JSON.stringify(event.data) }}</pre>
      </div>
    </div>
  </div>
</template>
