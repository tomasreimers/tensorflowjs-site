import React, {Component} from 'react';

export class DownloadWarning extends Component {
  render() {
    return (
      <div className="container">
        <div className="centeredContainer">
          <div className="centeredContainerTitle">
            Warning!
          </div>

          This library is still under active development, and is still enormous in size.
          The demos on this site can download anywhere between 30-100MiB to your browser
          (you try compiling 1M+ lines of C++ into Javascript). Consider
          this if you are on a roaming or mobile connection.

          <div className="centeredContainerButton">
            <a onClick={() => this.props.downloadLib()} href="#">
              I understand the risks, let's go!
            </a>
          </div>
        </div>
      </div>
    );
  }
}

DownloadWarning.propTypes = {
  downloadLib: React.PropTypes.func.isRequired
};
