<script setup lang="ts">
import { useWallet, useCrypto } from 'vue-kaspa'

const wallet = useWallet()
const crypto = useCrypto()

function formatBalance(sompi: bigint) {
  return crypto.sompiToKaspaString(sompi)
}
</script>

<template>
  <div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:20px;color:#70c7ba">Accounts</h1>

    <div v-if="!wallet.isOpen.value" class="card">
      <p style="color:#64748b">Wallet is not open. <a href="#/wallet/open" style="color:#70c7ba">Open wallet</a></p>
    </div>

    <div v-else>
      <div v-if="wallet.accounts.value.length === 0" class="card">
        <p style="color:#64748b">No accounts found.</p>
      </div>
      <div
        v-for="account in wallet.accounts.value"
        :key="account.id"
        class="card"
        :style="{ borderColor: wallet.activeAccount.value?.id === account.id ? '#70c7ba' : '#334155' }"
        style="cursor:pointer"
        @click="wallet.setActiveAccount(account.id)"
      >
        <div class="row" style="margin-bottom:8px">
          <span style="font-size:16px;font-weight:600">{{ account.name }}</span>
          <span v-if="wallet.activeAccount.value?.id === account.id" class="badge badge-green" style="margin-left:auto">Active</span>
        </div>
        <div class="label">Receive Address</div>
        <div class="value mono" style="margin-bottom:8px;color:#70c7ba">{{ account.receiveAddress }}</div>
        <div style="display:flex;gap:16px">
          <div>
            <div class="label">Mature</div>
            <div class="value mono">{{ formatBalance(account.balance.mature) }} KAS</div>
          </div>
          <div>
            <div class="label">Pending</div>
            <div class="value mono">{{ formatBalance(account.balance.pending) }} KAS</div>
          </div>
          <div>
            <div class="label">Outgoing</div>
            <div class="value mono">{{ formatBalance(account.balance.outgoing) }} KAS</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
