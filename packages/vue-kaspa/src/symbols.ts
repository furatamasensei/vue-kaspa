import type { InjectionKey } from 'vue'
import type { VueKaspaOptions } from './types'

export const KASPA_OPTIONS_KEY: InjectionKey<VueKaspaOptions> =
  Symbol('kaspa:options')

// Internal singleton state is module-level; these keys are for per-app overrides
export const KASPA_INSTALLED_KEY: InjectionKey<true> = Symbol('kaspa:installed')
