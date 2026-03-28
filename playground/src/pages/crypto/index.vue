<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">Cryptography</h1>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <RouterLink
        v-for="item in [
          { label: 'Key Generator', to: '/crypto/keys' },
          { label: 'Address Deriver', to: '/crypto/address' },
          { label: 'Message Signer', to: '/crypto/sign' },
          { label: 'Unit Converter', to: '/crypto/convert' },
        ]"
        :key="item.to"
        :to="item.to"
        class="flex items-center justify-center rounded-lg border border-border bg-card px-4 py-5 text-sm font-medium text-card-foreground transition-colors hover:border-primary/50 hover:text-primary no-underline text-center"
      >
        {{ item.label }}
      </RouterLink>
    </div>
  </div>
</template>
