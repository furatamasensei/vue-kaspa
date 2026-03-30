import { createApp } from 'vue'
import { VueKaspa } from 'vue-kaspa'
import App from './App.vue'
import './style.css'

createApp(App)
  .use(VueKaspa, { network: 'mainnet', autoConnect: true })
  .mount('#app')
