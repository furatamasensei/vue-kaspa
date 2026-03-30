import { createApp } from 'vue'
import { VueKaspa } from 'vue-kaspa'
import 'vue-kaspa/style'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './assets/index.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('./pages/index.vue') },
    { path: '/rpc', component: () => import('./pages/rpc/index.vue') },
    { path: '/rpc/info', component: () => import('./pages/rpc/GetInfo.vue') },
    { path: '/rpc/block', component: () => import('./pages/rpc/GetBlock.vue') },
    { path: '/rpc/balance', component: () => import('./pages/rpc/BalanceChecker.vue') },
    { path: '/rpc/mempool', component: () => import('./pages/rpc/MempoolViewer.vue') },
    { path: '/rpc/fees', component: () => import('./pages/rpc/FeeEstimate.vue') },
    { path: '/rpc/events', component: () => import('./pages/rpc/EventLog.vue') },
    { path: '/utxo', component: () => import('./pages/utxo/index.vue') },
    { path: '/utxo/tracker', component: () => import('./pages/utxo/UtxoTracker.vue') },
    { path: '/utxo/send', component: () => import('./pages/utxo/TransactionBuilder.vue') },
    { path: '/crypto', component: () => import('./pages/crypto/index.vue') },
    { path: '/crypto/keys', component: () => import('./pages/crypto/KeyGenerator.vue') },
    { path: '/crypto/address', component: () => import('./pages/crypto/AddressDeriver.vue') },
    { path: '/crypto/sign', component: () => import('./pages/crypto/MessageSigner.vue') },
    { path: '/crypto/convert', component: () => import('./pages/crypto/UnitConverter.vue') },
    { path: '/network', component: () => import('./pages/network/index.vue') },
    { path: '/wallet', component: () => import('./pages/wallet/index.vue') },
  ],
})

const app = createApp(App)
app.use(router)
app.use(VueKaspa, {
  network: 'mainnet',
  autoConnect: true,
  devtools: true,
})
app.mount('#app')
