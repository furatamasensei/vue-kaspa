import { ref, computed, readonly } from 'vue'
import { inject } from 'vue'
import { KASPA_OPTIONS_KEY } from '../symbols'
import { getRpcManager } from '../internal/rpc-manager'
import { AVAILABLE_NETWORKS } from '../types'
import type { VueKaspaOptions, KaspaNetwork, UseNetworkReturn } from '../types'

// Module-level network state shared across all composable instances
const _currentNetwork = ref<KaspaNetwork>('mainnet')

/** @internal DevTools only — returns the reactive network ref */
export function getCurrentNetworkRef() {
  return _currentNetwork
}

export function useNetwork(): UseNetworkReturn {
  const pluginOptions = inject<VueKaspaOptions>(KASPA_OPTIONS_KEY, {})
  const manager = getRpcManager()

  // Initialize from plugin options (first call wins)
  if (pluginOptions.network && _currentNetwork.value === 'mainnet') {
    _currentNetwork.value = pluginOptions.network
  }

  return {
    currentNetwork: readonly(_currentNetwork) as UseNetworkReturn['currentNetwork'],
    networkId: readonly(computed(() => manager.state.networkId)) as UseNetworkReturn['networkId'],
    isMainnet: computed(() => _currentNetwork.value === 'mainnet'),
    isTestnet: computed(() =>
      _currentNetwork.value === 'testnet-10' || _currentNetwork.value === 'testnet-12',
    ),
    daaScore: readonly(computed(() => manager.state.virtualDaaScore)) as UseNetworkReturn['daaScore'],

    async switchNetwork(network: KaspaNetwork): Promise<void> {
      _currentNetwork.value = network
      if (manager.state.connectionState === 'connected') {
        await manager.disconnect()
        await manager.connect({ ...pluginOptions, network })
      }
    },

    availableNetworks: AVAILABLE_NETWORKS,
  }
}
