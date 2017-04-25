import React, {Component} from 'react';

export class Splash extends Component {
  render() {
    return (
      <div className="splash-page">
        <div className="container">
          <div className="splash-top">
            <span className="splash-text">
              Run TensorFlow in the Browser. <span className="loud">Literally</span>.
            </span>
          </div>
          <div className="splash-panels panels">
            <div className="panel">
              <img src="/images/js_icon.png" height="40" width="40" alt="logo"/>
              <div className="panel-body">
                <div className="bold">Pure Javascript. </div>
                TensorFlow.js is a (lightly modified) fork of TensorFlow that
                <a href="http://kripken.github.io/emscripten-site/"> compiles </a>
                into pure javascript. Running it in the browser relies on no
                external dependencies or browser plugins.
              </div>
            </div>
            <div className="panel">
              <img src="/images/tf_icon.png" height="40" width="40" alt="logo"/>
              <div className="panel-body">
                <div className="bold">(Interoperable) Machine Learning. </div>
                TensorFlow.js is the same, old TensorFlow that you're used to.
                Train your model however you want. Export the graph. Use the graph
                protobuf directly in the browser. Checkout the demos above!
              </div>
            </div>
            <div className="panel">
              <img src="/images/git_icon.png" height="40" width="40" alt="logo"/>
              <div className="panel-body">
                <div className="bold">Open Source. </div>
                We're 100% open source. We encourage you to build on us and extend the work we've done thus far. <a href="https://github.com/tomasreimers/tensorflow-emscripten">Fork us on Github</a>!
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
