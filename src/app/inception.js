import {Loading} from './components/loading';
import {LoadingAnimation} from './components/loading_animation.js';
import _ from 'lodash';
import React, {Component} from 'react';
import Highlight from 'react-highlight.js';
import tensorjs from 'tensorjs';
import {loadGraph, loadText, loadGraphAsArrayBuffer, topK} from './lib/utils';
const InceptionWorker = require("worker-loader!./workers/inception_webworker.js");

const INCEPTION_IMG_SQ_SIZE = 299;

export class Inception extends Component {
  constructor() {
    super();

    this.state = {
      // using bool (instead of str of graph) b/c graph too big to store in memory
      _webworker: false,
      _webworkerLoaded: false,
      _results: undefined,
      _loadingResults: false,
      _imgWidth: INCEPTION_IMG_SQ_SIZE,
      _imgHeight: INCEPTION_IMG_SQ_SIZE,
      _noWebworkers: false,
      _labels: false
    };

    // set up the webworker
    if (!window.Worker) {
      // NOTE: Mutating state directly b/c not mounted yet... so setState is a no-op
      this.state._noWebworkers = true; // eslint-disable-line react/no-direct-mutation-state
      return;
    }

    const inceptionWorker = new InceptionWorker();
    inceptionWorker.onmessage = e => {
      console.log("Recieved Message from Worker:", e);
      if (e.data.type === "DONE_INIT") {
        this.setState({
          _webworkerLoaded: true
        });
      } else if (e.data.type === "COMPUTE_RESPONSE") {
        const topLabels = topK(e.data.data[0][0], 5);
        const topLabelsWithText = _.map(topLabels, label => {
          const textLabel = this.state._labels[label[0]];
          return ([textLabel]).concat(label);
        });

        this.setState({
          _loadingResults: false,
          _results: topLabelsWithText
        });
      }
    };

    this.state._webworker = inceptionWorker; // eslint-disable-line react/no-direct-mutation-state

    // set up the graph labels
    loadText("/graphs/inception_labels.txt")
      .then(labels => {
        this.setState({
          _labels: labels.split("\n")
        });
      });
  }

  willBeUnmounted() {
    if (this.state._webworker) {
      this.state._webworker.terminate();
    }
  }

  compute(url) {
    const img = new Image();
    img.onload = () => {
      // create the image
      this.setState({
        _imgWidth: img.width,
        _imgHeight: img.height
      });
      this._origCanvas.getContext('2d').drawImage(img, 0, 0);

      // resize the image
      let top = 0;
      let left = 0;
      let size = 0;

      if (img.width > img.height) {
        size = img.height;
        left = (img.width - img.height) / 2;
      } else {
        size = img.width;
        top = (img.height - img.width) / 2;
      }

      const resizedContext = this._resizedCanvas.getContext('2d');
      resizedContext.imageSmoothingEnabled = true;
      resizedContext.mozImageSmoothingEnabled = true;
      resizedContext.webkitImageSmoothingEnabled = true;
      resizedContext.msImageSmoothingEnabled = true;

      resizedContext.drawImage(this._origCanvas, left, top, size, size, 0, 0, INCEPTION_IMG_SQ_SIZE, INCEPTION_IMG_SQ_SIZE);

      // print the data
      this._origImg.src = this._origCanvas.toDataURL();
      this._resizedImg.src = this._resizedCanvas.toDataURL();

      // get tensor
      const imageData = resizedContext.getImageData(
        0,
        0,
        this._resizedCanvas.width,
        this._resizedCanvas.height
      );

      const imageDataArray = this.props.lib.image_ops.get_array(imageData, false, 128, 128);

      // fetch results
      console.log("Sending compute request...");
      this.setState({
        _loadingResults: true
      });

      this.state._webworker.postMessage({
        type: "COMPUTE_REQUEST",
        data: tensorjs.floatTensorAB(imageDataArray)
      });
    };
    img.src = url;
  }

  loadLocalImage() {
    // load image
    const reader = new FileReader();
    reader.onload = event => {
      this.compute(event.target.result);
    };

    reader.readAsDataURL(this._fileUpload.files[0]);
  }

  render() {
    // check all preconditions
    if (this.state._noWebworkers) {
      return <Loading message={"This demo requires webworkers..."}/>;
    }

    if (!this.state._webworkerLoaded) {
      return <Loading message={"Setting up WebWorker..."}/>;
    }

    if (!this.state._labels) {
      return <Loading message={"Fetching Labels..."}/>;
    }

    // compute results
    let results;
    if (this.state._loadingResults) {
      results = <LoadingAnimation/>;
    } else {
      let resultsArray;
      if (this.state._results) {
        resultsArray = _.map(this.state._results, result => {
          return (
            <div className="dataResult" key={result[1]}>
              "{result[0]}" <span className="quiet">(confidence: {result[2].toFixed(4)})</span>
            </div>
          );
        });
      }

      results = (
        <div className="dataResults">
          {resultsArray}
        </div>
      );
    }

    // create image buttons
    const preloadedImages = [
      "/data/apple.png",
      "/data/airplane.jpg",
      "/data/baseball.jpg",
      "/data/burger.jpg",
      "/data/dog.jpg"
    ];

    const preloadedImageButtons = _.map(preloadedImages, img => {
      return (
        <div
          key={img}
          className="preloadedImageButton"
          onClick={() => {
            this.compute(img);
          }}
          style={{backgroundImage: `url(${img})`}}
          ></div>
      );
    });

    return (
      <div className="container">
        <canvas
          width={this.state._imgWidth}
          height={this.state._imgHeight}
          style={{display: "none"}}
          ref={r => {
            this._origCanvas = r;
          }}
          />
        <canvas
          width={INCEPTION_IMG_SQ_SIZE}
          height={INCEPTION_IMG_SQ_SIZE}
          style={{display: "none"}}
          ref={r => {
            this._resizedCanvas = r;
          }}
          />
        <div className="demoDescription">
          This demo labels images.
        </div>
        <div className="demo">
          <div className="panels">
            <div className="panel">
              <div className="title">Select Image</div>
              {preloadedImageButtons}
              <p>Or upload your own...</p>
              <input
                type="file"
                onChange={this.loadLocalImage.bind(this)}
                ref={i => {
                  this._fileUpload = i;
                }}
                />
            </div>
            <div className="panel">
              <div className="title">Original Image</div>
              <img
                style={{maxWidth: "100%"}}
                ref={r => {
                  this._origImg = r;
                }}
                />
              <div className="title">Cropped &amp; Resized Image</div>
              <img
                style={{maxWidth: "100%"}}
                ref={r => {
                  this._resizedImg = r;
                }}
                />
            </div>
            <div className="panel">
              <div className="title">Results</div>
              {results}
            </div>
          </div>
        </div>
        <hr/>
        <p>
          This demo is different than the others because the scale of the graph.
          Inception is Google's image recognition net, and is 27 layers deep with
          91MiB of weights. In order to not block the render thread of the browser
          while computing results, on load we spin up a webworker. When you select
          an image to categorize, it is turned into a multidimensional array, which
          is then passed to the webworker to compute.
        </p>
        <p className="note">
          NOTE: You may notice that if the top five labels include labels with extremily
          low confidence (&lt;0.01) this graph outputs different labels than those produced
          by the <a href="https://github.com/tensorflow/tensorflow/tree/master/tensorflow/examples/label_image">label_image demo</a> provided
          by <a href="https://www.tensorflow.org/tutorials/image_recognition">Google</a> (which uses the exact same graph
          as this). This is because the inception requires images of exactly 299px by 299px. To achieve this, Google's demo
          uses <a href="https://github.com/tensorflow/tensorflow/blob/master/tensorflow/examples/label_image/main.cc#L120">bilinear downsampling</a> while we
          use the built in browser canvas <a href="http://entropymine.com/resamplescope/notes/browsers/">downscaling algorithms</a>, which means we have slightly
          different input images.
        </p>
      </div>
    );
  }
}

Inception.propTypes = {
  lib: React.PropTypes.object.isRequired
};
