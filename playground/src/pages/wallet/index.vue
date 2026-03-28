<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useWallet } from 'vue-kaspa'

const wallet = useWallet()
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Wallet API</h1>
    <div class="card">
      <h2>Status</h2>
      <div class="row">
        <span class="badge" :class="{
          'badge-green': wallet.walletStatus.value === 'open',
          'badge-yellow': wallet.walletStatus.value === 'opening',
          'badge-gray': wallet.walletStatus.value === 'closed' || wallet.walletStatus.value === 'uninitialized',
          'badge-red': wallet.walletStatus.value === 'error',
        }">{{ wallet.walletStatus.value }}</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px">
      <RouterLink to="/wallet/create" class="nav-card">Create Wallet</RouterLink>
      <RouterLink to="/wallet/open" class="nav-card">Open Wallet</RouterLink>
      <RouterLink to="/wallet/accounts" class="nav-card">Accounts</RouterLink>
      <RouterLink to="/wallet/send" class="nav-card">Send</RouterLink>
      <RouterLink to="/wallet/history" class="nav-card">History</RouterLink>
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
