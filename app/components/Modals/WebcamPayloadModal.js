// @flow
import React from 'react';
import AbstractModal from './AbstractModal';
import Webcam from 'react-webcam';
import QrcodeDecoder from 'qrcode-decoder';

const qr = new QrcodeDecoder();

type Props = {};

export default class WebcamPayloadModal extends AbstractModal {
  webcamRef = React.createRef<Webcam>();
  captureInterval: IntervalID | null = null;

  constructor(props: Props) {
    const initialState = {};
    super(props, 'modal-webcam-payload', initialState);
  }

  componentDidMount() {
    this.captureInterval = setInterval(this.captureImage, 2000);
  }

  componentWillUnmount() {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
    }
  }

  captureImage = async () => {
    if (this.webcamRef.current) {
      const imageData = this.webcamRef.current.getScreenshot();

      if (imageData) {
        const result = await qr.decodeFromImage(imageData).catch(err => {
          console.log('QR code not readable: ', err);
        });

        if (result) {
          this.props.onScan(result.data);
          this.props.onClose();
        }
      }
    }
  };

  renderTitle() {
    return <span>Scan your pairing payload</span>;
  }

  renderButtons() {
    return <div />;
  }

  renderBody() {
    return (
      <div className="row">
        <div className="col-sm-12">
          Get your <strong>pairing payload</strong> from Samourai Wallet, go to <strong>Settings/Transactions/Experimental</strong>
          <div className="text-center pt-4">
            <Webcam
              ref={this.webcamRef}
              audio={false}
              width={300}
              height={300}
              screenshotQuality={1}
              screenshotFormat={'image/png'}
              videoConstraints={{
                width: 300,
                height: 300,
                facingMode: 'user'
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
