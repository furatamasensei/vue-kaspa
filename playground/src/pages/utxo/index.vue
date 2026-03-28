<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-primary">UTXO & Transactions</h1>
    <p class="text-muted-foreground">
      Cross-platform UTXO tracking and transaction building — no file system required.
      Works in browsers, mobile apps, and any JavaScript environment.
    </p>

    <div class="grid gap-4 md:grid-cols-2">
      <RouterLink to="/utxo/tracker">
        <Card class="hover:border-primary/50 transition-colors cursor-pointer h-full">
          <CardHeader class="pb-2">
            <CardTitle class="text-base">UTXO Tracker</CardTitle>
          </CardHeader>
          <CardContent class="text-sm text-muted-foreground">
            Subscribe to live UTXO updates for any address. Tracks balance and individual
            UTXOs reactively via <code class="text-primary">useUtxo()</code>.
          </CardContent>
        </Card>
      </RouterLink>

      <RouterLink to="/utxo/send">
        <Card class="hover:border-primary/50 transition-colors cursor-pointer h-full">
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Transaction Builder</CardTitle>
          </CardHeader>
          <CardContent class="text-sm text-muted-foreground">
            Estimate fees, build, sign, and submit transactions using
            <code class="text-primary">useTransaction()</code>. Supports hardware wallets
            and multisig via the manual sign → submit flow.
          </CardContent>
        </Card>
      </RouterLink>
    </div>
  </div>
</template>
