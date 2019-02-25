// @flow
import React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';

export default class AbstractModal extends React.PureComponent {
  constructor(props, dialogClassName, initialState={}) {
    super(props)

    this.dialogClassName = dialogClassName

    initialState.loading = undefined
    initialState.error = undefined
    this.state = initialState

    this.setLoading = this.setLoading.bind(this)
    this.setError = this.setError.bind(this)
  }

  loading(loadingMessage, promise) {
    this.state.loading = loadingMessage
    this.state.error = undefined

    return promise.then(result => this.setLoading(false)).catch(error => this.setError(error.message))
  }

  setLoading(loadingMessage) {
    this.setState({
      loading: loadingMessage
    })
    console.log('setLoading:'+loadingMessage)
  }

  isLoading() {
    return this.state.loading
  }

  isError() {
    return this.state.error
  }

  setError(errorMessage) {
    this.setState({
      loading: false,
      error: errorMessage
    })
  }

  renderTitle() {
    // to be overriden
    return <div/>
  }

  renderBody() {
    // to be overriden
    return <div/>
  }

  renderButtons() {
    // to be overriden
    return <div/>
  }

  render() {
    return (
      <Modal show={true} onHide={this.props.onClose} dialogClassName={this.dialogClassName}>
        <Modal.Header>
          <Modal.Title>{this.renderTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderBody()}
        </Modal.Body>
        <Modal.Footer>
          {this.state.loading && <div className="modal-status">
            <div className="spinner-border spinner-border-sm" role="status"/> {this.state.loading}
          </div>}
          {!this.state.loading && this.state.error && <div className="modal-status">
            <Alert variant='danger'>{this.state.error}</Alert>
          </div>}
          <Button variant="secondary" onClick={this.props.onClose}>Close</Button>
          {!this.state.loading && !this.state.error && this.renderButtons()}
        </Modal.Footer>
      </Modal>
    );
  }
}
