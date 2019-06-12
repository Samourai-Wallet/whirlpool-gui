class ModalService {
  constructor () {
    this.setState = undefined
  }

  init (setState) {
    this.setState = setState
  }

  openTx0(utxo) {
    this.setState({
      modalTx0: utxo
    })
  }

  openDeposit() {
    this.setState({
      modalDeposit: true
    })
  }

  openZpub(account, zpub) {
    this.setState({
      modalZpub: {
        account,
        zpub
      }
    })
  }

  close() {
    this.setState({
      modalTx0: false,
      modalDeposit: false,
      modalZpub: false
    });
  }
}

const modalService = new ModalService()
export default modalService
