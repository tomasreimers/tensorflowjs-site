import React, {Component} from 'react';

export class Header extends Component {
  render() {
    const tabs = [];
    for (let ii = 0; ii < Object.keys(this.props.pages).length; ii++) {
      const tabName = Object.keys(this.props.pages)[ii];

      let cn = "";
      if (tabName === this.props.currentPage) {
        cn = "active-tab";
      }

      tabs.push(
        <a key={tabName} className={cn} onClick={() => this.props.changePage(tabName)} href="#">{tabName}</a>
      );
    }

    return (
      <div className="header">
        <div className="header-left">
          <img src="/images/tf.jpg" height="40" width="40" alt="logo"/>.js
        </div>
        <div className="header-right">
          {tabs}
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  changePage: React.PropTypes.func.isRequired,
  currentPage: React.PropTypes.string.isRequired,
  pages: React.PropTypes.object.isRequired
};
