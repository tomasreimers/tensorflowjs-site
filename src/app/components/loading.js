import {LoadingAnimation} from './loading_animation.js';
import React, {Component} from 'react';

export class Loading extends Component {
  render() {
    return (
      <div className="container">
        <div className="centeredContainer">
          <div className="centeredContainerTitle">
            Loading...
          </div>

          {this.props.message}

          <LoadingAnimation/>
        </div>
      </div>
    );
  }
}

Loading.propTypes = {
  message: React.PropTypes.string.isRequired
};
