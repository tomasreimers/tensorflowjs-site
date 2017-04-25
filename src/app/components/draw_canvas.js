import Immutable from 'immutable';
import React, {Component} from 'react';

/* eslint babel/new-cap: 0 */

export class DrawCanvas extends Component {
  constructor() {
    super();

    this.state = {
      _lines: Immutable.List([]),
      _paint: false
    };
  }

  getCanvas() {
    return this._canvas;
  }

  clearCanvas() {
    this.setState({
      _lines: this.state._lines.clear()
    }, () => {
      if (this.props.onChange) {
        this.props.onChange();
      }
    });
  }

  redrawCanvas() {
    const context = this._canvas.getContext('2d');

    // clear the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillStyle = "#000000";
    context.fillRect(0, 0, this._canvas.width, this._canvas.height);

    // repaint the canvas
    context.strokeStyle = "#FFFFFF";
    context.lineJoin = "round";
    context.lineWidth = 20;

    const lines = this.state._lines.toJS();

    // check for the empty state
    if (lines.length === 0) {
      context.font = '20px sans-serif';
      context.textAlign = "center";
      context.fillStyle = "#666666";
      context.fillText('Draw Here!', 100, 100);
    }

    for (let ii = 0; ii < lines.length; ii++) {
      const line = lines[ii];

      if (line.length === 0) {
        continue;
      }

      context.beginPath();
      for (let jj = 0; jj < line.length; jj++) {
        if (jj === 0) {
          context.moveTo(line[jj][0], line[jj][1]);
        } else {
          context.lineTo(line[jj][0], line[jj][1]);
        }
      }
      context.moveTo(line[0][0], line[0][1]);
      context.closePath();
      context.stroke();
    }
  }

  handleMouseMove(e) {
    if (this.state._paint) {
      const mouseX = e.pageX - this._canvas.offsetLeft;
      const mouseY = e.pageY - this._canvas.offsetTop;

      this.setState({
        _lines: this.state._lines.update(-1, line => {
          return line.push([mouseX, mouseY]);
        })
      });
    }
  }

  componentDidUpdate() {
    this.redrawCanvas();
  }

  componentDidMount() {
    this.redrawCanvas();
  }

  render() {
    return (
      <div>
        <canvas
          height={200}
          width={200}
          onMouseDown={e => {
            this.setState({
              _lines: this.state._lines.push(Immutable.List([])),
              _paint: true
            });
          }}
          onMouseUp={e => {
            this.setState({
              _paint: false
            });
            if (this.props.onChange) {
              this.props.onChange();
            }
          }}
          onMouseLeave={e => {
            this.setState({
              _paint: false
            });
            if (this.props.onChange) {
              this.props.onChange();
            }
          }}
          onMouseMove={this.handleMouseMove.bind(this)}
          className="drawCanvas"
          ref={c => {
            this._canvas = c;
          }}
          />
        <div>
          <a href="#" onClick={this.clearCanvas.bind(this)}>Clear</a>
        </div>
      </div>

    );
  }
}

DrawCanvas.propTypes = {
  onChange: React.PropTypes.function
};
