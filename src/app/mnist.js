import {DrawCanvas} from './components/draw_canvas.js';
import {Loading} from './components/loading';
import _ from 'lodash';
import React, {Component} from 'react';
import Highlight from 'react-highlight.js';
import tensorjs from 'tensorjs';
import {loadGraph, topK} from './lib/utils';

export class MNIST extends Component {
  constructor() {
    super();

    this.state = {
      _graph: "",
      _session: undefined,
      _results: undefined
    };

    loadGraph("/graphs/mnist.pb")
      .then(graph => {
        this.setState({
          _graph: graph
        });
        return new this.props.lib.Session(graph);
      })
      .then(sess => {
        this.setState({
          _session: sess
        });
      });
  }

  willBeUnmounted() {
    if (this.state._session) {
      this.state._session.delete();
    }
  }

  compute() {
    // resize data
    const context = this._resizedCanvas.getContext('2d');
    context.imageSmoothingEnabled = true;
    context.mozImageSmoothingEnabled = true;
    context.webkitImageSmoothingEnabled = true;
    context.msImageSmoothingEnabled = true;

    const fromCanvas = this._drawCanvas.getCanvas();

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.drawImage(
      fromCanvas,
      0,
      0,
      fromCanvas.width,
      fromCanvas.height,
      0,
      0,
      this._resizedCanvas.width,
      this._resizedCanvas.height
    );

    // get tensor
    const imageData = context.getImageData(
      0,
      0,
      this._resizedCanvas.width,
      this._resizedCanvas.height
    );

    const imageDataArray = this.props.lib.image_ops.get_array(imageData, true, 0, 255);

    // fetch results
    // note: for single return value ops (like the below), the ":0" is optional
    const results = this.state._session.run(
      {
        "Reshape:0": tensorjs.floatTensor(imageDataArray),
        "dropout:0": tensorjs.floatTensor(1.0)
      },
      ["prediction_onehot:0"]
    );

    const prediction = results[0][0];

    // pull top n and display
    this.setState({
      _results: topK(prediction, 3)
    });
  }

  render() {
    if (!this.state._graph) {
      return <Loading message={"Downloading Graph"}/>;
    }

    if (!this.state._session) {
      return <Loading message={"Initializing Session"}/>;
    }

    let results;
    if (this.state._results) {
      results = _.map(this.state._results, result => {
        return (
          <div key={result[0]}>
            {result[0]} <span className="quiet">(output: {result[1].toFixed(4)})</span>
          </div>
        );
      });
    }

    return (
      <div className="container">
        <div className="demoDescription">
          This demo recognizes handwritten digits between 0 and 9.
        </div>
        <div className="demo">
          <div className="panels">
            <div className="panel">
              <div className="title">Input (Draw Here!)</div>
              <DrawCanvas
                ref={r => {
                  this._drawCanvas = r;
                }}
                onChange={() => {
                  this.compute();
                }}
                />
            </div>
            <div className="panel">
              <div className="title">Scaled Image</div>
              <canvas
                width={28}
                height={28}
                ref={r => {
                  this._resizedCanvas = r;
                }}
                />
            </div>
            <div className="panel">
              <div className="title">Results</div>
              <div className="dataResults">
                {results}
              </div>
            </div>
          </div>
        </div>
        <hr/>
        <div>
          <p>
            This is literally just the graph from the
            TensorFlow <a href="https://www.tensorflow.org/get_started/mnist/pros">deep MNIST tutorial</a>.
            I trained it locally on my laptop, exported the graph, and put it into the browser.
          </p>
          <p className="note">
            NOTE: Because I trained it locally and kinda quickly, it may not be the best at recognizing all digits. Please be understanding.
          </p>
        </div>
      </div>
    );
  }
}

MNIST.propTypes = {
  lib: React.PropTypes.object.isRequired
};
