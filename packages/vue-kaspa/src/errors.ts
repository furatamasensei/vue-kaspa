export class KaspaError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'KaspaError'
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export class KaspaNotReadyError extends KaspaError {
  constructor() {
    super('Kaspa WASM not initialized. Await useKaspa().init() first.')
    this.name = 'KaspaNotReadyError'
  }
}

export class KaspaRpcError extends KaspaError {
  constructor(method: string, cause?: unknown) {
    super(`RPC method "${method}" failed`, cause)
    this.name = 'KaspaRpcError'
  }
}

export class KaspaWalletError extends KaspaError {
  constructor(operation: string, cause?: unknown) {
    super(`Wallet operation "${operation}" failed`, cause)
    this.name = 'KaspaWalletError'
  }
}

export class KaspaCryptoError extends KaspaError {
  constructor(operation: string, cause?: unknown) {
    super(`Crypto operation "${operation}" failed`, cause)
    this.name = 'KaspaCryptoError'
  }
}
