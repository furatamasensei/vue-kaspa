<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useRpc } from 'vue-kaspa'

const rpc = useRpc()
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">RPC API</h1>
    <div class="card">
      <h2>Status</h2>
      <p style="color:#94a3b8;margin-bottom:12px">Connection: {{ rpc.connectionState.value }}</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px">
      <RouterLink to="/rpc/info" class="nav-card">Node Info</RouterLink>
      <RouterLink to="/rpc/block" class="nav-card">Get Block</RouterLink>
      <RouterLink to="/rpc/balance" class="nav-card">Balance Checker</RouterLink>
      <RouterLink to="/rpc/mempool" class="nav-card">Mempool Viewer</RouterLink>
      <RouterLink to="/rpc/fees" class="nav-card">Fee Estimate</RouterLink>
      <RouterLink to="/rpc/events" class="nav-card">Live Event Log</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.nav-card {
  display:block;background:#1e293b;border:1px solid #334155;border-radius:8px;
  padding:20px;text-decoration:none;color:#e2e8f0;font-size:14px;font-weight:500;
  text-align:center;transition:all 0.15s;
}
.nav-card:hover { border-color:#70c7ba;color:#70c7ba; }
</style>
