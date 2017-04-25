import {Loading} from './components/loading';
import React, {Component} from 'react';
import Highlight from 'react-highlight.js';
import tensorjs from 'tensorjs';
import {loadGraph} from './lib/utils';

export class OnePlus extends Component {
  constructor() {
    super();

    this.state = {
      _graph: "",
      _session: undefined,
      _result: undefined
    };

    loadGraph("/graphs/add.pb")
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
    const a = this.aInput.value;
    const b = this.bInput.value;

    const results = this.state._session.run(
      {
        a: tensorjs.intTensor(a),
        b: tensorjs.intTensor(b)
      },
      ["o"]
    );

    this.setState({
      _result: results[0]
    });
  }

  render() {
    if (!this.state._graph) {
      return <Loading message={"Downloading Graph"}/>;
    }

    if (!this.state._session) {
      return <Loading message={"Initializing Session"}/>;
    }

    const content = 'tf.add(\n' +
      '  tf.placeholder(name="a"),\n' +
      '  tf.placeholder(name="b"),\n' +
      '  name="output"\n' +
      ');';

    return (
      <div className="container">
        <div className="demoDescription">
          This demo takes two numbers as inputs and adds them.
        </div>
        <div className="demo onePlusDemo">
          <input
            type="text"
            placeholder="a"
            ref={input => {
              this.aInput = input;
            }}
            />
          +
          <input
            type="text"
            placeholder="b"
            ref={input => {
              this.bInput = input;
            }}
            />
          =
          <input
            type="text"
            value={this.state._result}
            disabled
            />
          <div>
            <a
              href="#"
              onClick={() => {
                this.compute();
              }}
              >Compute!</a>
          </div>
        </div>
        <hr/>
        <div>
          <p>
            So this is the simplest graph that we could create in tensorflow
            (that wasn't simply an identity). It takes in two tensors (a and b),
            and adds them. Fundamentally, it is equivalent to:
          </p>
          <Highlight language="python">
            {content}
          </Highlight>
          <p>
            Despite it's simplicity, we still think this demos some cool features.
            Our code is modeled as a compiled TensorFlow core and a thin JS wrapper.
            To communicate between the two, we use strings encoding protobufs (which
            can be encoded and decoded on either side). On load, we download the
            file add_graph.pb, which encodes the graph described above. Then we
            send this file over to our compiled assembly code which constructs a
            session. Then we encode both numbers as tensors and send those over
            to the graph to compute the result, which is encoded as a tensor protobuf
            and sent back to the wrapper where it is decoded and shown to the user.
          </p>
          <p>
            Inputs -> Encoded as Tensor Protobufs -> (Sent to Compiled JS) ->
            Decoded into Tensors -> Run Through Compute Graph to get Results ->
            Results Encoded as Tensor Protobufs -> (Sent back to HandWritten JS) ->
            Decoded as Values
          </p>
        </div>
      </div>
    );
  }
}

OnePlus.propTypes = {
  lib: React.PropTypes.object.isRequired
};
