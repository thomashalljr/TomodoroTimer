import React from "react";
import { Link } from "react-router-dom";

var intervalWorker;

class TomodoroTimer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      timeCountingDown: this.props.initialTime * 60 * 1000,
      running: false,
      customTimer: null
    };

    this.handleCustomTimeChange = this.handleCustomTimeChange.bind(this);
  }

  handleCustomTimeChange(event) {
    // Only allow input up to two numbers
    event.target.value = event.target.value.slice(0,event.target.maxLength);
    this.setState({customTimer: event.target.value});
  }

  componentDidMount() {
    var self = this;
    intervalWorker = new Worker("javascripts/workers/intervalWorker.js");

    document.getElementById("updateButton").addEventListener("click", function(evt) {
      evt.preventDefault();
      var initialTime = self.state.customTimer;

      if (initialTime != "" && initialTime > 0 && initialTime < 60) {
        self.setState({ timeCountingDown: initialTime * 60 * 1000 });
      } else if (initialTime < 1) {
        alert("Please enter time of 1 or more minutes.");
      } else if (initialTime > 59) {
        alert("Please enter time less than one hour.");
      }
    });

    document.getElementById("playPauseButton").addEventListener("click", function(evt) {
      evt.preventDefault();
      document.getElementById("alarm").play();
      document.getElementById("alarm").pause();
      self.setPlayPauseButtonText();

      if (!self.state.running) {
        intervalWorker.postMessage("setInterval");
        self.setState({ running: true });
      } else {
        intervalWorker.postMessage("clearInterval");
        self.setState({ running: false });
      }
    });

    intervalWorker.addEventListener("message", function(event) {
      self.elapseTime();
    });
  }

  componentWillUnmount() {
    intervalWorker.postMessage("clearInterval");
  }

  elapseTime() {
    this.setState({ timeCountingDown: this.minusTime() });

    if (this.state.timeCountingDown == 0) {
      document.getElementById("alarm").play();
      intervalWorker.postMessage("clearInterval");
      this.setPlayPauseButtonText();

      var initialTime = this.state.customTimer;

      if (initialTime != "") {
        this.setState({ timeCountingDown: initialTime * 60 * 1000 });
      } else {
        this.setState({ timeCountingDown: this.props.initialTime * 60 * 1000 });
      }

      if (!this.state.running) {
        this.setState({ running: true });
      } else {
        this.setState({ running: false });
      }
    }
  }

  minusTime() {
    return this.state.timeCountingDown - 1000;
  }

  setPlayPauseButtonText() {
    var playPauseButton = document.getElementById("playPauseButton");
    var playPauseButtonText = playPauseButton.textContent;

    if (playPauseButtonText == "Start") {
      playPauseButton.textContent = "Stop";
    } else {
      playPauseButton.textContent = "Start";
    }
  }

  render() {
    return (
      <div id="customContainer">
        <div className="container">
          <form name="customTimer">
            <div className="row">
              <div className="col-sm">
                <label>How many minutes for timer?</label>
              </div>
            </div>
            <div className="row justify-content-md-center" id="updateAndPlay">
              <div className="col-sm-auto">
                <input type="number" id="initialTime" min="1" maxLength="2" value={this.state.value} onChange={this.handleCustomTimeChange} />
              </div>
              <div className="col-sm-auto">
                <button id="updateButton">Update</button>
              </div>
              <div className="col-sm-auto">
                <button id="playPauseButton">Start</button>
              </div>
            </div>
          </form>
          <div className="row">
            <div className="col-sm" id="timeElapsed">{moment.utc(this.state.timeCountingDown).format("mm:ss")}</div>
          </div>
        </div>
        <audio id="alarm" src="./audio/alarm.mp3" preload="auto" type="audio/mpeg" />
      </div>
    );
  }
}

export default () => (
  <div className="app">
    { React.createElement(TomodoroTimer, { initialTime: 25, restingTime: 1 }) }
  </div>
);
