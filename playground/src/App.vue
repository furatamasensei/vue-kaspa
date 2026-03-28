<script setup lang="ts">
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar'
import { useKaspa, useRpc } from 'vkas'
import { onMounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const kaspa = useKaspa()
const rpc = useRpc()
const route = useRoute()

onMounted(() => {
  kaspa.init().then(() => rpc.connect()).catch(() => {/* connection state handles errors */ })
})

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', to: '/' },
    ],
  },
  {
    label: 'RPC',
    items: [
      { label: 'Overview', to: '/rpc' },
      { label: 'Node Info', to: '/rpc/info' },
      { label: 'Get Block', to: '/rpc/block' },
      { label: 'Balance Checker', to: '/rpc/balance' },
      { label: 'Mempool', to: '/rpc/mempool' },
      { label: 'Fee Estimate', to: '/rpc/fees' },
      { label: 'Event Log', to: '/rpc/events' },
    ],
  },
  {
    label: 'UTXO & Transactions',
    items: [
      { label: 'Overview', to: '/utxo' },
      { label: 'UTXO Tracker', to: '/utxo/tracker' },
      { label: 'Transaction Builder', to: '/utxo/send' },
    ],
  },
  {
    label: 'Crypto',
    items: [
      { label: 'Overview', to: '/crypto' },
      { label: 'Key Generator', to: '/crypto/keys' },
      { label: 'Address Deriver', to: '/crypto/address' },
      { label: 'Message Signer', to: '/crypto/sign' },
      { label: 'Unit Converter', to: '/crypto/convert' },
    ],
  },
  {
    label: 'Network',
    items: [
      { label: 'Switcher', to: '/network' },
    ],
  },
]
</script>

<template>
  <SidebarProvider>
    <Sidebar>
      <SidebarHeader class="px-4 py-3">
        <span class="text-lg font-bold text-sidebar-primary">⬡ vkas</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup v-for="group in navGroups" :key="group.label">
          <SidebarGroupLabel>{{ group.label }}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in group.items" :key="item.to">
                <SidebarMenuButton as-child :is-active="route.path === item.to">
                  <RouterLink :to="item.to">{{ item.label }}</RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    <SidebarInset>
      <header class="flex h-12 items-center gap-2 border-b px-4">
        <SidebarTrigger />
      </header>
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
