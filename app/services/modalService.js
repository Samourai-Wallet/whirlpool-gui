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

  close() {
    this.setState({ modalTx0: false });
  }
}

const modalService = new ModalService()
export default modalService
