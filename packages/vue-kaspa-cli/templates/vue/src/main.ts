import { createApp } from 'vue'
import { KaspaPlugin } from 'vue-kaspa'
import App from './App.vue'
import './style.css'

createApp(App)
  .use(KaspaPlugin, { network: 'mainnet', autoConnect: true })
  .mount('#app')
