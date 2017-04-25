import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import TFJS from 'tfjs';

import {Header} from './app/components/header';
import {LibLoader} from './app/components/lib_loader';
import {Splash} from './app/splash';
import {Faq} from './app/faq';
import {About} from './app/about';
import {Studio} from './app/studio';
import {OnePlus} from './app/oneplus';
import {MNIST} from './app/mnist';
import {Inception} from './app/inception';

import './index.scss';

class App extends Component {
  constructor() {
    super();
    this.state = {
      _page: "Home",
      _lib: undefined,
      _downloadingLib: false,
      _password: ""
    };
  }

  changePage(page) {
    this.setState({
      _page: page
    });
  }

  downloadLib() {
    this.setState({
      _downloadingLib: true
    });

    TFJS
      .for_browser('/tensorflowjs/')
      .then(lib => {
        this.setState({
          _downloadingLib: false,
          _lib: lib
        });
      });
  }

  render() {
    // "PASSWORD PROTECTED"
    // NOTE: This isn't meant to be secure, it's meant to deter a passerby
    const password = "inception";
    if (this.state._password !== password) {
      return (
        <div className="centeredContainer">
          <input
            placeholder="Password..."
            value={this.state._password}
            onChange={ev => {
              this.setState({
                _password: ev.target.value
              });
            }}
            />
        </div>
      );
    }

    // ACTUAL RENDER
    const pages = {
      "Home": <Splash/>,
      "About": <About/>,
      // "FAQ": <Faq/>,
      "1 + 1": <LibLoader wraps={OnePlus} downloadLib={this.downloadLib.bind(this)} lib={this.state._lib} downloadingLib={this.state._downloadingLib}/>,
      "MNIST": <LibLoader wraps={MNIST} downloadLib={this.downloadLib.bind(this)} lib={this.state._lib} downloadingLib={this.state._downloadingLib}/>,
      "Inception v3": <LibLoader wraps={Inception} downloadLib={this.downloadLib.bind(this)} lib={this.state._lib} downloadingLib={this.state._downloadingLib}/>,
      "Studio": <Studio/>
    };

    return (
      <div>
        <Header pages={pages} currentPage={this.state._page} changePage={this.changePage.bind(this)}/>
        {pages[this.state._page]}
      </div>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);
