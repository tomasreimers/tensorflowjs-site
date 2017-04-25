import {DownloadWarning} from './download_warning.js';
import {Loading} from './loading.js';
import React, {Component} from 'react';

export class LibLoader extends Component {
  render() {
    if (this.props.lib) {
      // requires an uppercase variable name *facepalm*
      const ToRender = this.props.wraps;
      return <ToRender lib={this.props.lib}/>;
    }

    if (this.props.downloadingLib) {
      return <Loading message={"Downloading & Initializing TensorFlow.js"}/>;
    }

    return <DownloadWarning downloadLib={this.props.downloadLib}/>;
  }
}

LibLoader.propTypes = {
  wraps: React.PropTypes.func.isRequired,
  downloadLib: React.PropTypes.func.isRequired,
  downloadingLib: React.PropTypes.bool.isRequired,
  lib: React.PropTypes.object
};
