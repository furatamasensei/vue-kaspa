<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Cryptography</h1>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px">
      <RouterLink to="/crypto/keys" class="nav-card">Key Generator</RouterLink>
      <RouterLink to="/crypto/address" class="nav-card">Address Deriver</RouterLink>
      <RouterLink to="/crypto/sign" class="nav-card">Message Signer</RouterLink>
      <RouterLink to="/crypto/convert" class="nav-card">Unit Converter</RouterLink>
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
