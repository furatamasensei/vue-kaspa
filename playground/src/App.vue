<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <div class="app">
    <nav class="sidebar">
      <div class="logo">⬡ vue-kaspa</div>
      <div class="nav-group">
        <div class="nav-label">Overview</div>
        <RouterLink to="/">Dashboard</RouterLink>
      </div>
      <div class="nav-group">
        <div class="nav-label">RPC</div>
        <RouterLink to="/rpc">Overview</RouterLink>
        <RouterLink to="/rpc/info">Node Info</RouterLink>
        <RouterLink to="/rpc/block">Get Block</RouterLink>
        <RouterLink to="/rpc/balance">Balance Checker</RouterLink>
        <RouterLink to="/rpc/mempool">Mempool</RouterLink>
        <RouterLink to="/rpc/fees">Fee Estimate</RouterLink>
        <RouterLink to="/rpc/events">Event Log</RouterLink>
      </div>
      <div class="nav-group">
        <div class="nav-label">Wallet</div>
        <RouterLink to="/wallet">Overview</RouterLink>
        <RouterLink to="/wallet/create">Create</RouterLink>
        <RouterLink to="/wallet/open">Open</RouterLink>
        <RouterLink to="/wallet/accounts">Accounts</RouterLink>
        <RouterLink to="/wallet/send">Send</RouterLink>
        <RouterLink to="/wallet/history">History</RouterLink>
      </div>
      <div class="nav-group">
        <div class="nav-label">Crypto</div>
        <RouterLink to="/crypto">Overview</RouterLink>
        <RouterLink to="/crypto/keys">Key Generator</RouterLink>
        <RouterLink to="/crypto/address">Address Deriver</RouterLink>
        <RouterLink to="/crypto/sign">Message Signer</RouterLink>
        <RouterLink to="/crypto/convert">Unit Converter</RouterLink>
      </div>
      <div class="nav-group">
        <div class="nav-label">Network</div>
        <RouterLink to="/network">Switcher</RouterLink>
      </div>
    </nav>
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }

.app { display: flex; height: 100vh; }

.sidebar {
  width: 200px;
  background: #1e293b;
  padding: 16px;
  overflow-y: auto;
  flex-shrink: 0;
}

.logo {
  font-size: 18px;
  font-weight: 700;
  color: #70c7ba;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #334155;
}

.nav-group { margin-bottom: 16px; }

.nav-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.sidebar a {
  display: block;
  padding: 6px 8px;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.15s;
}

.sidebar a:hover { background: #334155; color: #e2e8f0; }
.sidebar a.router-link-active { background: #0f4c75; color: #70c7ba; }

.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.card {
  background: #1e293b;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #334155;
}

.card h2 { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #f1f5f9; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}

.badge-green { background: #052e16; color: #4ade80; }
.badge-yellow { background: #422006; color: #fbbf24; }
.badge-red { background: #450a0a; color: #f87171; }
.badge-gray { background: #1e293b; color: #64748b; border: 1px solid #334155; }

.input {
  width: 100%;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 8px 12px;
  color: #e2e8f0;
  font-size: 14px;
  margin-bottom: 8px;
}

.input:focus { outline: none; border-color: #70c7ba; }

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}

.btn-primary { background: #0f4c75; color: #70c7ba; }
.btn-primary:hover { background: #1a6fa3; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary { background: #334155; color: #e2e8f0; }
.btn-secondary:hover { background: #475569; }

.mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 13px; word-break: break-all; }

.label { font-size: 12px; color: #64748b; margin-bottom: 4px; }

.value { font-size: 14px; color: #e2e8f0; }

.row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
</style>
