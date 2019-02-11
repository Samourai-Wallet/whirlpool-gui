import ifNot from 'if-not-running';
import backendService from './backendService';

const REFRESH_RATE = 10000;
class WalletService {
  constructor () {
    this.setState = undefined
    this.state = undefined
    this.refreshTimeout = undefined
  }

  init (state, setState) {
    ifNot.run('walletService:init', () => {
      this.setState = setState
      if (this.state === undefined) {
        console.log('wallet: init...')
        if (state !== undefined) {
          console.log('wallet: load', Object.assign({}, state))
          this.state = state
        }
      } else {
        console.log('wallet: already initialized')
      }
    })
    if (this.refreshTimeout === undefined) {
      this.refreshTimeout = setInterval(this.fetchWallet.bind(this), REFRESH_RATE)
    }
  }

  start() {
    backendService.mix.start()
  }

  stop() {
    backendService.mix.stop()
  }

  // wallet

  isWalletLoaded () {
    return this.state !== undefined && this.state.wallet !== undefined
  }

  getUtxosDeposit () {
    if (!this.isWalletLoaded()) {
      console.error('getUtxosDeposit() but not loaded!')
      return []
    }
    return this.state.wallet.deposit.utxos;
  }

  getUtxosPremix () {
    if (!this.isWalletLoaded()) {
      console.error('getUtxosPremix() but not loaded!')
      return []
    }
    return this.state.wallet.premix.utxos;
  }

  getUtxosPostmix () {
    if (!this.isWalletLoaded()) {
      console.error('getUtxosPostmix() but not loaded!')
      return []
    }
    return this.state.wallet.postmix.utxos;
  }

  getBalanceDeposit () {
    if (!this.isWalletLoaded()) {
      console.error('getBalanceDeposit() but not loaded!')
      return []
    }
    return this.state.wallet.deposit.balance
  }

  getBalancePremix () {
    if (!this.isWalletLoaded()) {
      console.error('getBalancePremix() but not loaded!')
      return []
    }
    return this.state.wallet.premix.balance
  }

  getBalancePostmix () {
    if (!this.isWalletLoaded()) {
      console.error('getBalancePostmix() but not loaded!')
      return []
    }
    return this.state.wallet.postmix.balance
  }

  fetchWallet () {
    return ifNot.run('walletService:fetchWallet', () => {
      // fetchWallet backend
      return backendService.wallet.fetchUtxos().then(wallet => {
        // set state
        if (this.state === undefined) {
          console.log('walletService: initializing new state')
          this.state = {
            wallet: wallet
          }
        } else {
          console.log('walletService: updating existing state', Object.assign({}, this.state))
          this.state.wallet = wallet
        }
        this.pushState()
      })
    })
  }

  // deposit

  fetchDepositAddress (increment=false) {
    return backendService.wallet.fetchDeposit(increment).then(depositResponse => {
      const depositAddress = depositResponse.depositAddress
      return depositAddress;
    })
  }

  fetchDepositAddressDistinct(distinctAddress, increment=false) {
    return this.fetchDepositAddress(increment).then(depositAddress => {
      if (depositAddress === distinctAddress) {
        return this.fetchDepositAddressDistinct(distinctAddress, true).then(distinctDepositAddress => {
          return distinctDepositAddress
        })
      }
      return depositAddress;
    })
  }

  pushState () {
    this.setState(this.state)
  }
}

const walletService = new WalletService()
export default walletService
